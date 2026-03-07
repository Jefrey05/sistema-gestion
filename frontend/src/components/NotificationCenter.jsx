import { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, Info, CheckCircle, Package, DollarSign, Calendar, FileText, Users, Trash2, CheckCheck } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { notificationsService } from '../services/notificationsService';
import { useCurrency } from '../hooks/useCurrency';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { formatCurrency } = useCurrency();

  // Cargar notificaciones basadas en datos reales
  useEffect(() => {
    loadNotifications();
    // Recargar cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      console.log('Cargando notificaciones desde el backend...');
      // Cargar notificaciones desde el backend
      const backendNotifications = await notificationsService.getNotifications();
      console.log('Notificaciones recibidas del backend:', backendNotifications);
      
      // Mapear las notificaciones del backend al formato del frontend
      const mappedNotifications = backendNotifications.map(notification => {
        // Mapear tipos a iconos
        const iconMap = {
          'warning': Package,
          'error': Calendar,
          'info': FileText,
          'success': Users
        };
        
        // Calcular tiempo relativo
        const timeAgo = getTimeAgo(notification.created_at);
        
        return {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          time: timeAgo,
          read: notification.is_read,
          icon: iconMap[notification.type] || Info
        };
      });
      
      console.log('Notificaciones mapeadas:', mappedNotifications);
      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      // Fallback a notificaciones vacías
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para calcular tiempo relativo
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} días`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeStyles = (type) => {
    const styles = {
      success: 'bg-green-100 text-green-600',
      warning: 'bg-yellow-100 text-yellow-600',
      error: 'bg-red-100 text-red-600',
      info: 'bg-blue-100 text-blue-600'
    };
    return styles[type] || styles.info;
  };

  const markAsRead = async (id) => {
    try {
      await notificationsService.markAsRead(id);
      // Actualizar el estado local para marcarla como leída (pero NO eliminarla)
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log('Marcando todas las notificaciones como leídas...');
      await notificationsService.markAllAsRead();
      console.log('Respuesta recibida del servidor');
      // Marcar todas como leídas en el estado local (pero NO eliminarlas)
      setNotifications(prevNotifications => 
        prevNotifications.map(n => ({ ...n, read: true }))
      );
      console.log('Estado local actualizado');
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsService.deleteNotification(id);
      // Actualizar el estado local
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };

  return (
    <div className="relative">
      {/* Botón de Notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Panel de Notificaciones */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 animate-fadeIn overflow-hidden">
            {/* Header con gradiente */}
            <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Bell size={24} />
                    Notificaciones
                  </h3>
                  <p className="text-sm text-blue-100 mt-1">
                    {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Lista de Notificaciones */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-500 mb-4">No hay alertas</p>
                  <p className="text-xs text-gray-400 mb-4">
                    Las alertas aparecerán cuando haya:<br/>
                    • ⚠️ Productos con stock bajo<br/>
                    • 📅 Alquileres próximos a vencer
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    Otras métricas están disponibles en el Dashboard
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        await notificationsService.generateTestNotifications();
                        await loadNotifications();
                      } catch (error) {
                        console.error('Error:', error);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Verificar Sistema
                  </button>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-all ${
                        !notification.read ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icono */}
                        <div className={`p-2.5 rounded-xl ${getTypeStyles(notification.type)} shadow-sm`}>
                          <Icon size={20} />
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1 animate-pulse"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-500 font-medium">
                              {notification.time}
                            </span>
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="Marcar como leída"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Ocultar notificación"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{notifications.length} notificación{notifications.length !== 1 ? 'es' : ''}</span>
                  <span className="text-gray-500">
                    {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leídas'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
