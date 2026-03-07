import { useState, useEffect } from 'react';
import { 
  AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp, 
  Filter, RefreshCw, Eye, Check, Trash2, AlertCircle,
  BarChart3, Activity, Shield, Bug
} from 'lucide-react';
import { failuresService } from '../services/failuresService';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';

const SystemFailures = () => {
  const [failures, setFailures] = useState([]);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFailure, setSelectedFailure] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    module: '',
    error_type: '',
    severity: '',
    is_resolved: null
  });
  const { notification, hideNotification, showSuccess, showError } = useNotification();

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [failuresData, summaryData, trendsData] = await Promise.all([
        failuresService.getFailures(filters),
        failuresService.getSummary(30),
        failuresService.getTrends(7)
      ]);
      setFailures(failuresData);
      setSummary(summaryData);
      setTrends(trendsData);
    } catch (error) {
      console.error('Error loading failures:', error);
      showError('Error al cargar las fallas del sistema');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveFailure = async (id, resolutionNotes) => {
    try {
      await failuresService.resolveFailure(id, resolutionNotes);
      showSuccess('Falla marcada como resuelta');
      loadData();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error resolving failure:', error);
      showError('Error al resolver la falla');
    }
  };

  const handleDeleteFailure = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta falla?')) return;
    
    try {
      await failuresService.deleteFailure(id);
      showSuccess('Falla eliminada correctamente');
      loadData();
    } catch (error) {
      console.error('Error deleting failure:', error);
      showError('Error al eliminar la falla');
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[severity] || colors.medium;
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: <XCircle className="w-5 h-5" />,
      high: <AlertTriangle className="w-5 h-5" />,
      medium: <AlertCircle className="w-5 h-5" />,
      low: <Activity className="w-5 h-5" />
    };
    return icons[severity] || icons.medium;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bug className="text-red-600" size={36} />
            Resumen de Fallas del Sistema
          </h1>
          <p className="text-gray-600 mt-1">Monitoreo y análisis de errores del sistema</p>
        </div>
        <button
          onClick={loadData}
          className="btn-primary flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw size={20} />
          Actualizar
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Total de Fallas</p>
                <p className="text-3xl font-bold text-red-700">{summary.total_failures}</p>
              </div>
              <AlertTriangle className="text-red-500" size={40} />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Sin Resolver</p>
                <p className="text-3xl font-bold text-orange-700">{summary.unresolved_failures}</p>
              </div>
              <Clock className="text-orange-500" size={40} />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Resueltas</p>
                <p className="text-3xl font-bold text-green-700">{summary.resolved_failures}</p>
              </div>
              <CheckCircle className="text-green-500" size={40} />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Críticas</p>
                <p className="text-3xl font-bold text-purple-700">{summary.critical_failures}</p>
              </div>
              <Shield className="text-purple-500" size={40} />
            </div>
          </div>
        </div>
      )}

      {/* Severity Distribution */}
      {summary && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Distribución por Severidad
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-2xl font-bold text-red-700">{summary.critical_failures}</p>
              <p className="text-sm text-red-600">Críticas</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-2xl font-bold text-orange-700">{summary.high_failures}</p>
              <p className="text-sm text-orange-600">Altas</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-2xl font-bold text-yellow-700">{summary.medium_failures}</p>
              <p className="text-sm text-yellow-600">Medias</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-700">{summary.low_failures}</p>
              <p className="text-sm text-blue-600">Bajas</p>
            </div>
          </div>
        </div>
      )}

      {/* Failures by Module */}
      {summary && Object.keys(summary.failures_by_module).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity size={20} />
            Fallas por Módulo
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(summary.failures_by_module).map(([module, count]) => (
              <div key={module} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-lg font-bold text-gray-800">{count}</p>
                <p className="text-sm text-gray-600 capitalize">{module}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} />
          <h3 className="text-lg font-semibold">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Módulo</label>
            <select
              value={filters.module}
              onChange={(e) => setFilters({ ...filters, module: e.target.value })}
              className="input"
            >
              <option value="">Todos</option>
              <option value="sales">Ventas</option>
              <option value="rentals">Alquileres</option>
              <option value="products">Productos</option>
              <option value="inventory">Inventario</option>
              <option value="clients">Clientes</option>
              <option value="quotations">Cotizaciones</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severidad</label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="input"
            >
              <option value="">Todas</option>
              <option value="critical">Crítica</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filters.is_resolved === null ? '' : filters.is_resolved.toString()}
              onChange={(e) => setFilters({ 
                ...filters, 
                is_resolved: e.target.value === '' ? null : e.target.value === 'true' 
              })}
              className="input"
            >
              <option value="">Todas</option>
              <option value="false">Sin Resolver</option>
              <option value="true">Resueltas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Error</label>
            <select
              value={filters.error_type}
              onChange={(e) => setFilters({ ...filters, error_type: e.target.value })}
              className="input"
            >
              <option value="">Todos</option>
              <option value="http_exception">HTTP Exception</option>
              <option value="validation_error">Validation Error</option>
              <option value="database_error">Database Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Failures List */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Lista de Fallas</h3>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : failures.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto text-green-400 mb-4" size={48} />
            <p className="text-gray-600">No hay fallas registradas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {failures.map((failure) => (
              <div
                key={failure.id}
                className={`p-4 rounded-lg border-2 ${
                  failure.is_resolved ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(failure.severity)} flex items-center gap-1`}>
                        {getSeverityIcon(failure.severity)}
                        {failure.severity.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {failure.module}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                        {failure.error_type}
                      </span>
                      {failure.is_resolved && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1">
                          <CheckCircle size={14} />
                          Resuelta
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{failure.error_message}</h4>
                    {failure.error_detail && (
                      <p className="text-sm text-gray-600 mb-2">{failure.error_detail}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatDate(failure.created_at)}</span>
                      {failure.endpoint && <span>Endpoint: {failure.endpoint}</span>}
                      {failure.method && <span>Método: {failure.method}</span>}
                      {failure.error_code && <span>Código: {failure.error_code}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedFailure(failure);
                        setShowDetailModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>
                    {!failure.is_resolved && (
                      <button
                        onClick={() => handleResolveFailure(failure.id, '')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Marcar como resuelta"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteFailure(failure.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedFailure && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Detalles de la Falla</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-semibold text-gray-700">ID:</label>
                  <p className="text-gray-900">{selectedFailure.id}</p>
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Severidad:</label>
                  <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(selectedFailure.severity)}`}>
                    {selectedFailure.severity.toUpperCase()}
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Módulo:</label>
                  <p className="text-gray-900">{selectedFailure.module}</p>
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Tipo de Error:</label>
                  <p className="text-gray-900">{selectedFailure.error_type}</p>
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Mensaje:</label>
                  <p className="text-gray-900">{selectedFailure.error_message}</p>
                </div>

                {selectedFailure.error_detail && (
                  <div>
                    <label className="font-semibold text-gray-700">Detalle:</label>
                    <p className="text-gray-900">{selectedFailure.error_detail}</p>
                  </div>
                )}

                {selectedFailure.stack_trace && (
                  <div>
                    <label className="font-semibold text-gray-700">Stack Trace:</label>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                      {selectedFailure.stack_trace}
                    </pre>
                  </div>
                )}

                {selectedFailure.request_data && (
                  <div>
                    <label className="font-semibold text-gray-700">Datos de la Petición:</label>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                      {selectedFailure.request_data}
                    </pre>
                  </div>
                )}

                <div>
                  <label className="font-semibold text-gray-700">Fecha:</label>
                  <p className="text-gray-900">{formatDate(selectedFailure.created_at)}</p>
                </div>

                {selectedFailure.is_resolved && (
                  <>
                    <div>
                      <label className="font-semibold text-gray-700">Resuelta el:</label>
                      <p className="text-gray-900">{formatDate(selectedFailure.resolved_at)}</p>
                    </div>
                    {selectedFailure.resolution_notes && (
                      <div>
                        <label className="font-semibold text-gray-700">Notas de Resolución:</label>
                        <p className="text-gray-900">{selectedFailure.resolution_notes}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {!selectedFailure.is_resolved && (
                <div className="mt-6 pt-6 border-t">
                  <button
                    onClick={() => {
                      const notes = prompt('Notas de resolución (opcional):');
                      if (notes !== null) {
                        handleResolveFailure(selectedFailure.id, notes);
                      }
                    }}
                    className="btn-primary bg-green-600 hover:bg-green-700 w-full"
                  >
                    Marcar como Resuelta
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

export default SystemFailures;
