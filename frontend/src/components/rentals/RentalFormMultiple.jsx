import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, User, Package, Plus, Trash2 } from 'lucide-react';
import { rentalsService } from '../../services/rentalsService';
import { inventoryService } from '../../services/inventoryService';
import api from '../../services/api';
import { useCurrency } from '../../hooks/useCurrency';
import { useNotification } from '../../hooks/useNotification';
import NumberInput from '../common/NumberInput';
import Notification from '../Notification';

const RentalFormMultiple = ({ onClose, onSuccess }) => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  
  // Función para obtener la fecha local en formato YYYY-MM-DD (sin conversión a UTC)
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
    notes: ''
  });

  const { formatCurrency } = useCurrency();
  const { notification, hideNotification, showError, showSuccess } = useNotification();
  
  // Debug: Log cuando cambia notification
  useEffect(() => {
    console.log('🔔 Notification state:', notification);
  }, [notification]);

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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0 || unitPrice <= 0) {
      console.log('🔴 Error: Producto o cantidad inválidos');
      showError('Selecciona un producto, cantidad y precio válidos');
      return;
    }
    
    const product = products.find(p => p.id === parseInt(selectedProduct));
    if (!product) return;
    
    // Validar stock disponible
    const stockAvailable = product.stock_available || 0;
    const currentQuantityInItems = items.find(item => item.product_id === product.id)?.quantity || 0;
    const totalRequestedQuantity = currentQuantityInItems + quantity;
    
    console.log('📊 Validando stock:', { 
      producto: product.name, 
      stockAvailable, 
      currentQuantityInItems, 
      totalRequestedQuantity 
    });
    
    if (stockAvailable <= 0) {
      console.log('🔴 Error: Sin stock disponible');
      showError(`El producto "${product.name}" no tiene stock disponible para alquilar`);
      return;
    }
    
    if (totalRequestedQuantity > stockAvailable) {
      console.log('🔴 Error: Stock insuficiente');
      showError(`Stock insuficiente para "${product.name}". Disponible: ${stockAvailable}, Solicitado: ${totalRequestedQuantity}`);
      return;
    }
    
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

  const calculateTotal = () => {
    const days = calculateDays();
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price * days), 0);
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
      // Validar stock antes de enviar
      for (const item of items) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          const stockAvailable = product.stock_available || 0;
          if (item.quantity > stockAvailable) {
            showError(`Stock insuficiente para "${product.name}". Disponible: ${stockAvailable}, Solicitado: ${item.quantity}`);
            setLoading(false);
            return;
          }
        }
      }
      
      // Crear un alquiler por cada unidad de cada producto
      // El backend no soporta cantidades, así que creamos múltiples registros
      let totalRentals = 0;
      const depositPerItem = items.length > 0 ? parseFloat(formData.deposit) / items.reduce((sum, item) => sum + item.quantity, 0) : 0;
      
      for (const item of items) {
        // Crear un alquiler por cada unidad
        for (let i = 0; i < item.quantity; i++) {
          const rentalData = {
            client_id: parseInt(formData.client_id),
            product_id: item.product_id,
            start_date: new Date(formData.start_date).toISOString(),
            end_date: new Date(formData.end_date).toISOString(),
            rental_period: 'daily',
            rental_price: parseFloat(item.unit_price),
            deposit: parseFloat(depositPerItem),
            payment_method: formData.payment_method,
            notes: formData.notes || '',
            tax_rate: 0,
            discount: 0
          };
          
          await rentalsService.createRental(rentalData);
          totalRentals++;
        }
      }
      
      showSuccess(`${totalRentals} alquiler(es) creado(s) exitosamente`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating rentals:', error);
      const errorDetail = error.response?.data?.detail || error.message || 'Error desconocido';
      showError(errorDetail);
    } finally {
      setLoading(false);
    }
  };

  const days = calculateDays();
  const total = calculateTotal();

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Calendar size={28} />
                Nuevo Alquiler
              </h2>
              <p className="text-teal-100 mt-1">Registra un nuevo alquiler de equipos</p>
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

        <form onSubmit={handleSubmit} className="p-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente <span className="text-red-500">*</span>
              </label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 focus:outline-none transition-all"
              >
                <option value="">Seleccionar cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 focus:outline-none transition-all"
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                min={formData.start_date}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Depósito ({formatCurrency(0)})
              </label>
              <NumberInput
                name="deposit"
                value={formData.deposit}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración
              </label>
              <input
                type="text"
                value={days > 0 ? `${days} día${days !== 1 ? 's' : ''}` : '-'}
                readOnly
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              />
            </div>
          </div>

          {/* Agregar Productos */}
          <div className="bg-orange-50 p-6 rounded-2xl mb-6 border-2 border-orange-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package size={20} className="text-orange-600" />
              Agregar Productos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value);
                    const product = products.find(p => p.id === parseInt(e.target.value));
                    if (product) setUnitPrice(product.price || 0);
                  }}
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Seleccionar</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.price)}/día
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio/Día
                </label>
                <NumberInput
                  name="unitPrice"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Agregar
                </button>
              </div>
            </div>

            {/* Lista de Productos */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Productos Seleccionados</h4>
              {items.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-4">No hay productos seleccionados</p>
              ) : (
                <div className="bg-white rounded-xl overflow-hidden border-2 border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Producto</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Cantidad</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Precio/Día</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Días</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Subtotal</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {items.map((item, index) => (
                        <tr key={index} className="hover:bg-orange-50">
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{item.product_name}</td>
                          <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                          <td className="px-4 py-3 text-sm text-center font-semibold">{days}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-orange-600">
                            {formatCurrency(item.quantity * item.unit_price * days)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr className="border-t-2 border-gray-300">
                        <td colSpan="4" className="px-4 py-3 text-right text-lg font-bold text-gray-900">TOTAL:</td>
                        <td className="px-4 py-3 text-lg font-bold text-orange-600 text-right">{formatCurrency(total)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 focus:outline-none transition-all"
              placeholder="Notas adicionales..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Crear Alquiler'}
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

export default RentalFormMultiple;
