import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, User, Package, Plus, Trash2 } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import api from '../../services/api';
import { useCurrency } from '../../hooks/useCurrency';
import { useNotification } from '../../hooks/useNotification';
import NumberInput from '../common/NumberInput';

const QuotationRentalForm = ({ onClose, onSuccess }) => {
  console.log('🏠 QuotationRentalForm cargado');
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  
  // Función para obtener la fecha local en formato YYYY-MM-DD
  const getLocalDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [formData, setFormData] = useState({
    client_id: '',
    start_date: getLocalDateString(),
    end_date: '',
    payment_method: 'efectivo',
    deposit: 0,
    tax_rate: 18,
    discount_percent: 0,
    notes: ''
  });

  const { formatCurrency } = useCurrency();
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    loadClients();
    loadProducts();
    
    // Recargar productos cada 30 segundos para mantener el stock actualizado
    const interval = setInterval(() => {
      loadProducts();
    }, 30000);
    
    return () => clearInterval(interval);
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
      const data = await inventoryService.getProducts();
      const availableProducts = data.filter(product => 
        product.product_type === 'alquiler' || product.product_type === 'ambos'
      );
      setProducts(availableProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convertir a número para campos numéricos
    const numericFields = ['tax_rate', 'discount_percent', 'deposit'];
    const finalValue = numericFields.includes(name) ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0 || unitPrice <= 0) {
      showError('Selecciona un producto, cantidad y precio válidos');
      return;
    }
    
    const product = products.find(p => p.id === parseInt(selectedProduct));
    if (!product) return;
    
    const existingItemIndex = items.findIndex(item => item.product_id === product.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      setItems(updatedItems);
    } else {
      const newItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: quantity,
        unit_price: unitPrice
      };
      setItems([...items, newItem]);
    }
    
    setSelectedProduct('');
    setQuantity(1);
    setUnitPrice(0);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const calculateDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const calculateSubtotal = () => {
    const days = calculateDays();
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price * days), 0);
  };

  const calculateTaxAmount = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (formData.tax_rate / 100);
  };

  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal();
    const discountPercent = parseFloat(formData.discount_percent) || 0;
    return subtotal * (discountPercent / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTaxAmount();
    const discount = calculateDiscountAmount();
    return subtotal + tax - discount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      showError('Debe agregar al menos un producto');
      return;
    }

    if (!formData.end_date) {
      showError('Debe seleccionar una fecha de fin');
      return;
    }

    setLoading(true);

    try {
      const quotationData = {
        quotation_type: 'alquiler',
        client_id: parseInt(formData.client_id),
        tax_rate: parseFloat(formData.tax_rate) || 18,
        discount_percent: parseFloat(formData.discount_percent) || 0,
        notes: (formData.notes || '') + `\n\n--- Información de Alquiler ---\nFecha Inicio: ${formData.start_date}\nFecha Fin: ${formData.end_date}\nDepósito: ${formData.deposit}`,
        terms_conditions: 'Términos y condiciones estándar',
        payment_conditions: 'Pago al contado',
        delivery_time: '5 días hábiles',
        payment_method: formData.payment_method,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: 0
        }))
      };
      
      console.log('📤 Enviando cotización de alquiler:', quotationData);
      await api.post('/quotations', quotationData);
      showSuccess('✅ Cotización de alquiler creada exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Error creating quotation:', error);
      showError('Error al crear la cotización: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const days = calculateDays();
  const total = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Calendar size={28} />
                Nueva Cotización - Alquiler
              </h2>
              <p className="text-teal-100 mt-1">Completa la información del alquiler</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Cliente */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <User className="text-blue-600" size={20} />
                <h3 className="font-bold text-lg">Cliente</h3>
              </div>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Seleccionar cliente...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.email ? `- ${client.email}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Fechas */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="text-purple-600" size={20} />
                <h3 className="font-bold text-lg">Fechas de Alquiler</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Fecha Inicio</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Fecha Fin</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Productos */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <Package className="text-green-600" size={20} />
                <h3 className="font-bold text-lg">Productos</h3>
              </div>
              
              <div className="grid grid-cols-12 gap-3 mb-4">
                <div className="col-span-5">
                  <label className="block text-sm font-semibold mb-2">Producto</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => {
                      setSelectedProduct(e.target.value);
                      const product = products.find(p => p.id === parseInt(e.target.value));
                      if (product) setUnitPrice(product.price || 0);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Seleccionar...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - Stock: {product.stock_available}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-2">Cantidad</label>
                  <NumberInput
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-semibold mb-2">Precio/día</label>
                  <NumberInput
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2 flex items-end">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Agregar
                  </button>
                </div>
              </div>

              {/* Lista de items */}
              {items.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Productos agregados:</h4>
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <p className="font-semibold">{item.product_name}</p>
                          <p className="text-sm text-gray-600">
                            Cantidad: {item.quantity} × {formatCurrency(item.unit_price)} = {formatCurrency(item.quantity * item.unit_price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Configuración */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="text-yellow-600" size={20} />
                  <h3 className="font-bold text-lg">Pago</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Método de Pago</label>
                    <select
                      name="payment_method"
                      value={formData.payment_method}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Depósito</label>
                    <NumberInput
                      name="deposit"
                      value={formData.deposit}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                <h3 className="font-bold text-lg mb-3">Impuestos y Descuentos</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Impuesto (%)</label>
                    <NumberInput
                      name="tax_rate"
                      value={formData.tax_rate}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Descuento (%)</label>
                    <NumberInput
                      name="discount_percent"
                      value={formData.discount_percent}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-semibold mb-2">Notas</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Notas adicionales..."
              />
            </div>

            {/* Resumen */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-bold text-lg mb-3">Resumen</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Impuesto ({formData.tax_rate}%):</span>
                  <span className="font-semibold">{formatCurrency(calculateTaxAmount())}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Descuento ({formData.discount_percent}%):</span>
                  <span className="font-semibold">-{formatCurrency(calculateDiscountAmount())}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t-2 border-gray-300 pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear Cotización'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotationRentalForm;
