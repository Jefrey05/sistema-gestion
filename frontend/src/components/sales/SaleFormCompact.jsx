import { useState, useEffect } from 'react';
import { X, ShoppingCart, User, Package, Plus, Trash2, Search, Calculator, CreditCard } from 'lucide-react';
import api from '../../services/api';
import { inventoryService } from '../../services/inventoryService';
import { useCurrency } from '../../hooks/useCurrency';
import { useNotification } from '../../hooks/useNotification';
import NumberInput from '../common/NumberInput';
import Notification from '../Notification';

const SaleFormCompact = ({ onClose, onSuccess }) => {
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
  
  const [formData, setFormData] = useState({
    client_id: '',
    payment_method: 'efectivo',
    payment_reference: '',
    notes: '',
    status: 'pendiente_pago',
    paid_amount: 0,
    tax_rate: 18,
    discount_amount: 0
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
    console.log('🟢 [VENTAS COMPACT] Producto seleccionado:', product);
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

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    const discountPercent = parseFloat(formData.discount_amount) || 0;
    return subtotal * (discountPercent / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - calculateDiscount();
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
      showError('❌ Error: No se pudo crear la venta. ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find(c => c.id === parseInt(formData.client_id));

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] h-[96vh] overflow-hidden flex flex-col">
          {/* Header Compacto */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-white flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} />
              <h2 className="text-lg font-bold">Nueva Venta</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
            {/* Layout en Grid - 2 columnas principales */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-3 gap-3 h-full">
                {/* Columna Izquierda - Cliente y Productos */}
                <div className="col-span-2 space-y-3">
                  {/* Cliente */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={16} className="text-blue-600" />
                      <h3 className="text-sm font-bold">Cliente</h3>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        type="text"
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        placeholder="Buscar cliente..."
                        className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    {clientSearch && filteredClients.length > 0 && (
                      <div className="mt-1 max-h-24 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                        {filteredClients.slice(0, 5).map(client => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => handleClientSelect(client)}
                            className="w-full text-left px-2 py-1.5 text-xs hover:bg-blue-50"
                          >
                            <p className="font-semibold">{client.name}</p>
                            {client.email && <p className="text-gray-600 text-xs">{client.email}</p>}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {formData.client_id && selectedClient && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="font-bold">{selectedClient.name}</p>
                              {selectedClient.email && <p className="text-gray-600">{selectedClient.email}</p>}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleClearClient}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Agregar Productos */}
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Package size={16} className="text-green-600" />
                      <h3 className="text-sm font-bold">Agregar Productos</h3>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                          <input
                            type="text"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            placeholder="Buscar producto..."
                            className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                        
                        {productSearch && filteredProducts.length > 0 && (
                          <div className="mt-1 max-h-24 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                            {filteredProducts.slice(0, 5).map(product => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setProductSearch(product.name);
                                }}
                                className={`w-full text-left px-2 py-1.5 text-xs hover:bg-green-50 ${selectedProduct?.id === product.id ? 'bg-green-100' : ''}`}
                              >
                                <div className="flex justify-between">
                                  <span className="font-semibold">{product.name}</span>
                                  <span className="text-green-600 font-bold">{formatCurrency(product.price)}</span>
                                </div>
                                <p className="text-gray-500 text-xs">Stock: {product.stock}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <NumberInput
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                        max={selectedProduct?.stock || 999}
                        placeholder="Cant."
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleAddItem}
                      disabled={!selectedProduct}
                      className="w-full mt-2 py-1.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <Plus size={14} />
                      Agregar
                    </button>
                  </div>

                  {/* Lista de Productos */}
                  {items.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1">
                      <div className="bg-gray-100 px-3 py-2 border-b">
                        <h3 className="text-sm font-bold">Productos ({items.length})</h3>
                      </div>
                      <div className="overflow-y-auto max-h-[calc(100vh-500px)]">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-2 py-1 text-left font-bold">Producto</th>
                              <th className="px-2 py-1 text-center font-bold">Cant.</th>
                              <th className="px-2 py-1 text-right font-bold">Precio</th>
                              <th className="px-2 py-1 text-right font-bold">Total</th>
                              <th className="px-2 py-1 text-center font-bold w-8"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, index) => (
                              <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="px-2 py-1.5 font-medium">{item.product_name}</td>
                                <td className="px-2 py-1.5 text-center">{item.quantity}</td>
                                <td className="px-2 py-1.5 text-right">{formatCurrency(item.unit_price)}</td>
                                <td className="px-2 py-1.5 text-right font-bold">{formatCurrency(item.subtotal)}</td>
                                <td className="px-2 py-1.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>

                {/* Columna Derecha - Pago y Resumen */}
                <div className="space-y-3">
                  {/* Información de Pago */}
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard size={16} className="text-purple-600" />
                      <h3 className="text-sm font-bold">Pago</h3>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="block font-semibold mb-1">Estado</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                        >
                          <option value="pendiente_pago">Pendiente</option>
                          <option value="parcial">Parcial</option>
                          <option value="completada">Completada</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block font-semibold mb-1">Método</label>
                        <select
                          name="payment_method"
                          value={formData.payment_method}
                          onChange={handleChange}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                        >
                          <option value="efectivo">Efectivo</option>
                          <option value="transferencia">Transferencia</option>
                          <option value="tarjeta">Tarjeta</option>
                          <option value="cheque">Cheque</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block font-semibold mb-1">Monto Pagado</label>
                        <NumberInput
                          name="paid_amount"
                          value={formData.paid_amount}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block font-semibold mb-1">Referencia</label>
                        <input
                          type="text"
                          name="payment_reference"
                          value={formData.payment_reference}
                          onChange={handleChange}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                          placeholder="Opcional"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Configuración */}
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator size={16} className="text-orange-600" />
                      <h3 className="text-sm font-bold">Cálculos</h3>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold">Impuesto (%):</label>
                        <NumberInput
                          name="tax_rate"
                          value={formData.tax_rate}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          step="0.01"
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-lg text-center"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="font-semibold">Descuento (%):</label>
                        <input
                          type="number"
                          name="discount_amount"
                          value={formData.discount_amount === 0 ? '' : formData.discount_amount}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            setFormData({...formData, discount_amount: isNaN(val) ? 0 : val});
                          }}
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="0"
                          className="w-24 px-2 py-1.5 border border-gray-300 rounded text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resumen */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <h3 className="text-sm font-bold mb-2">Resumen</h3>
                    
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-gray-300">
                        <span>Subtotal:</span>
                        <span className="font-bold">{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      
                      <div className="flex justify-between py-1 border-b border-gray-300">
                        <span>Impuesto ({formData.tax_rate}%):</span>
                        <span className="font-bold text-blue-600">{formatCurrency(calculateTax())}</span>
                      </div>
                      
                      {formData.discount_amount > 0 && (
                        <div className="flex justify-between py-1 border-b border-gray-300">
                          <span>Descuento ({formData.discount_amount}%):</span>
                          <span className="font-bold text-red-600">-{formatCurrency(calculateDiscount())}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg px-3 mt-2 text-white">
                        <span className="font-bold">TOTAL:</span>
                        <span className="font-black text-lg">{formatCurrency(calculateTotal())}</span>
                      </div>
                      
                      {formData.paid_amount > 0 && (
                        <div className="flex justify-between py-1.5 bg-yellow-100 rounded-lg px-2 mt-2">
                          <span className="font-bold text-yellow-800">Pendiente:</span>
                          <span className="font-bold text-yellow-800">{formatCurrency(calculateTotal() - formData.paid_amount)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notas */}
                  <div>
                    <label className="block text-xs font-semibold mb-1">Notas</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="2"
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg resize-none"
                      placeholder="Notas adicionales..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-2 p-3 border-t border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || items.length === 0 || !formData.client_id}
                className="flex-1 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-bold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Crear Venta'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Notificaciones */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
          duration={3000}
        />
      )}
    </>
  );
};

export default SaleFormCompact;
