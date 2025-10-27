import { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Mail, Phone, MapPin, Calendar, Users, X, Save, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export default function AdminOrganizations() {
  const { user } = useAuthStore();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    organization_name: '',
    admin_email: '',
    admin_password: '',
    admin_full_name: '',
    phone: '',
    address: '',
    subscription_plan: 'basic'
  });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/organizations/admin/all');
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error loading organizations:', error);
      showNotification('error', 'Error al cargar organizaciones');
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    if (!window.confirm('¿Ejecutar migración de organizaciones? Solo hazlo UNA VEZ.')) {
      return;
    }
    
    try {
      const response = await api.get('/organizations/admin/migrate');
      showNotification('success', response.data.message);
      loadOrganizations();
    } catch (error) {
      console.error('Error en migración:', error);
      showNotification('error', error.response?.data?.detail || 'Error en migración');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/organizations/admin/create', formData);
      showNotification('success', 'Organización creada exitosamente');
      setShowModal(false);
      setFormData({
        organization_name: '',
        admin_email: '',
        admin_password: '',
        admin_full_name: '',
        phone: '',
        address: '',
        subscription_plan: 'basic'
      });
      loadOrganizations();
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', error.response?.data?.detail || 'Error al crear organización');
    }
  };

  const handleDelete = async (org) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${org.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      await api.delete(`/organizations/admin/${org.id}`);
      showNotification('success', 'Organización eliminada');
      loadOrganizations();
    } catch (error) {
      showNotification('error', 'Error al eliminar organización');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      active: 'Activa',
      suspended: 'Suspendida',
      cancelled: 'Cancelada'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getPlanBadge = (plan) => {
    const styles = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-indigo-100 text-indigo-800'
    };

    const labels = {
      free: 'Gratis',
      basic: 'Básico',
      premium: 'Premium',
      enterprise: 'Enterprise'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[plan]}`}>
        {labels[plan]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestión de Organizaciones</h1>
            <p className="text-gray-600">Administra las empresas registradas en el sistema</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={runMigration}
              className="bg-yellow-600 text-white px-4 py-3 rounded-xl hover:bg-yellow-700 transition-all shadow-lg flex items-center gap-2 font-semibold"
              title="Ejecutar migración (solo una vez)"
            >
              🔄 Migrar
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Nueva Organización
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : organizations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <Building2 className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay organizaciones</h3>
            <p className="text-gray-600 mb-6">Comienza creando tu primera organización</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nueva Organización
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {organizations.map((org) => (
              <div key={org.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {org.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{org.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {org.email}
                        </span>
                        {org.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {org.phone}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(org.status)}
                        {getPlanBadge(org.subscription_plan)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(org)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Eliminar organización"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {org.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <MapPin className="w-4 h-4" />
                    {org.address}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{org.total_users || 1}</p>
                    <p className="text-xs text-gray-600">Usuario</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(org.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600">Creada</p>
                  </div>
                  <div className="text-center">
                    <Building2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-gray-900">{org.slug}</p>
                    <p className="text-xs text-gray-600">Slug</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Nueva Organización */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Nueva Organización</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información de la Organización */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Organización</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Organización *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.organization_name}
                      onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Mi Empresa S.A."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(809) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Plan de Suscripción
                      </label>
                      <select
                        value={formData.subscription_plan}
                        onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="basic">Básico</option>
                        <option value="premium">Premium</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Calle, Ciudad, País"
                    />
                  </div>
                </div>
              </div>

              {/* Información del Administrador */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usuario Administrador</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.admin_full_name}
                      onChange={(e) => setFormData({ ...formData, admin_full_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.admin_email}
                      onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="admin@empresa.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.admin_password}
                      onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mínimo 8 caracteres"
                      minLength={8}
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Crear Organización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`
            flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-2
            ${notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-900' : ''}
            ${notification.type === 'error' ? 'bg-red-50 border-red-500 text-red-900' : ''}
          `}>
            {notification.type === 'success' && <CheckCircle className="w-6 h-6 text-green-600" />}
            {notification.type === 'error' && <AlertCircle className="w-6 h-6 text-red-600" />}
            <p className="font-semibold">{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
