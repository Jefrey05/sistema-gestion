import { useState, useEffect } from 'react';
import { X, Package, DollarSign, Hash } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { useNotification } from '../../hooks/useNotification';
import NumberInput from '../common/NumberInput';
import Notification from '../Notification';

const ProductModal = ({ product, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const { notification, hideNotification, showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    description: product?.description || '',
    category_id: product?.category_id || '',
    supplier_id: product?.supplier_id || '',
    price: product?.price !== undefined ? product.price : 0,
    cost: product?.cost !== undefined ? product.cost : 0,
    stock: product?.stock !== undefined ? product.stock : 0,
    min_stock: product?.min_stock || 10,
    product_type: product?.product_type || 'venta'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCategories();
    loadSuppliers();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await inventoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const data = await inventoryService.getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.sku || formData.sku.trim() === '') {
      newErrors.sku = 'El SKU/Código es requerido';
    }
    
    // Validar precio - debe ser un número válido mayor o igual a 0
    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue < 0) {
      newErrors.price = 'El precio debe ser un número válido mayor o igual a 0';
    }
    
    // Validar stock - debe ser un número válido mayor o igual a 0
    const stockValue = parseInt(formData.stock);
    if (isNaN(stockValue) || stockValue < 0) {
      newErrors.stock = 'El stock debe ser un número válido mayor o igual a 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        description: formData.description?.trim() || '',
        product_type: formData.product_type || 'venta',
        price: parseFloat(formData.price) || 0,
        cost: parseFloat(formData.cost) || 0,
        stock: parseInt(formData.stock) || 0,
        min_stock: parseInt(formData.min_stock) || 10,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null
      };

      if (product) {
        await inventoryService.updateProduct(product.id, productData);
        showSuccess('Producto actualizado exitosamente');
      } else {
        await inventoryService.createProduct(productData);
        showSuccess('Producto creado exitosamente');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Error completo al guardar producto:', error);
      console.error('❌ Respuesta del servidor:', error.response);
      console.error('❌ Datos de respuesta:', error.response?.data);
      
      let errorMessage = 'Error al guardar el producto';
      
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          // Errores de validación de Pydantic
          const validationErrors = error.response.data.detail.map(e => {
            const field = e.loc ? e.loc[e.loc.length - 1] : 'campo';
            return `${field}: ${e.msg}`;
          }).join('\n');
          errorMessage = `Errores de validación:\n${validationErrors}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError(errorMessage, 5000); // Mostrar error por 5 segundos
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Package size={28} />
              {product ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border-2 ${errors.name ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all`}
                placeholder="Ej: Laptop Dell Inspiron"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Código/SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código/SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border-2 ${errors.sku ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all`}
                placeholder="Ej: 001 o LAP-001"
              />
              {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Producto
              </label>
              <select
                name="product_type"
                value={formData.product_type}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all"
              >
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio <span className="text-red-500">*</span>
              </label>
              <NumberInput
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 rounded-lg border-2 ${errors.price ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all`}
                placeholder="0,00"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            {/* Costo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo
              </label>
              <NumberInput
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all"
                placeholder="0,00"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock <span className="text-red-500">*</span>
              </label>
              <NumberInput
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className={`w-full px-4 py-2 rounded-lg border-2 ${errors.stock ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all`}
                placeholder="0"
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>

            {/* Stock Mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Mínimo
              </label>
              <NumberInput
                name="min_stock"
                value={formData.min_stock}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all"
                placeholder="10"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all"
              >
                <option value="">Sin categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Proveedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor
              </label>
              <select
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all"
              >
                <option value="">Sin proveedor</option>
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all"
                placeholder="Descripción del producto..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : product ? 'Actualizar' : 'Crear Producto'}
            </button>
          </div>
        </form>
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
    </div>
  );
};

export default ProductModal;
