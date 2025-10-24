import { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import { X } from 'lucide-react';
import { useNumericInput } from '../hooks/useNumericInput';
import { useCurrency } from '../hooks/useCurrency';

const ProductModal = ({ product, categories, suppliers, onClose }) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    product_type: 'venta',
    category_id: '',
    supplier_id: '',
    price: '',
    cost: '',
    stock: 0,
    min_stock: 10,
    max_stock: 100,
    location: '',
    rental_price_daily: 0,
    rental_price_weekly: 0,
    rental_price_monthly: 0,
    is_active: true
  });

  // Hooks para campos numéricos
  const priceInput = useNumericInput(parseFloat(formData.price) || 0, (value) => {
    setFormData(prev => ({ ...prev, price: value.toString() }));
  });

  const costInput = useNumericInput(parseFloat(formData.cost) || 0, (value) => {
    setFormData(prev => ({ ...prev, cost: value.toString() }));
  });

  const stockInput = useNumericInput(parseInt(formData.stock) || 0, (value) => {
    setFormData(prev => ({ ...prev, stock: value.toString() }));
  });

  const minStockInput = useNumericInput(parseInt(formData.min_stock) || 10, (value) => {
    setFormData(prev => ({ ...prev, min_stock: value.toString() }));
  });

  const maxStockInput = useNumericInput(parseInt(formData.max_stock) || 100, (value) => {
    setFormData(prev => ({ ...prev, max_stock: value.toString() }));
  });

  const rentalDailyInput = useNumericInput(parseFloat(formData.rental_price_daily) || 0, (value) => {
    setFormData(prev => ({ ...prev, rental_price_daily: value.toString() }));
  });

  const rentalWeeklyInput = useNumericInput(parseFloat(formData.rental_price_weekly) || 0, (value) => {
    setFormData(prev => ({ ...prev, rental_price_weekly: value.toString() }));
  });

  const rentalMonthlyInput = useNumericInput(parseFloat(formData.rental_price_monthly) || 0, (value) => {
    setFormData(prev => ({ ...prev, rental_price_monthly: value.toString() }));
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hook para manejar la moneda
  const { currencySymbol } = useCurrency();

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        product_type: product.product_type || 'venta',
        category_id: product.category_id || '',
        supplier_id: product.supplier_id || '',
        price: product.price,
        cost: product.cost || '',
        stock: product.stock,
        min_stock: product.min_stock,
        max_stock: product.max_stock,
        location: product.location || '',
        rental_price_daily: product.rental_price_daily || '',
        rental_price_weekly: product.rental_price_weekly || '',
        rental_price_monthly: product.rental_price_monthly || '',
        is_active: product.is_active
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validación para productos de solo alquiler
    if (formData.product_type === 'alquiler') {
      const hasRentalPrice = formData.rental_price_daily || 
                            formData.rental_price_weekly || 
                            formData.rental_price_monthly;
      if (!hasRentalPrice) {
        setError('Para productos de solo alquiler, debe especificar al menos un precio de alquiler');
        setLoading(false);
        return;
      }
    }

    try {
      const data = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        stock: parseInt(formData.stock),
        min_stock: parseInt(formData.min_stock),
        max_stock: parseInt(formData.max_stock),
        category_id: formData.category_id || null,
        supplier_id: formData.supplier_id || null,
        rental_price_daily: formData.rental_price_daily ? parseFloat(formData.rental_price_daily) : null,
        rental_price_weekly: formData.rental_price_weekly ? parseFloat(formData.rental_price_weekly) : null,
        rental_price_monthly: formData.rental_price_monthly ? parseFloat(formData.rental_price_monthly) : null
      };

      if (product) {
        await inventoryService.updateProduct(product.id, data);
      } else {
        await inventoryService.createProduct(data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="input-field"
                required
                disabled={!!product}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Producto *
            </label>
            <select
              name="product_type"
              value={formData.product_type}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="venta">Solo Venta</option>
              <option value="alquiler">Solo Alquiler</option>
              <option value="ambos">Venta y Alquiler</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor
              </label>
              <select
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Sin proveedor</option>
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio de Venta ({currencySymbol}) {formData.product_type !== 'alquiler' ? '*' : ''}
              </label>
              <input
                type="text"
                value={priceInput.displayValue}
                onChange={priceInput.handleChange}
                onFocus={priceInput.handleFocus}
                onBlur={priceInput.handleBlur}
                className="input-field"
                placeholder="0.00"
                required={formData.product_type !== 'alquiler'}
                disabled={formData.product_type === 'alquiler'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo ({currencySymbol})
              </label>
              <input
                type="text"
                value={costInput.displayValue}
                onChange={costInput.handleChange}
                onFocus={costInput.handleFocus}
                onBlur={costInput.handleBlur}
                className="input-field"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Precios de Alquiler - Solo mostrar si el tipo es alquiler o ambos */}
          {(formData.product_type === 'alquiler' || formData.product_type === 'ambos') && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Precios de Alquiler</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Diario ({currencySymbol})
                  </label>
                  <input
                    type="text"
                    value={rentalDailyInput.displayValue}
                    onChange={rentalDailyInput.handleChange}
                    onFocus={rentalDailyInput.handleFocus}
                    onBlur={rentalDailyInput.handleBlur}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Semanal ({currencySymbol})
                  </label>
                  <input
                    type="text"
                    value={rentalWeeklyInput.displayValue}
                    onChange={rentalWeeklyInput.handleChange}
                    onFocus={rentalWeeklyInput.handleFocus}
                    onBlur={rentalWeeklyInput.handleBlur}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Mensual ({currencySymbol})
                  </label>
                  <input
                    type="text"
                    value={rentalMonthlyInput.displayValue}
                    onChange={rentalMonthlyInput.handleChange}
                    onFocus={rentalMonthlyInput.handleFocus}
                    onBlur={rentalMonthlyInput.handleBlur}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Actual *
              </label>
              <input
                type="text"
                value={stockInput.displayValue}
                onChange={stockInput.handleChange}
                onFocus={stockInput.handleFocus}
                onBlur={stockInput.handleBlur}
                className="input-field"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Mínimo *
              </label>
              <input
                type="text"
                value={minStockInput.displayValue}
                onChange={minStockInput.handleChange}
                onFocus={minStockInput.handleFocus}
                onBlur={minStockInput.handleBlur}
                className="input-field"
                placeholder="10"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Máximo *
              </label>
              <input
                type="text"
                value={maxStockInput.displayValue}
                onChange={maxStockInput.handleChange}
                onFocus={maxStockInput.handleFocus}
                onBlur={maxStockInput.handleBlur}
                className="input-field"
                placeholder="100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input-field"
              placeholder="Ej: Almacén A, Estante 3"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Producto activo
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
