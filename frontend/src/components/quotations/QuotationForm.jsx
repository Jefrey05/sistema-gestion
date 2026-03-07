import { useState, useEffect } from 'react';
import { X, FileText, DollarSign, User, Package } from 'lucide-react';
import api from '../../services/api';
import { useNumericInput } from '../../hooks/useNumericInput';
import { useCurrency } from '../../hooks/useCurrency';
import { useNotification } from '../../hooks/useNotification';
import DetailModal from '../DetailModal';
import NumberInput from '../common/NumberInput';

const QuotationForm = ({ onClose, onSuccess }) => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [createdQuotation, setCreatedQuotation] = useState(null);

  // Hook para el campo de cantidad
  const quantityInput = useNumericInput(quantity, (value) => {
    setQuantity(value);
  });

  // Hook para manejar la moneda
  const { currencySymbol } = useCurrency();
  
  // Hook para manejar notificaciones
  const { showError } = useNotification();
  
  const [formData, setFormData] = useState({
    client_id: '',
    tax_rate: 18,
    discount_percent: 0,
    notes: '',
    terms_conditions: 'Términos y condiciones estándar',
    payment_conditions: 'Pago al contado',
    delivery_time: '5 días hábiles',
    payment_method: 'efectivo',
    items: []
  });

  useEffect(() => {
    loadClients();
    loadProducts();
  }, []);


  const loadClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) return;
    
    const product = products.find(p => p.id === parseInt(selectedProduct));
    if (!product) return;
    
    // Verificar si ya existe el producto en la lista
    const existingItemIndex = items.findIndex(item => item.product_id === product.id);
    
    if (existingItemIndex >= 0) {
      // Actualizar cantidad si ya existe
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].subtotal = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unit_price;
      setItems(updatedItems);
    } else {
      // Agregar nuevo item
      const newItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: quantity,
        unit_price: product.price,
        discount_percent: 0,
        subtotal: product.price * quantity
      };
      setItems([...items, newItem]);
    }
    
    // Resetear selección
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

  const calculateTaxAmount = () => {
    return calculateSubtotal() * (formData.tax_rate / 100);
  };

  const calculateDiscountAmount = () => {
    return calculateSubtotal() * (formData.discount_percent / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount() - calculateDiscountAmount();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      showError('Debe agregar al menos un producto a la cotización');
      return;
    }
    
    setLoading(true);

    try {
      // Preparar datos para enviar al backend
      const quotationData = {
        ...formData,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent
        }))
      };
      
      const response = await api.post('/quotations', quotationData);
      
      // Establecer los datos y mostrar el modal ANTES de llamar onSuccess
      setCreatedQuotation(response.data);
      setShowDetailModal(true);
      
      // NO llamar onSuccess inmediatamente, dejar que el modal se cierre
      // onSuccess();
    } catch (error) {
      console.error('Error creating quotation:', error);
      showError('Error al crear la cotización: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <FileText size={28} />
                Nueva Cotización
              </h2>
              <p className="text-cyan-100 mt-1">Crea una nueva cotización para tus clientes</p>
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
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
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

              {/* Tasa de Impuesto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tasa de Impuesto (%)
                </label>
                <NumberInput
                  name="tax_rate"
                  value={formData.tax_rate}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* Descuento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descuento (%)
                </label>
                <NumberInput
                  name="discount_percent"
                  value={formData.discount_percent}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* Condiciones de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condiciones de Pago
                </label>
                <input
                  type="text"
                  name="payment_conditions"
                  value={formData.payment_conditions}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* Tiempo de Entrega */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo de Entrega
                </label>
                <input
                  type="text"
                  name="delivery_time"
                  value={formData.delivery_time}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

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
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Términos y Condiciones */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Términos y Condiciones
              </label>
              <textarea
                name="terms_conditions"
                value={formData.terms_conditions}
                onChange={handleChange}
                rows="2"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              ></textarea>
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.price}
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="1"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
                      <tfoot>
                        <tr>
                          <td colSpan="3" className="px-4 py-2 text-right font-medium">Subtotal:</td>
                          <td className="px-4 py-2 font-medium">${calculateSubtotal().toFixed(2)}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="px-4 py-2 text-right font-medium">Impuesto ({formData.tax_rate}%):</td>
                          <td className="px-4 py-2 font-medium">${calculateTaxAmount().toFixed(2)}</td>
                          <td></td>
                        </tr>
                        {formData.discount_percent > 0 && (
                          <tr>
                            <td colSpan="3" className="px-4 py-2 text-right font-medium">Descuento ({formData.discount_percent}%):</td>
                            <td className="px-4 py-2 font-medium text-red-600">-${calculateDiscountAmount().toFixed(2)}</td>
                            <td></td>
                          </tr>
                        )}
                        <tr>
                          <td colSpan="3" className="px-4 py-2 text-right font-bold">Total:</td>
                          <td className="px-4 py-2 font-bold text-green-700">${calculateTotal().toFixed(2)}</td>
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
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Cotización'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Detalles */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          onSuccess(); // Llamar onSuccess cuando se cierre el modal
          onClose();
        }}
        data={createdQuotation}
        type="quotation"
      />

    </div>
  );
};

export default QuotationForm;