import { useEffect, useState } from 'react';
import { inventoryService } from '../services/inventoryService';
import { Plus, ArrowUpRight, ArrowDownRight, RefreshCw, Package } from 'lucide-react';

const Movements = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    movement_type: 'entrada',
    quantity: '',
    reason: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [movementsData, productsData] = await Promise.all([
        inventoryService.getMovements(),
        inventoryService.getProducts()
      ]);
      setMovements(movementsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.createMovement({
        ...formData,
        product_id: parseInt(formData.product_id),
        quantity: parseInt(formData.quantity)
      });
      setShowModal(false);
      setFormData({ product_id: '', movement_type: 'entrada', quantity: '', reason: '' });
      loadData();
    } catch (error) {
      console.error('Error creating movement:', error);
      alert(error.response?.data?.detail || 'Error al crear el movimiento');
    }
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'entrada':
        return <ArrowUpRight className="text-green-600" size={20} />;
      case 'salida':
        return <ArrowDownRight className="text-red-600" size={20} />;
      case 'ajuste':
        return <RefreshCw className="text-blue-600" size={20} />;
      case 'alquiler':
        return <ArrowDownRight className="text-orange-600" size={20} />;
      case 'devolucion':
        return <ArrowUpRight className="text-teal-600" size={20} />;
      case 'venta':
        return <ArrowDownRight className="text-purple-600" size={20} />;
      default:
        return null;
    }
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'entrada':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'salida':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'ajuste':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'alquiler':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'devolucion':
        return 'bg-teal-50 border-teal-200 text-teal-800';
      case 'venta':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Movimientos de Inventario</h1>
          <p className="text-gray-600 mt-1">{movements.length} movimientos registrados</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Movimiento
        </button>
      </div>

      {movements.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay movimientos</h3>
          <p className="text-gray-600 mb-4">Comienza registrando tu primer movimiento</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Registrar Movimiento
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Producto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Cantidad</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Razón</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getMovementColor(movement.movement_type)}`}>
                        {getMovementIcon(movement.movement_type)}
                        {movement.movement_type.charAt(0).toUpperCase() + movement.movement_type.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {movement.product?.name || 'Producto eliminado'}
                        </p>
                        {movement.product?.sku && (
                          <p className="text-xs text-gray-500">SKU: {movement.product.sku}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">
                        {['salida', 'alquiler', 'venta'].includes(movement.movement_type) ? '-' : '+'}{movement.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <span className="text-gray-600">{movement.previous_stock}</span>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="font-semibold text-gray-900">{movement.new_stock}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {movement.reason || '-'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">{formatDate(movement.created_at)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Nuevo Movimiento</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Producto *
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Selecciona un producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Stock: {product.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Movimiento *
                </label>
                <select
                  value={formData.movement_type}
                  onChange={(e) => setFormData({ ...formData, movement_type: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                  <option value="ajuste">Ajuste</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="input-field"
                  min="1"
                  required
                />
                {formData.movement_type === 'ajuste' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Para ajustes, ingresa el nuevo stock total deseado
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Describe el motivo del movimiento..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movements;
