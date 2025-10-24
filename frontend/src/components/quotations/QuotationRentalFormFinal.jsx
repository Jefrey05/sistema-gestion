import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, User, Package, Plus, Trash2, Search, Calculator } from 'lucide-react';
// import { rentalsService } from '../../services/rentalsService';
import { inventoryService } from '../../services/inventoryService';
import api from '../../services/api';
import { useCurrency } from '../../hooks/useCurrency';
import { useNotification } from '../../hooks/useNotification';
import NumberInput from '../common/NumberInput';
import Notification from '../Notification';

const QuotationRentalFormFinal = ({ quotation = null, onClose, onSuccess }) => {
  console.log('🔵 QuotationRentalFormFinal renderizado');
  console.log('📝 Cotización a editar:', quotation);
  
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
  const { notification, hideNotification, showError, showSuccess } = useNotification();
  
  // Función para obtener la fecha local en formato YYYY-MM-DD (sin conversión a UTC)
  const getLocalDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [formData, setFormData] = useState({
    client_id: quotation?.client_id || '',
    start_date: quotation?.start_date || getLocalDateString(),
    end_date: quotation?.end_date || '',
    payment_method: quotation?.payment_method || '',
    deposit: quotation?.deposit || 0,
    tax_rate: quotation?.tax_rate || 18,
    discount: quotation?.discount_percent || 0,
    notes: quotation?.notes || ''
  });

  useEffect(() => {
    loadClients();
    loadProducts();
    
    // Recargar productos cada 30 segundos para mantener el stock actualizado
    const interval = setInterval(() => {
      loadProducts();
    }, 30000);
    
    // Si estamos editando, cargar los items de la cotización
    if (quotation && quotation.items) {
      console.log('📦 Cargando items de cotización de alquiler:', quotation.items);
      
      // Calcular días desde las fechas
      let calculatedDays = 1;
      if (quotation.start_date && quotation.end_date) {
        const start = new Date(quotation.start_date);
        const end = new Date(quotation.end_date);
        calculatedDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        console.log('📅 Días calculados:', calculatedDays);
      }
      
      // Cargar items con los días calculados
      setItems(quotation.items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name || item.product?.name,
        quantity: item.quantity,
        price_per_day: item.unit_price,
        rental_days: calculatedDays,
        total: item.quantity * item.unit_price * calculatedDays,
        discount_percent: item.discount_percent || 0
      })));
    }
    
    return () => clearInterval(interval);
  }, [quotation]);

  useEffect(() => {
    // Filtrar clientes
    try {
      if (clientSearch.trim() === '') {
        setFilteredClients(clients);
      } else {
        const filtered = clients.filter(client =>
          client && client.name && (
            client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
            (client.email && client.email.toLowerCase().includes(clientSearch.toLowerCase()))
          )
        );
        setFilteredClients(filtered);
      }
    } catch (error) {
      console.error('Error filtering clients:', error);
      setFilteredClients(clients);
    }
  }, [clientSearch, clients]);

  useEffect(() => {
    // Filtrar productos
    try {
      console.log('Filtering products - productSearch:', productSearch);
      console.log('Filtering products - products:', products);
      
      if (!products || products.length === 0) {
        console.log('No products available');
        setFilteredProducts([]);
        return;
      }

      if (productSearch.trim() === '') {
        console.log('Empty search, showing all products');
        setFilteredProducts(products);
      } else {
        console.log('Filtering with search term:', productSearch);
        const filtered = products.filter(product => {
          if (!product || !product.name) return false;
          const matches = product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                 (product.description && product.description.toLowerCase().includes(productSearch.toLowerCase()));
          console.log(`Product ${product.name} matches:`, matches);
          return matches;
        });
        console.log('Filtered products:', filtered);
        setFilteredProducts(filtered);
      }
    } catch (error) {
      console.error('Error filtering products:', error);
      setFilteredProducts([]);
    }
  }, [productSearch, products]);

  const loadClients = async () => {
    try {
      const response = await api.get('/clients/');
      setClients(response.data);
      setFilteredClients(response.data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadProducts = async () => {
    try {
      console.log('Loading products...');
      const allProducts = await inventoryService.getProducts();
      console.log('All products loaded:', allProducts);
      
      // Mostrar todos los productos primero para debugging
      setProducts(allProducts);
      setFilteredProducts(allProducts);
      
      // Filtrar solo productos de alquiler (tipo "alquiler" o "ambos")
      const rentalProducts = allProducts.filter(product => {
        const productType = product.type || product.product_type || product.category;
        console.log(`Product ${product.name}: type = ${productType}`);
        return productType === 'alquiler' || productType === 'ambos' || productType === 'rental';
      });
      
      console.log('Rental products filtered:', rentalProducts);
      
      // Mapear productos con precios de alquiler
      const productsWithRentalPrice = rentalProducts.map(product => ({
        ...product,
        price_per_day: product.price_per_day || product.price || 0
      }));
      
      console.log('Products with rental price:', productsWithRentalPrice);
      
      setProducts(productsWithRentalPrice);
      setFilteredProducts(productsWithRentalPrice);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // Calcular días entre dos fechas
  const calculateDaysBetween = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
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
    try {
      console.log('Product selected:', product);
      if (product && product.id) {
        // Guardar el producto seleccionado para mostrar campo de cantidad
        setSelectedProduct(product);
        setProductSearch(''); // Limpiar búsqueda para ocultar lista
      }
    } catch (error) {
      console.error('Error selecting product:', error);
    }
  };

  const handleClearProduct = () => {
    setSelectedProduct(null);
    setProductSearch('');
  };

  const handleAddItem = () => {
    if (!selectedProduct) {
      showError('Debe seleccionar un producto');
      return;
    }

    // Validar que las fechas estén seleccionadas
    if (!formData.start_date || !formData.end_date) {
      showError('Debe seleccionar las fechas de inicio y fin antes de agregar productos');
      return;
    }

    // Validar stock disponible
    const stockAvailable = selectedProduct.stock_available || 0;
    const currentQuantityInItems = items
      .filter(item => item.product_id === selectedProduct.id)
      .reduce((sum, item) => sum + item.quantity, 0);
    const totalRequestedQuantity = currentQuantityInItems + quantity;
    
    if (stockAvailable <= 0) {
      showError(`El producto "${selectedProduct.name}" no tiene stock disponible para alquilar`);
      return;
    }
    
    if (totalRequestedQuantity > stockAvailable) {
      showError(`Stock insuficiente para "${selectedProduct.name}". Disponible: ${stockAvailable}, Solicitado: ${totalRequestedQuantity}`);
      return;
    }

    // Calcular los días basado en las fechas seleccionadas
    const days = calculateDaysBetween(formData.start_date, formData.end_date);
    
    const total = selectedProduct.price_per_day * quantity * days;
    const newItem = {
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,  // Cambiar 'name' a 'product_name'
      quantity,
      rental_days: days,
      price_per_day: selectedProduct.price_per_day,
      total
    };

    setItems(prev => [...prev, newItem]);
    setSelectedProduct(null);
    setProductSearch('');
    setQuantity(1);
  };

  const handleRemoveItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (formData.tax_rate / 100);
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
    
    // Las validaciones ya están en el botón disabled, no necesitamos mensajes
    setLoading(true);
    try {
      // Crear cotización de alquiler
      const quotationData = {
        quotation_type: 'alquiler',
        client_id: parseInt(formData.client_id),
        tax_rate: parseFloat(formData.tax_rate) || 18,
        discount_percent: parseFloat(formData.discount) || 0,
        notes: (formData.notes || '') + `\n\n--- Información de Alquiler ---\nFecha Inicio: ${formData.start_date}\nFecha Fin: ${formData.end_date}\nDepósito: ${formData.deposit}`,
        terms_conditions: 'Términos y condiciones estándar',
        payment_conditions: 'Pago al contado',
        delivery_time: '5 días hábiles',
        payment_method: formData.payment_method || 'efectivo',
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: parseFloat(item.price_per_day),
          discount_percent: 0
        }))
      };
      
      console.log('📤 Enviando cotización de alquiler:', quotationData);
      
      if (isEditing) {
        // Actualizar cotización existente
        await api.put(`/quotations/${quotation.id}`, quotationData);
        console.log('✅ Cotización de alquiler actualizada');
      } else {
        // Crear nueva cotización
        await api.post('/quotations', quotationData);
        console.log('✅ Cotización de alquiler creada');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error(`❌ Error ${isEditing ? 'updating' : 'creating'} quotation:`, error);
      const errorDetail = error.response?.data?.detail || error.message || 'Error desconocido';
      showError(`❌ Error: ${errorDetail}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find(c => c.id === formData.client_id);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="w-full h-full max-w-none max-h-none overflow-hidden animate-fadeIn m-2">
          <div className="bg-white rounded-3xl shadow-2xl h-full flex flex-col border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-purple-200 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 shadow-lg">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Nueva Cotización - Alquiler</h2>
                <p className="text-sm text-purple-100">Complete la información del alquiler</p>
              </div>
              <button
                type="button"
                onClick={onClose} 
                className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 text-white hover:scale-105"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="overflow-y-auto flex-1 bg-gray-50 p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* Columna Izquierda - Cliente, Fechas y Productos */}
                  <div className="space-y-2 flex flex-col">
                    {/* Cliente */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2 flex-shrink-0">
                      <h3 className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5 border-b border-gray-100 pb-1">
                        <User size={16} className="text-purple-600" />
                        Cliente
                      </h3>
                      <div className="space-y-2 relative">
                        <div className="relative">
                          <input
                            type="text"
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            placeholder="Buscar cliente..."
                            className="pl-10 pr-6 block w-full rounded-md border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none transition-all py-2 text-sm"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <User size={18} className="text-gray-400" />
                          </div>
                          
                          {/* Lista de clientes filtrados */}
                          {clientSearch && filteredClients.length > 0 && (
                            <div className="absolute z-50 mt-1 left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                              {filteredClients.map((client) => (
                                <div
                                  key={client.id}
                                  onClick={() => handleClientSelect(client)}
                                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{client.name}</p>
                                      {client.email && <p className="text-xs text-gray-500">{client.email}</p>}
                                    </div>
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Cliente seleccionado */}
                      {formData.client_id && selectedClient && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-green-800">
                                {selectedClient.name}
                              </span>
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

                    {/* Agregar Productos */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2 flex-shrink-0">
                      <h3 className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5 border-b border-gray-100 pb-1">
                        <Package size={16} className="text-purple-600" />
                        Agregar Productos
                      </h3>
                      
                      {/* Alerta si no hay fechas */}
                      {(!formData.start_date || !formData.end_date) && (
                        <div className="mb-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                          <p className="text-sm text-yellow-800 font-medium">
                            ⚠️ Selecciona las fechas de inicio y fin antes de agregar productos
                          </p>
                        </div>
                      )}
                      
                      <div className="space-y-2 relative">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Package size={18} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={productSearch || ''}
                            disabled={!formData.start_date || !formData.end_date}
                            onChange={(e) => {
                              try {
                                setProductSearch(e.target.value);
                              } catch (error) {
                                console.error('Error updating product search:', error);
                              }
                            }}
                            placeholder={!formData.start_date || !formData.end_date ? "Selecciona fechas primero..." : "Buscar producto..."}
                            className="pl-10 block w-full rounded-md border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none transition-all py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                          />
                          
                          {/* Lista de productos filtrados */}
                          {productSearch && filteredProducts && filteredProducts.length > 0 && (
                            <div className="absolute z-50 mt-1 left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                              {filteredProducts.map((product) => {
                                if (!product || !product.id) return null;
                                return (
                                  <div
                                    key={product.id}
                                    onClick={() => handleProductSelect(product)}
                                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{product.name || 'Sin nombre'}</p>
                                        <p className="text-xs text-gray-500">
                                          {formatCurrency(product.price_per_day || 0)}/día • Stock: {product.stock_available || 0}
                                        </p>
                                      </div>
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        
                        {/* Producto seleccionado */}
                        {selectedProduct && (
                          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-medium text-blue-800">
                                  {selectedProduct.name}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={handleClearProduct}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                ✕ Limpiar
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Campo de cantidad */}
                        {selectedProduct && (
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cantidad
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={quantity === 0 ? '' : quantity}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d+$/.test(value)) {
                                  setQuantity(value === '' ? 0 : parseInt(value));
                                }
                              }}
                              placeholder="1"
                              className="block w-full rounded-md border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none transition-all py-2 px-3 text-sm"
                            />
                          </div>
                        )}
                        
                        {/* Botón Agregar */}
                        {selectedProduct && (
                          <button
                            type="button"
                            onClick={handleAddItem}
                            className="w-full mt-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                          >
                            <Plus size={18} />
                            Agregar Producto
                          </button>
                        )}
                      </div>

                      {/* Lista de Productos Seleccionados */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Productos Seleccionados</h4>
                        {items.length === 0 ? (
                          <p className="text-sm text-gray-500 italic text-center py-3">No hay productos seleccionados</p>
                        ) : (
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                            <table className="w-full">
                              <thead className="bg-gradient-to-r from-purple-100 to-purple-200">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cant.</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio/día</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {items.map((item, index) => (
                                  <tr key={index}>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">{item.product_name || item.name || 'Sin nombre'}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.rental_days}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.price_per_day)}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.total)}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha - Fechas, Pago, Cálculo, Resumen, Notas y Botón */}
                  <div className="space-y-2 flex flex-col">
                    {/* Fechas */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2 flex-shrink-0">
                      <h3 className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5 border-b border-gray-100 pb-1">
                        <Calendar size={16} className="text-purple-600" />
                        Fechas de Alquiler
                      </h3>
                      <div className="space-y-1.5">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Fecha de Inicio
                          </label>
                          <input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, start_date: e.target.value }));
                            }}
                            className="block w-full rounded-md border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none transition-all py-1.5 px-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Fecha de Fin
                          </label>
                          <input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                            className="block w-full rounded-md border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none transition-all py-1.5 px-2 text-sm"
                          />
                        </div>
                        {formData.start_date && formData.end_date && (
                          <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="text-sm font-medium text-purple-900">
                              Días de alquiler: <span className="font-bold">{calculateDaysBetween(formData.start_date, formData.end_date)}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pago */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2 flex-shrink-0">
                      <h3 className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5 border-b border-gray-100 pb-1">
                        <DollarSign size={16} className="text-purple-600" />
                        Información de Pago
                      </h3>
                      <div className="space-y-1.5">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Método de Pago
                          </label>
                          <select
                            value={formData.payment_method}
                            onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                            className="block w-full rounded-md border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none transition-all py-1.5 px-2 text-sm"
                          >
                            <option value="">Seleccionar método</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="tarjeta">Tarjeta</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="cheque">Cheque</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Cálculos */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2 flex-shrink-0">
                      <h3 className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5 border-b border-gray-100 pb-1">
                        <Calculator size={16} className="text-purple-600" />
                        Cálculos
                      </h3>
                      <div className="space-y-1.5">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Tasa de Impuesto (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.tax_rate}
                            onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                            className="block w-full rounded-md border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none transition-all py-1.5 px-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Descuento (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.discount === 0 ? '' : formData.discount}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                              setFormData(prev => ({ ...prev, discount: isNaN(val) ? 0 : val }));
                            }}
                            placeholder="0"
                            className="block w-full rounded-md border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none transition-all py-1.5 px-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Resumen */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2 flex-shrink-0">
                      <h3 className="text-sm font-bold text-gray-900 mb-1">Resumen</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(calculateSubtotal())}</span>
                        </div>
                        {formData.tax_rate > 0 && (
                          <div className="flex justify-between">
                            <span>Impuesto ({formData.tax_rate}%):</span>
                            <span>{formatCurrency(calculateTax())}</span>
                          </div>
                        )}
                        {(parseFloat(formData.discount) || 0) > 0 && (
                          <div className="flex justify-between">
                            <span>Descuento ({formData.discount}%):</span>
                            <span>-{formatCurrency(calculateDiscount())}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-purple-600 border-t pt-2">
                          <span>Total:</span>
                          <span>{formatCurrency(calculateTotal())}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notas */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2 flex-shrink-0">
                      <h3 className="text-sm font-bold text-gray-900 mb-1">Notas</h3>
                      <input
                        type="text"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Notas adicionales..."
                        className="block w-full rounded-md border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none transition-all py-1.5 px-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer con botones fijos */}
              <div className="border-t border-gray-200 bg-white p-3 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    loading || 
                    items.length === 0 || 
                    !formData.client_id || 
                    !formData.start_date || 
                    !formData.end_date || 
                    !formData.payment_method
                  }
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? (isEditing ? 'Actualizando...' : 'Guardando...') : (isEditing ? 'Actualizar Cotización' : 'Crear Cotización')}
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

export default QuotationRentalFormFinal;