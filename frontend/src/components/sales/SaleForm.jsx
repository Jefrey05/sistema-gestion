import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ShoppingCart, DollarSign, User, Package } from 'lucide-react';
import api from '../../services/api';
import { inventoryService } from '../../services/inventoryService';
import { useNumericInput } from '../../hooks/useNumericInput';
import { useCurrency } from '../../hooks/useCurrency';
import { useNotification } from '../../hooks/useNotification';
import Notification from '../Notification';
import DetailModal from '../DetailModal';
import NumberInput from '../common/NumberInput';

const SaleForm = ({ onClose, onSuccess }) => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [createdSale, setCreatedSale] = useState(null);

  // Hook para el campo de cantidad
  const quantityInput = useNumericInput(quantity, (value) => {
    setQuantity(value);
  });
  
  const [formData, setFormData] = useState({
    client_id: '',
    payment_method: 'efectivo',
    payment_reference: '',
    notes: '',
    items: [],
    status: 'pendiente_pago',
    paid_amount: 0,
    tax_rate: 18, // ITBIS 18% por defecto (República Dominicana)
    discount: 0
  });

  // Hook para el campo de monto pagado
  const paidAmountInput = useNumericInput(formData.paid_amount, (value) => {
    setFormData(prev => ({ ...prev, paid_amount: value }));
  });

  // Hook para manejar la moneda
  const { currencySymbol } = useCurrency();
  
  // Hook para notificaciones
  const { notification, hideNotification, showSuccess, showError, showWarning } = useNotification();

  useEffect(() => {
    loadClients();
    loadProducts();
  }, []);

  const loadClients = useCallback(async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      // Obtener productos disponibles para venta
      const data = await inventoryService.getProducts();
      // Filtrar solo productos que se pueden vender
      const availableProducts = data.filter(product => 
        product.product_type === 'venta' || product.product_type === 'ambos'
      );
      setProducts(availableProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si se cambia el estado, ajustar el monto pagado automáticamente
    if (name === 'status') {
      let newPaidAmount = formData.paid_amount;
      
      if (value === 'completada') {
        // Si es completada, el monto pagado debe ser el total
        newPaidAmount = calculateTotal();
      } else if (value === 'pendiente_pago') {
        // Si es pendiente, el monto pagado debe ser 0
        newPaidAmount = 0;
      }
      // Si es parcial, mantener el monto actual
      
      setFormData({
        ...formData,
        [name]: value,
        paid_amount: newPaidAmount
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) {
      return;
    }
    
    const product = products.find(p => p.id === parseInt(selectedProduct));
    if (!product) return;
    
    // Validar stock disponible
    const stockAvailable = product.stock || 0;
    const currentQuantityInItems = items
      .filter(item => item.product_id === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);
    const totalRequestedQuantity = currentQuantityInItems + quantity;
    
    if (stockAvailable <= 0) {
      showError(`El producto "${product.name}" no tiene stock disponible para vender`);
      return;
    }

    if (totalRequestedQuantity > stockAvailable) {
      showError(`Stock insuficiente para "${product.name}". Disponible: ${stockAvailable}, Solicitado: ${totalRequestedQuantity}`);
      return;
    }
    
    // Verificar si ya existe el producto en la lista
    const existingItemIndex = items.findIndex(item => item.product_id === product.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].subtotal = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unit_price;
      setItems(updatedItems);
    } else {
      const newItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: quantity,
        unit_price: product.price,
        subtotal: product.price * quantity
      };
      setItems([...items, newItem]);
    }
    
    setSelectedProduct('');
    setQuantity(1);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * formData.tax_rate) / 100;
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    const discountPercent = parseFloat(formData.discount) || 0;
    return subtotal * (discountPercent / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const discount = calculateDiscount();
    return subtotal + tax - discount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      showWarning('Debe agregar al menos un producto a la venta');
      return;
    }
    
    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
      showError('No estás autenticado. Por favor, inicia sesión nuevamente.');
      return;
    }
    
    setLoading(true);

    try {
      // Preparar datos para enviar al backend
      const saleData = {
        ...formData,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        })),
        // Asegurar que el monto pagado sea correcto según el estado
        paid_amount: formData.status === 'completada' ? calculateTotal() : 
                    formData.status === 'parcial' ? formData.paid_amount : 0
      };
      
      const response = await api.post('/sales', saleData);
      
      // Establecer los datos y mostrar el modal ANTES de llamar onSuccess
      setCreatedSale(response.data);
      setShowDetailModal(true);
      
      showSuccess('Venta registrada exitosamente');
      // NO llamar onSuccess inmediatamente, dejar que el modal se cierre
      // onSuccess();
    } catch (error) {
      console.error('Error creating sale:', error);
      if (error.response?.status === 401) {
        showError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        showError('Error de conexión. Verifica que el servidor esté funcionando.');
      } else {
        showError('Error al crear la venta: ' + (error.response?.data?.detail || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <ShoppingCart size={28} />
                Nueva Venta
              </h2>
              <p className="text-emerald-100 mt-1">Registra una nueva venta de productos</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <select
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleChange}
                    required
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar cliente</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago <span className="text-red-500">*</span>
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              {/* Referencia de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referencia de Pago
                </label>
                <input
                  type="text"
                  name="payment_reference"
                  value={formData.payment_reference}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Estado de la Venta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado de la Venta <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="completada">Completada (Pago total)</option>
                  <option value="parcial">Pago Parcial</option>
                  <option value="pendiente_pago">Pendiente de Pago</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              {/* Monto Pagado (solo si es parcial) */}
              {formData.status === 'parcial' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto Pagado ({currencySymbol}) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                    <input
                      type="text"
                      value={paidAmountInput.displayValue}
                      onChange={paidAmountInput.handleChange}
                      onFocus={paidAmountInput.handleFocus}
                      onBlur={paidAmountInput.handleBlur}
                      required
                      className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Ingresa el monto que se ha pagado</p>
                </div>
              )}

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Agregar Productos */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Agregar Productos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Producto
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.price} (Stock: {product.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="text"
                    value={quantityInput.displayValue}
                    onChange={quantityInput.handleChange}
                    onFocus={quantityInput.handleFocus}
                    onBlur={quantityInput.handleBlur}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="1"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              {/* Lista de Productos */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Productos Seleccionados</h4>
                {items.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No hay productos seleccionados</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.product_name}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">${item.unit_price.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">${item.subtotal.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="3" className="px-4 py-2 text-right text-sm font-medium text-gray-700">Subtotal:</td>
                          <td className="px-4 py-2 text-sm font-semibold text-gray-900">${calculateSubtotal().toFixed(2)}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="2" className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                            <label>
                              ITBIS/IVA (%):
                              <NumberInput
                                name="tax_rate"
                                min="0"
                                max="100"
                                step="0.01"
                                value={formData.tax_rate}
                                onChange={(e) => setFormData({...formData, tax_rate: e.target.value})}
                                className="ml-2 w-20 px-2 py-1 border border-gray-300 rounded text-center"
                              />
                            </label>
                          </td>
                          <td className="px-4 py-2 text-right text-sm font-medium text-gray-700">Impuesto:</td>
                          <td className="px-4 py-2 text-sm font-semibold text-gray-900">${calculateTax().toFixed(2)}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="2" className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                            <label>
                              Descuento (%):
                              <input
                                type="number"
                                name="discount"
                                min="0"
                                max="100"
                                step="0.01"
                                value={formData.discount === 0 ? '' : formData.discount}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                  setFormData({...formData, discount: isNaN(val) ? 0 : val});
                                }}
                                placeholder="0"
                                className="ml-2 w-24 px-2 py-1 border border-gray-300 rounded text-center"
                              />
                            </label>
                          </td>
                          <td className="px-4 py-2 text-right text-sm font-medium text-gray-700">Descuento ({formData.discount}%):</td>
                          <td className="px-4 py-2 text-sm font-semibold text-red-600">-${calculateDiscount().toFixed(2)}</td>
                          <td></td>
                        </tr>
                        <tr className="border-t-2 border-gray-300">
                          <td colSpan="3" className="px-4 py-3 text-right text-lg font-bold text-gray-900">TOTAL:</td>
                          <td className="px-4 py-3 text-lg font-bold text-blue-700">${calculateTotal().toFixed(2)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Completar Venta'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
          duration={notification.duration}
        />
      )}

      {/* Modal de Detalles */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          onSuccess(); // Llamar onSuccess cuando se cierre el modal
          onClose();
        }}
        data={createdSale}
        type="sale"
      />
    </div>
  );
};

export default SaleForm;