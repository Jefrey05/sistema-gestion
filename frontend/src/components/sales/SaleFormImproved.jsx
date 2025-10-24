import { useState, useEffect } from 'react';
import { X, ShoppingCart, User, Package, Plus, Trash2, Search, Calculator, DollarSign, CreditCard } from 'lucide-react';
import api from '../../services/api';
import { inventoryService } from '../../services/inventoryService';
import { useCurrency } from '../../hooks/useCurrency';
import { useNotification } from '../../hooks/useNotification';
import NumberInput from '../common/NumberInput';
import Notification from '../Notification';

const SaleFormImproved = ({ onClose, onSuccess }) => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const { formatCurrency } = useCurrency();
  const { notification, hideNotification, showError, showSuccess } = useNotification();
  
  // Debug: Log cuando cambia notification
  useEffect(() => {
    console.log('🔔 [VENTAS] Notification state:', notification);
  }, [notification]);
  
  const [formData, setFormData] = useState({
    client_id: '',
    payment_method: 'efectivo',
    payment_reference: '',
    notes: '',
    status: 'pendiente_pago',
    paid_amount: 0,
    tax_rate: 18,
    discount: 0
  });

  useEffect(() => {
    loadClients();
    loadProducts();
  }, []);

  useEffect(() => {
    if (clientSearch.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (client.email && client.email.toLowerCase().includes(clientSearch.toLowerCase())) ||
        (client.rnc && client.rnc.includes(clientSearch))
      );
      setFilteredClients(filtered);
    }
  }, [clientSearch, clients]);

  useEffect(() => {
    if (productSearch.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(productSearch.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [productSearch, products]);

  const loadClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
      setFilteredClients(response.data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await inventoryService.getProducts();
      const availableProducts = data.filter(product => 
        (product.product_type === 'venta' || product.product_type === 'ambos') && product.stock > 0
      );
      setProducts(availableProducts);
      setFilteredProducts(availableProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'status') {
      let newPaidAmount = formData.paid_amount;
      
      if (value === 'completada') {
        newPaidAmount = calculateTotal();
      } else if (value === 'pendiente_pago') {
        newPaidAmount = 0;
      }
      
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

    // Validar stock disponible
    const stockAvailable = selectedProduct.stock || 0;
    const currentQuantityInItems = items
      .filter(item => item.product_id === selectedProduct.id)
      .reduce((sum, item) => sum + item.quantity, 0);
    const totalRequestedQuantity = currentQuantityInItems + quantity;
    
    if (stockAvailable <= 0) {
      showError(`El producto "${selectedProduct.name}" no tiene stock disponible para vender`);
      return;
    }

    if (totalRequestedQuantity > stockAvailable) {
      showError(`Stock insuficiente para "${selectedProduct.name}". Disponible: ${stockAvailable}, Solicitado: ${totalRequestedQuantity}`);
      return;
    }
    
    const existingItemIndex = items.findIndex(item => item.product_id === selectedProduct.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].subtotal = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unit_price;
      setItems(updatedItems);
    } else {
      const newItem = {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity: quantity,
        unit_price: selectedProduct.price,
        subtotal: selectedProduct.price * quantity,
        stock_available: selectedProduct.stock
      };
      setItems([...items, newItem]);
    }
    
    setSelectedProduct(null);
    setQuantity(1);
    setProductSearch('');
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleClientSelect = (client) => {
    setFormData(prev => ({ ...prev, client_id: client.id }));
    setClientSearch(client.name);
    // Cerrar la lista desplegable
    setFilteredClients([]);
  };

  const handleClearClient = () => {
    setFormData(prev => ({ ...prev, client_id: '' }));
    setClientSearch('');
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setProductSearch(product.name);
    // Cerrar la lista desplegable
    setFilteredProducts([]);
  };

  const handleClearProduct = () => {
    setSelectedProduct(null);
    setProductSearch('');
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (formData.tax_rate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - formData.discount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      showError('Debe agregar al menos un producto a la venta');
      return;
    }
    
    if (formData.status === 'completada' && formData.paid_amount < calculateTotal()) {
      showError('El monto pagado debe ser igual al total para marcar como completada');
      return;
    }
    
    // Validar stock antes de enviar
    for (const item of items) {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        const stockAvailable = product.stock || 0;
        if (item.quantity > stockAvailable) {
          showError(`Stock insuficiente para "${product.name}". Disponible: ${stockAvailable}, Solicitado: ${item.quantity}`);
          return;
        }
      }
    }
    
    setLoading(true);

    try {
      const saleData = {
        ...formData,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      };
      
      const response = await api.post('/sales', saleData);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating sale:', error);
      const errorDetail = error.response?.data?.detail || error.message || 'Error desconocido';
      showError(errorDetail);
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find(c => c.id === parseInt(formData.client_id));

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
          {/* Header Premium */}
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black flex items-center gap-3 mb-2">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <ShoppingCart size={32} />
                  </div>
                  Nueva Venta
                </h2>
                <p className="text-green-100 text-lg">Registra una nueva venta de productos</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X size={28} />
              </button>
            </div>
          </div>

          <div className="p-8 overflow-y-auto max-h-[calc(95vh-140px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sección Cliente */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="text-blue-600" size={24} />
                  Información del Cliente
                </h3>
                
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Buscar Cliente <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Buscar por nombre, email o RNC..."
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  
                  {clientSearch && filteredClients.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto bg-white border-2 border-gray-200 rounded-xl shadow-lg">
                      {filteredClients.map(client => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => handleClientSelect(client)}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                        >
                          <p className="font-semibold text-gray-900">{client.name}</p>
                          {client.email && <p className="text-sm text-gray-600">{client.email}</p>}
                          {client.rnc && <p className="text-xs text-gray-500">RNC: {client.rnc}</p>}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {formData.client_id && selectedClient && (
                    <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-bold text-gray-900">{selectedClient.name}</p>
                            {selectedClient.email && <p className="text-sm text-gray-600">{selectedClient.email}</p>}
                            {selectedClient.phone && <p className="text-sm text-gray-600">Tel: {selectedClient.phone}</p>}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearClient}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ✕ Limpiar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sección Productos */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="text-green-600" size={24} />
                  Agregar Productos
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Buscar Producto
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Buscar por nombre o SKU..."
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>
                    
                    {productSearch && filteredProducts.length > 0 && (
                      <div className="mt-2 max-h-48 overflow-y-auto bg-white border-2 border-gray-200 rounded-xl shadow-lg">
                        {filteredProducts.map(product => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => {
                              setSelectedProduct(product);
                              setProductSearch(product.name);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-0 ${
                              selectedProduct?.id === product.id ? 'bg-green-100' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{product.name}</p>
                                <p className="text-sm text-gray-600">SKU: {product.sku || 'N/A'} | Stock: {product.stock}</p>
                              </div>
                              <p className="text-sm font-bold text-green-600">{formatCurrency(product.price)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cantidad
                    </label>
                    <NumberInput
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="1"
                    />
                    {selectedProduct && (
                      <p className="text-xs text-gray-500 mt-1">Disponible: {selectedProduct.stock}</p>
                    )}
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!selectedProduct}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  <Plus size={20} />
                  Agregar Producto
                </button>
              </div>

              {/* Lista de Productos */}
              {items.length > 0 && (
                <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b-2 border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Productos en la Venta</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Producto</th>
                          <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Cantidad</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">Precio Unit.</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">Subtotal</th>
                          <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product_name}</td>
                            <td className="px-6 py-4 text-sm text-center text-gray-700">{item.quantity}</td>
                            <td className="px-6 py-4 text-sm text-right text-gray-700">{formatCurrency(item.unit_price)}</td>
                            <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">{formatCurrency(item.subtotal)}</td>
                            <td className="px-6 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Configuración y Totales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuración de Pago */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="text-purple-600" size={20} />
                      Información de Pago
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Estado de Pago
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="pendiente_pago">Pendiente de Pago</option>
                          <option value="parcial">Pago Parcial</option>
                          <option value="completada">Completada</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Método de Pago
                        </label>
                        <select
                          name="payment_method"
                          value={formData.payment_method}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="efectivo">Efectivo</option>
                          <option value="transferencia">Transferencia</option>
                          <option value="tarjeta">Tarjeta</option>
                          <option value="cheque">Cheque</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Monto Pagado
                        </label>
                        <NumberInput
                          name="paid_amount"
                          value={formData.paid_amount}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Referencia de Pago
                        </label>
                        <input
                          type="text"
                          name="payment_reference"
                          value={formData.payment_reference}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Opcional"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Totales */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calculator className="text-blue-600" size={20} />
                    Resumen de Venta
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-gray-700">Impuesto (%):</label>
                      <NumberInput
                        name="tax_rate"
                        value={formData.tax_rate}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-24 px-3 py-1 border-2 border-gray-300 rounded-lg text-center"
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-gray-700">Descuento ($):</label>
                      <NumberInput
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-32 px-3 py-1 border-2 border-gray-300 rounded-lg text-right"
                      />
                    </div>
                    
                    <div className="border-t-2 border-gray-300 pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Subtotal:</span>
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Impuesto ({formData.tax_rate}%):</span>
                        <span className="text-lg font-bold text-blue-600">{formatCurrency(calculateTax())}</span>
                      </div>
                      
                      {formData.discount > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">Descuento:</span>
                          <span className="text-lg font-bold text-red-600">-{formatCurrency(formData.discount)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl px-4 mt-4">
                        <span className="text-white font-bold text-xl">TOTAL:</span>
                        <span className="text-white font-black text-3xl">{formatCurrency(calculateTotal())}</span>
                      </div>
                      
                      {formData.paid_amount > 0 && (
                        <div className="flex justify-between items-center py-2 bg-yellow-100 rounded-lg px-4">
                          <span className="text-yellow-800 font-bold">Pendiente:</span>
                          <span className="text-yellow-800 font-bold text-xl">{formatCurrency(calculateTotal() - formData.paid_amount)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Notas adicionales sobre la venta..."
                ></textarea>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || items.length === 0 || !formData.client_id}
                  className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? 'Procesando...' : 'Crear Venta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Notificaciones */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
          duration={notification.duration}
        />
      )}
    </>
  );
};

export default SaleFormImproved;
