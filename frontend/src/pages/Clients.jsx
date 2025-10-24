import { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter } from 'lucide-react';
import { clientsService } from '../services/clientsService';
import Notification from '../components/Notification';
import ConfirmModal from '../components/ConfirmModal';
import { useNotification } from '../hooks/useNotification';
import { useOrganizationColors } from '../hooks/useOrganizationColors';
import ClientCard from '../components/clients/ClientCard';
import ClientFormModal from '../components/clients/ClientFormModal';
import ClientTransactionsModal from '../components/clients/ClientTransactionsModal';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [transactionsClient, setTransactionsClient] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, data: null });
  const { notification, hideNotification, showSuccess, showError } = useNotification();
  const { gradients } = useOrganizationColors();
  const [formData, setFormData] = useState({
    name: '',
    client_type: 'particular',
    status: 'activo',
    rnc: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    city: '',
    contact_person: '',
    notes: '',
    credit_limit: 0,
    credit_days: 0
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientsService.getClients();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim()) {
      try {
        const data = await clientsService.searchClients(value);
        setClients(data);
      } catch (error) {
        console.error('Error searching:', error);
      }
    } else {
      loadClients();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedClient) {
        await clientsService.updateClient(selectedClient.id, formData);
        showSuccess('Cliente actualizado correctamente');
      } else {
        await clientsService.createClient(formData);
        showSuccess('Cliente creado correctamente');
      }
      setShowModal(false);
      resetForm();
      loadClients();
    } catch (error) {
      console.error('Error saving client:', error);
      // Mostrar el mensaje de error específico del servidor
      const errorMessage = error.response?.data?.detail || 'Error al guardar el cliente';
      showError(errorMessage);
    }
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      client_type: client.client_type,
      status: client.status,
      rnc: client.rnc || '',
      email: client.email || '',
      phone: client.phone || '',
      mobile: client.mobile || '',
      address: client.address || '',
      city: client.city || '',
      contact_person: client.contact_person || '',
      notes: client.notes || '',
      credit_limit: client.credit_limit || 0,
      credit_days: client.credit_days || 0
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      action: 'delete',
      data: { id },
      title: 'Eliminar Cliente',
      message: '¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.',
      type: 'danger'
    });
  };

  const executeDelete = async (id) => {
    try {
      await clientsService.deleteClient(id);
      loadClients();
      showSuccess('Cliente eliminado correctamente');
    } catch (error) {
      console.error('Error deleting client:', error);
      showError('Error al eliminar el cliente');
    }
  };

  const handleConfirm = () => {
    const { action, data } = confirmModal;
    
    if (action === 'delete') {
      executeDelete(data.id);
    }
  };

  const resetForm = () => {
    setSelectedClient(null);
    setFormData({
      name: '',
      client_type: 'particular',
      status: 'activo',
      rnc: '',
      email: '',
      phone: '',
      mobile: '',
      address: '',
      city: '',
      contact_person: '',
      notes: '',
      credit_limit: 0,
      credit_days: 0
    });
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.rnc && client.rnc.includes(searchTerm)) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Mejorado */}
      <div 
        className="rounded-2xl shadow-lg p-6 text-white"
        style={{ background: gradients.clients }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Users size={32} />
              </div>
              Gestión de Clientes
            </h1>
            <p className="text-blue-100 ml-14">Administra tu cartera de clientes de forma eficiente</p>
            <div className="flex items-center gap-4 mt-3 ml-14">
              <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-semibold">{clients.length} Clientes</span>
              </div>
              <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-semibold">
                  {clients.filter(c => c.status === 'activo').length} Activos
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Plus size={20} />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros mejorada */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, RNC o email..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-medium">
            <Filter size={20} />
            Filtros
          </button>
        </div>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando clientes...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-gray-400" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron clientes</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer cliente'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Crear Primer Cliente
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewTransactions={(client) => {
                setTransactionsClient(client);
                setShowTransactionsModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modal con componente separado */}
      <ClientFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={!!selectedClient}
      />

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
          duration={notification.duration}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      {/* Transactions Modal */}
      <ClientTransactionsModal
        isOpen={showTransactionsModal}
        onClose={() => {
          setShowTransactionsModal(false);
          setTransactionsClient(null);
        }}
        client={transactionsClient}
      />
    </div>
  );
};

export default Clients;
