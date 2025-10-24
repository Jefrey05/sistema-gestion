import { useState, useEffect } from 'react';
import { X, Clock, Shield, LogOut } from 'lucide-react';
import api from '../services/api';

const SessionManagementModal = ({ isOpen, onClose, onSuccess, onError }) => {
  const [sessionSettings, setSessionSettings] = useState({
    timeout: 30, // minutos
    autoLogout: true,
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSessionSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      await api.put('/auth/session-settings', sessionSettings);
      
      onClose();
      onSuccess('Configuración de sesión guardada exitosamente');
    } catch (error) {
      console.error('Error saving session settings:', error);
      onError('Error al guardar la configuración. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllSessions = async () => {
    // La confirmación se manejará desde el componente padre

    try {
      await api.post('/auth/logout-all-sessions');
      
      onSuccess('Todas las sesiones han sido cerradas exitosamente.');
    } catch (error) {
      console.error('Error logging out all sessions:', error);
      onError('Error al cerrar las sesiones. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Gestión de Sesiones</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <form className="space-y-6">
            {/* Timeout de Sesión */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo de Inactividad (minutos)
              </label>
              <select
                name="timeout"
                value={sessionSettings.timeout}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
                <option value={120}>2 horas</option>
                <option value={480}>8 horas</option>
                <option value={0}>Nunca</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                La sesión se cerrará automáticamente después de este tiempo de inactividad
              </p>
            </div>

            {/* Auto Logout */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Cierre Automático de Sesión
                </label>
                <p className="text-xs text-gray-500">
                  Cerrar sesión automáticamente al cerrar el navegador
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="autoLogout"
                  checked={sessionSettings.autoLogout}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
              </label>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Recordar Sesión
                </label>
                <p className="text-xs text-gray-500">
                  Mantener la sesión activa por más tiempo
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={sessionSettings.rememberMe}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
              </label>
            </div>

            {/* Sesiones Activas */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Sesiones Activas
              </h4>
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900">Sesión Actual</p>
                    <p className="text-gray-600">Chrome - Windows 10</p>
                    <p className="text-xs text-gray-500">Activa ahora</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Activa
                  </span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleLogoutAllSessions}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut size={16} />
                Cerrar Todas las Sesiones
              </button>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SessionManagementModal;
