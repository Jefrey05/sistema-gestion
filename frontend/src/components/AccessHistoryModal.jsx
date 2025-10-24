import { useState, useEffect } from 'react';
import { X, Clock, MapPin, Monitor, Smartphone, Tablet } from 'lucide-react';

const AccessHistoryModal = ({ isOpen, onClose }) => {
  const [accessHistory, setAccessHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, today, week, month

  useEffect(() => {
    if (isOpen) {
      loadAccessHistory();
    }
  }, [isOpen, filter]);

  const loadAccessHistory = async () => {
    setLoading(true);
    
    try {
      // Aquí iría la llamada al backend para obtener el historial
      // const response = await api.get('/auth/access-history', { params: { filter } });
      
      // Por ahora simulamos datos
      const mockData = [
        {
          id: 1,
          timestamp: new Date().toISOString(),
          ip: '192.168.1.100',
          location: 'Santo Domingo, República Dominicana',
          device: 'Chrome - Windows 10',
          deviceType: 'desktop',
          status: 'success'
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          ip: '192.168.1.101',
          location: 'Santo Domingo, República Dominicana',
          device: 'Safari - iPhone 13',
          deviceType: 'mobile',
          status: 'success'
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          ip: '192.168.1.102',
          location: 'Santiago, República Dominicana',
          device: 'Firefox - Android',
          deviceType: 'mobile',
          status: 'failed'
        },
        {
          id: 4,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          ip: '192.168.1.103',
          location: 'Santo Domingo, República Dominicana',
          device: 'Chrome - iPad',
          deviceType: 'tablet',
          status: 'success'
        }
      ];
      
      setAccessHistory(mockData);
    } catch (error) {
      console.error('Error loading access history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    return status === 'success' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60 * 1000) return 'Hace un momento';
    if (diff < 60 * 60 * 1000) return `Hace ${Math.floor(diff / (60 * 1000))} minutos`;
    if (diff < 24 * 60 * 60 * 1000) return `Hace ${Math.floor(diff / (60 * 60 * 1000))} horas`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2 rounded-lg">
              <Clock className="text-indigo-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Historial de Accesos</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Filtros */}
          <div className="mb-6">
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'Todos' },
                { key: 'today', label: 'Hoy' },
                { key: 'week', label: 'Esta Semana' },
                { key: 'month', label: 'Este Mes' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Accesos */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : accessHistory.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">No hay registros de acceso</p>
              </div>
            ) : (
              accessHistory.map((access) => (
                <div
                  key={access.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg border">
                        {getDeviceIcon(access.deviceType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{access.device}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(access.status)}`}>
                            {access.status === 'success' ? 'Exitoso' : 'Fallido'}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <span>{access.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(access.timestamp)}</span>
                          </div>
                          <p className="text-xs text-gray-500">IP: {access.ip}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Información Adicional */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Información de Seguridad</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los accesos fallidos pueden indicar intentos de intrusión</li>
              <li>• Si ves accesos desde ubicaciones desconocidas, cambia tu contraseña</li>
              <li>• Puedes cerrar sesiones remotas desde la gestión de sesiones</li>
            </ul>
          </div>

          {/* Botón Cerrar */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessHistoryModal;


