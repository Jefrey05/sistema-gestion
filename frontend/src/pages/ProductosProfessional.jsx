import { useEffect, useState } from 'react';
import { 
  Package, Plus, Search, Filter, Download, AlertCircle
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { exportToCSV, formatProductsData } from '../utils/exportUtils';
import { useCurrency } from '../hooks/useCurrency';
import { useNotification } from '../hooks/useNotification';
import { useOrganizationColors } from '../hooks/useOrganizationColors';
import ProductModal from '../components/products/ProductModal';
import ProductCard from '../components/products/ProductCard';
import Notification from '../components/Notification';
import ConfirmDialog from '../components/ConfirmDialog';

const ProductosProfessional = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const { formatCurrency } = useCurrency();
  const { notification, hideNotification, showSuccess, showError } = useNotification();
  const { gradients } = useOrganizationColors();

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [productsData, categoriesData, suppliersData] = await Promise.all([
        inventoryService.getProducts(),
        inventoryService.getCategories(),
        inventoryService.getSuppliers()
      ]);
      
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setSuppliers(suppliersData || []);
      
    } catch (error) {
      console.error('Error al cargar productos:', error);
      showError('Error al cargar los productos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Filtrar productos localmente
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered;
  };

  const handleDelete = (id) => {
    setProductToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await inventoryService.deleteProduct(productToDelete);
      showSuccess('Producto eliminado correctamente');
      setShowDeleteConfirm(false);
      setProductToDelete(null);
      loadData();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      showError('Error al eliminar el producto. Por favor, intenta de nuevo.');
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleExport = () => {
    const data = formatProductsData(products);
    exportToCSV(data, `productos-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const getStockBadge = (product) => {
    const stock = product.stock || 0;
    const minStock = product.min_stock || 0;
    
    if (stock === 0) {
      return { bg: 'bg-red-100', text: 'text-red-700', label: 'Sin stock', icon: AlertCircle };
    } else if (stock <= minStock) {
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Stock bajo', icon: AlertCircle };
    } else {
      return { bg: 'bg-green-100', text: 'text-green-700', label: 'En stock', icon: Package };
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category_id === parseInt(filterCategory);
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Mejorado */}
      <div 
        className="rounded-2xl shadow-lg p-6 text-white"
        style={{ background: gradients.products }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Package size={32} />
              </div>
              Gestión de Productos
            </h1>
            <p className="text-blue-100 ml-14">Administra tu inventario de productos</p>
            <div className="flex items-center gap-4 mt-3 ml-14 flex-wrap">
              <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-semibold">{products.length} Productos</span>
              </div>
              <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-semibold">
                  {products.filter(p => (p.stock || 0) > (p.min_stock || 0)).length} En Stock
                </span>
              </div>
              <div className="bg-red-500/30 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-red-300/30">
                <span className="text-sm font-semibold flex items-center gap-1">
                  <AlertCircle size={14} />
                  {products.filter(p => (p.stock || 0) <= (p.min_stock || 0)).length} Stock Bajo
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-white/30 transition-all border border-white/30"
            >
              <Download size={20} />
              Exportar
            </button>
            <button
              onClick={handleAdd}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plus size={20} />
              Nuevo Producto
            </button>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros mejorada */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Stats */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 rounded-lg border border-green-200">
            <p className="text-xs text-green-600 font-medium mb-1">Valor Total Inventario</p>
            <p className="text-lg font-bold text-green-700">
              {formatCurrency(products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-gray-400" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron productos</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterCategory !== 'all' 
              ? 'Intenta cambiar los filtros de búsqueda' 
              : 'Comienza agregando tu primer producto'}
          </p>
          {!searchTerm && filterCategory === 'all' && (
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Crear Primer Producto
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal de Producto */}
      {showModal && (
        <ProductModal
          product={selectedProduct}
          onClose={() => {
            setShowModal(false);
            setSelectedProduct(null);
          }}
          onSuccess={loadData}
        />
      )}
      
      {/* Diálogo de Confirmación de Eliminación */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Eliminar Producto"
          message="¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer."
          confirmText="Sí, eliminar"
          cancelText="Cancelar"
          type="danger"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
      
      {/* Notificaciones */}
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

export default ProductosProfessional;





