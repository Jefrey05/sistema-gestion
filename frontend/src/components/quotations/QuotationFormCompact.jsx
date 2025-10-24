import { useState, useEffect } from 'react';
import { X, FileText, User, Package, Plus, Trash2, Search, Calculator, Calendar } from 'lucide-react';
import api from '../../services/api';
import { useCurrency } from '../../hooks/useCurrency';
import { useNotification } from '../../hooks/useNotification';
import NumberInput from '../common/NumberInput';
import Notification from '../Notification';

const QuotationFormCompact = ({ quotationType = 'venta', quotation = null, onClose, onSuccess }) => {
  const isEditing = !!quotation;
  
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
  const { notification, hideNotification, showError } = useNotification();
  
  const [formData, setFormData] = useState({
    quotation_type: quotationType,
    client_id: quotation?.client_id || '',
    tax_rate: quotation?.tax_rate || 18,
    discount_percent: quotation?.discount_percent || 0,
    notes: quotation?.notes || '',
    terms_conditions: quotation?.terms_conditions || 'Términos y condiciones estándar',
    payment_conditions: quotation?.payment_conditions || 'Pago al contado',
    delivery_time: quotation?.delivery_time || '5 días hábiles',
    payment_method: quotation?.payment_method || 'efectivo',
    items: []
  });

  // Campos adicionales para cotizaciones de alquiler
  const [rentalFields, setRentalFields] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rental_period: 'daily',
    deposit: 0
  });

  useEffect(() => {
    loadClients();
    loadProducts();
    
    // Si estamos editando, cargar los items de la cotización
    if (quotation && quotation.items) {
      console.log('📦 Cargando items de cotización:', quotation.items);
      setItems(quotation.items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name || item.product?.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent || 0,
        subtotal: item.subtotal
      })));
    }
  }, [quotation]);

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
      console.log('📦 Cargando productos para tipo:', quotationType);
      const response = await api.get('/products');
      console.log('📦 Total productos recibidos:', response.data.length);
      
      // Filtrar productos según el tipo de cotización
      const filtered = response.data.filter(product => {
        if (quotationType === 'venta') {
          return product.product_type === 'venta' || product.product_type === 'ambos';
        } else if (quotationType === 'alquiler') {
          return product.product_type === 'alquiler' || product.product_type === 'ambos';
        }
        return true;
      });
      
      console.log('📦 Productos filtrados para', quotationType, ':', filtered.length);
      setProducts(filtered);
      setFilteredProducts(filtered);
    } catch (error) {
      console.error('❌ Error loading products:', error);
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
      showError(`El producto "${selectedProduct.name}" no tiene stock disponible`);
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
        discount_percent: 0,
        subtotal: selectedProduct.price * quantity
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
    console.log('📝 Enviando cotización...');
    
    if (items.length === 0) {
      showError('Debe agregar al menos un producto a la cotización');
      return;
    }
    
    setLoading(true);

    try {
      // Agregar información de alquiler a las notas si es cotización de alquiler
      let notesWithRentalInfo = formData.notes;
      if (quotationType === 'alquiler') {
        console.log('🏠 Agregando información de alquiler a las notas');
        const rentalInfo = `\n\n--- Información de Alquiler ---\nFecha Inicio: ${rentalFields.start_date}\nFecha Fin: ${rentalFields.end_date}\nPeriodo: ${rentalFields.rental_period}\nDepósito: ${rentalFields.deposit}`;
        notesWithRentalInfo = (formData.notes || '') + rentalInfo;
      }

      const quotationData = {
        ...formData,
        notes: notesWithRentalInfo,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent
        }))
      };
      
      console.log('📤 Datos de cotización a enviar:', quotationData);
      
      let response;
      if (isEditing) {
        // Actualizar cotización existente
        response = await api.put(`/quotations/${quotation.id}`, quotationData);
        console.log('✅ Cotización actualizada:', response.data);
      } else {
        // Crear nueva cotización
        response = await api.post('/quotations', quotationData);
        console.log('✅ Cotización creada:', response.data);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error(`❌ Error ${isEditing ? 'updating' : 'creating'} quotation:`, error);
      console.error('❌ Detalle del error:', error.response?.data);
      showError(`❌ Error: No se pudo ${isEditing ? 'actualizar' : 'crear'} la cotización. ` + (error.response?.data?.detail || error.message));
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
          <div className={`bg-gradient-to-r ${quotationType === 'alquiler' ? 'from-purple-600 to-pink-600' : 'from-purple-600 to-blue-600'} px-4 py-3 text-white flex justify-between items-center flex-shrink-0`}>
            <div className="flex items-center gap-2">
              <FileText size={20} />
              <h2 className="text-lg font-bold">
                Cotización - {quotationType === 'venta' ? 'Ventas' : 'Alquiler'}
              </h2>
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
                                <div>
                                  <div className="flex justify-between items-start">
                                    <span className="font-semibold">{product.name}</span>
                                    <span className="text-green-600 font-bold">{formatCurrency(product.price)}</span>
                                  </div>
                                  <p className="text-gray-600 mt-0.5">Stock: {product.stock || 0}</p>
                                </div>
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

                {/* Columna Derecha - Configuración y Resumen */}
                <div className="space-y-3">
                  {/* Configuración */}
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator size={16} className="text-purple-600" />
                      <h3 className="text-sm font-bold">Configuración</h3>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="block font-semibold mb-1">Impuesto (%)</label>
                        <NumberInput
                          name="tax_rate"
                          value={formData.tax_rate}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          step="0.01"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block font-semibold mb-1">Descuento (%)</label>
                        <NumberInput
                          name="discount_percent"
                          value={formData.discount_percent}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          step="0.01"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block font-semibold mb-1">Método de Pago</label>
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
                        <label className="block font-semibold mb-1">Condiciones de Pago</label>
                        <input
                          type="text"
                          name="payment_conditions"
                          value={formData.payment_conditions}
                          onChange={handleChange}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block font-semibold mb-1">Tiempo de Entrega</label>
                        <input
                          type="text"
                          name="delivery_time"
                          value={formData.delivery_time}
                          onChange={handleChange}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Campos de Alquiler (solo para cotizaciones de alquiler) */}
                  {quotationType === 'alquiler' && (
                    <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Package size={16} className="text-pink-600" />
                        <h3 className="text-sm font-bold">Datos de Alquiler</h3>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-semibold mb-1">Fecha Inicio</label>
                            <input
                              type="date"
                              value={rentalFields.start_date}
                              onChange={(e) => setRentalFields({...rentalFields, start_date: e.target.value})}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold mb-1">Fecha Fin</label>
                            <input
                              type="date"
                              value={rentalFields.end_date}
                              onChange={(e) => setRentalFields({...rentalFields, end_date: e.target.value})}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block font-semibold mb-1">Periodo</label>
                          <select
                            value={rentalFields.rental_period}
                            onChange={(e) => setRentalFields({...rentalFields, rental_period: e.target.value})}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                          >
                            <option value="daily">Diario</option>
                            <option value="weekly">Semanal</option>
                            <option value="monthly">Mensual</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block font-semibold mb-1">Depósito</label>
                          <NumberInput
                            value={rentalFields.deposit}
                            onChange={(e) => setRentalFields({...rentalFields, deposit: parseFloat(e.target.value) || 0})}
                            min="0"
                            step="0.01"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}

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
                        <span className="font-bold text-blue-600">{formatCurrency(calculateTaxAmount())}</span>
                      </div>
                      
                      {formData.discount_percent > 0 && (
                        <div className="flex justify-between py-1 border-b border-gray-300">
                          <span>Descuento ({formData.discount_percent}%):</span>
                          <span className="font-bold text-red-600">-{formatCurrency(calculateDiscountAmount())}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg px-3 mt-2 text-white">
                        <span className="font-bold">TOTAL:</span>
                        <span className="font-black text-lg">{formatCurrency(calculateTotal())}</span>
                      </div>
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
                className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-sm font-bold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50"
              >
                {loading ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Cotización' : 'Crear Cotización')}
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
          duration={notification.duration}
        />
      )}
    </>
  );
};

export default QuotationFormCompact;
