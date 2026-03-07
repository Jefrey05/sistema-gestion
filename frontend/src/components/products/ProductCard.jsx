import { Package, Edit, Trash2, AlertCircle, DollarSign, TrendingUp, Box } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';

const ProductCard = ({ product, onEdit, onDelete }) => {
  const { formatCurrency } = useCurrency();

  const getStockBadge = () => {
    // Para productos de alquiler, usar stock_available
    const isRental = product.product_type === 'alquiler' || product.product_type === 'ambos';
    const stock = isRental ? (product.stock_available || 0) : (product.stock || 0);
    const minStock = product.min_stock || 0;
    
    if (stock === 0) {
      return { 
        bg: 'bg-red-100 border-red-200', 
        text: 'text-red-700', 
        label: 'Sin stock', 
        icon: AlertCircle 
      };
    } else if (stock <= minStock) {
      return { 
        bg: 'bg-yellow-100 border-yellow-200', 
        text: 'text-yellow-700', 
        label: 'Stock bajo', 
        icon: AlertCircle 
      };
    } else {
      return { 
        bg: 'bg-emerald-100 border-emerald-200', 
        text: 'text-emerald-700', 
        label: 'En stock', 
        icon: Package 
      };
    }
  };

  const getTypeBadge = (type) => {
    const badges = {
      venta: { bg: 'bg-blue-100 border-blue-200', text: 'text-blue-700', label: 'Venta' },
      alquiler: { bg: 'bg-purple-100 border-purple-200', text: 'text-purple-700', label: 'Alquiler' },
      ambos: { bg: 'bg-indigo-100 border-indigo-200', text: 'text-indigo-700', label: 'Venta/Alquiler' }
    };
    return badges[type] || badges.venta;
  };

  const stockBadge = getStockBadge();
  const typeBadge = getTypeBadge(product.product_type);
  const StockIcon = stockBadge.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
              <Package className="text-blue-600" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg truncate">{product.name}</h3>
              <p className="text-sm text-gray-500 font-mono">{product.sku}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${typeBadge.bg} ${typeBadge.text}`}>
            {typeBadge.label}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border flex items-center gap-1 ${stockBadge.bg} ${stockBadge.text}`}>
            <StockIcon size={12} />
            {stockBadge.label}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        {/* Precio */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700">
              <DollarSign size={18} />
              <span className="text-sm font-medium">Precio</span>
            </div>
            <span className="text-lg font-bold text-green-700">
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>

        {/* Stock */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          {product.product_type === 'ambos' ? (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="flex items-center gap-1 text-gray-600 mb-1">
                  <Box size={12} />
                  <span className="text-xs font-medium">Stock</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{product.stock || 0}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-green-600 mb-1">
                  <Package size={12} />
                  <span className="text-xs font-medium">Disponible</span>
                </div>
                <p className="text-lg font-bold text-green-700">{product.stock_available || 0}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-gray-600 mb-1">
                  <TrendingUp size={12} />
                  <span className="text-xs font-medium">Mínimo</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{product.min_stock || 0}</p>
              </div>
            </div>
          ) : product.product_type === 'alquiler' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <Package size={14} />
                  <span className="text-xs font-medium">Disponible</span>
                </div>
                <p className="text-lg font-bold text-green-700">{product.stock_available || 0}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <TrendingUp size={14} />
                  <span className="text-xs font-medium">Mínimo</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{product.min_stock || 0}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Box size={14} />
                  <span className="text-xs font-medium">Stock</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{product.stock || 0}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <TrendingUp size={14} />
                  <span className="text-xs font-medium">Mínimo</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{product.min_stock || 0}</p>
              </div>
            </div>
          )}
        </div>

        {/* Categoría y Proveedor */}
        {(product.category_name || product.supplier_name) && (
          <div className="space-y-2 text-sm">
            {product.category_name && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium">Categoría:</span>
                <span className="text-gray-900">{product.category_name}</span>
              </div>
            )}
            {product.supplier_name && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium">Proveedor:</span>
                <span className="text-gray-900">{product.supplier_name}</span>
              </div>
            )}
          </div>
        )}

        {/* Precio de alquiler si aplica */}
        {(product.product_type === 'alquiler' || product.product_type === 'ambos') && product.rental_price_daily && (
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <div className="text-xs text-purple-600 font-medium mb-1">Alquiler Diario</div>
            <div className="text-lg font-bold text-purple-700">
              {formatCurrency(product.rental_price_daily)}
            </div>
          </div>
        )}
      </div>

      {/* Footer con acciones */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => onEdit(product)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          <Edit size={16} />
          Editar
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
