import { useState, useEffect } from 'react';
import { Building2, Check, X, Pause, Eye, Users, Package, DollarSign, Calendar, Mail, Phone, Clock, Trash2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export default function AdminOrganizations() {
  const { user } = useAuthStore();
  const [organizations, setOrganizations] = useState([]);
  const [pendingOrgs, setPendingOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, all
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  
  // Estado para notificaciones
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const [approvalData, setApprovalData] = useState({
    approved: true,
    subscription_plan: 'basic',
    notes: ''
  });

  // Funciones para notificaciones visuales
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const showConfirm = async (title, message) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        title,
        message,
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        }
      });
    });
  };

  useEffect(() => {
    console.log('AdminOrganizations mounted, user:', user);
    console.log('Is super admin:', user?.organization_id === null);
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading data for tab:', activeTab);
      if (activeTab === 'pending') {
        console.log('Fetching pending organizations...');
        const response = await api.get('/organizations/admin/pending');
        console.log('Pending organizations response:', response.data);
        setPendingOrgs(response.data);
      } else {
        console.log('Fetching all organizations...');
        const response = await api.get('/organizations/admin/all');
        console.log('All organizations response:', response.data);
        setOrganizations(response.data);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
      console.error('Error details:', error.response?.data);
      showNotification('error', `Error al cargar organizaciones: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (org, approved) => {
    setSelectedOrg(org);
    setApprovalData({
      approved,
      subscription_plan: approved ? 'basic' : null,
      notes: ''
    });
    setShowApprovalModal(true);
  };

  const confirmApproval = async () => {
    try {
      await api.post(`/organizations/admin/${selectedOrg.id}/approve`, approvalData);
      
      showNotification(
        'success',
        approvalData.approved ? 'Organización aprobada exitosamente' : 'Organización rechazada'
      );
      
      setShowApprovalModal(false);
      setSelectedOrg(null);
      loadData();
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', 'Error al procesar la solicitud');
    }
  };

  const handleSuspend = async (orgId) => {
    const confirmed = await showConfirm(
      '¿Suspender esta organización?',
      'Los usuarios no podrán acceder al sistema'
    );

    if (confirmed) {
      try {
        await api.post(`/organizations/admin/${orgId}/suspend`);
        showNotification('success', 'Organización suspendida');
        loadData();
      } catch (error) {
        showNotification('error', 'Error al suspender');
      }
    }
  };

  const handleReactivate = async (orgId) => {
    try {
      await api.post(`/organizations/admin/${orgId}/reactivate`);
      showNotification('success', 'Organización reactivada');
      loadData();
    } catch (error) {
      showNotification('error', 'Error al reactivar');
    }
  };

  const handleDelete = async (org) => {
    const confirmed = await showConfirm(
      '⚠️ ELIMINAR ORGANIZACIÓN',
      `¿Estás COMPLETAMENTE SEGURO de eliminar "${org.name}"?\n\nEsta acción:\n✗ Eliminará TODOS los datos de la organización\n✗ Eliminará todos sus usuarios\n✗ Eliminará productos, ventas, clientes, etc.\n✗ NO se puede deshacer\n\n¿Deseas continuar?`
    );

    if (confirmed) {
      // Segunda confirmación
      const doubleConfirm = await showConfirm(
        'ÚLTIMA CONFIRMACIÓN',
        `Escribe el nombre de la organización para confirmar:\n"${org.name}"\n\n¿Confirmas eliminar permanentemente?`
      );

      if (doubleConfirm) {
        try {
          await api.delete(`/organizations/admin/${org.id}`);
          showNotification('success', 'Organización eliminada exitosamente');
          loadData();
        } catch (error) {
          console.error('Error:', error);
          showNotification('error', 'Error al eliminar la organización');
        }
      }
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      pending: 'Pendiente',
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Organizaciones</h1>
        <p className="text-gray-600 mt-2">Administra las empresas registradas en el sistema</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Clock className="inline w-5 h-5 mr-2" />
            Pendientes
            {pendingOrgs.length > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                {pendingOrgs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Building2 className="inline w-5 h-5 mr-2" />
            Todas las Organizaciones
          </button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeTab === 'pending' ? (
        <div className="grid gap-6">
          {pendingOrgs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes pendientes</h3>
              <p className="text-gray-600">Todas las organizaciones han sido revisadas</p>
            </div>
          ) : (
            pendingOrgs.map((org) => (
              <div key={org.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{org.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">Slug: {org.slug}</p>
                        {getStatusBadge(org.status)}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      {new Date(org.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                      <p className="text-gray-600">
                        <Mail className="inline w-4 h-4 mr-1" />
                        {org.email || 'No especificado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        <Phone className="inline w-4 h-4 mr-1" />
                        {org.phone || 'No especificado'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(org, true)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleApprove(org, false)}
                      className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleDelete(org)}
                      className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
                      title="Eliminar organización permanentemente"
                    >
                      <Trash2 className="w-5 h-5" />
                      Eliminar
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {organizations.map((org) => (
            <div key={org.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {org.logo_url ? (
                      <img 
                        src={org.logo_url.startsWith('http') ? org.logo_url : `https://sistema-gestion-api.onrender.com${org.logo_url}`} 
                        alt={org.name} 
                        className="w-12 h-12 rounded-lg object-contain bg-white p-1" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                      style={{display: org.logo_url ? 'none' : 'flex'}}
                    >
                      {org.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{org.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{org.email}</p>
                      <div className="flex gap-2 mt-2">
                        {getStatusBadge(org.status)}
                        {getPlanBadge(org.subscription_plan)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <Users className="w-5 h-5 text-blue-600 mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{org.total_users || 0}</p>
                    <p className="text-xs text-gray-600">Usuarios</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <Package className="w-5 h-5 text-green-600 mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{org.total_products || 0}</p>
                    <p className="text-xs text-gray-600">Productos</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <DollarSign className="w-5 h-5 text-purple-600 mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{org.total_sales || 0}</p>
                    <p className="text-xs text-gray-600">Ventas</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <Calendar className="w-5 h-5 text-orange-600 mb-1" />
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(org.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600">Registro</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {org.status === 'active' && (
                    <button
                      onClick={() => handleSuspend(org.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Pause className="w-4 h-4" />
                      Suspender
                    </button>
                  )}
                  {org.status === 'suspended' && (
                    <>
                      <button
                        onClick={() => handleReactivate(org.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Reactivar
                      </button>
                      <button
                        onClick={() => handleDelete(org)}
                        className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors flex items-center gap-2"
                        title="Eliminar organización permanentemente"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </>
                  )}
                  {org.status === 'cancelled' && (
                    <button
                      onClick={() => handleDelete(org)}
                      className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors flex items-center gap-2"
                      title="Eliminar organización permanentemente"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar de la Base de Datos
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {approvalData.approved ? 'Aprobar Organización' : 'Rechazar Organización'}
              </h3>
              
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  <strong>Organización:</strong> {selectedOrg.name}
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong> {selectedOrg.email}
                </p>
              </div>

              {approvalData.approved && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan de Suscripción
                  </label>
                  <select
                    value={approvalData.subscription_plan}
                    onChange={(e) => setApprovalData({ ...approvalData, subscription_plan: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="free">Gratis</option>
                    <option value="basic">Básico</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={approvalData.notes}
                  onChange={(e) => setApprovalData({ ...approvalData, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows="3"
                  placeholder="Agrega cualquier comentario..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmApproval}
                  className={`flex-1 text-white px-4 py-2 rounded-lg ${
                    approvalData.approved
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirmar
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`
            flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl border-2
            ${notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-900' : ''}
            ${notification.type === 'error' ? 'bg-red-50 border-red-500 text-red-900' : ''}
            ${notification.type === 'info' ? 'bg-blue-50 border-blue-500 text-blue-900' : ''}
          `}>
            {notification.type === 'success' && <CheckCircle className="w-6 h-6 text-green-600" />}
            {notification.type === 'error' && <AlertCircle className="w-6 h-6 text-red-600" />}
            {notification.type === 'info' && <Info className="w-6 h-6 text-blue-600" />}
            <p className="font-semibold">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{confirmDialog.title}</h3>
            </div>
            
            <p className="text-gray-700 mb-6 whitespace-pre-line">{confirmDialog.message}</p>

            <div className="flex gap-3">
              <button
                onClick={confirmDialog.onCancel}
                className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 font-semibold transition-all shadow-lg"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


