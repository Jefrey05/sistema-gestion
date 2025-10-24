import { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle, Clock, XCircle, DollarSign, Eye, Trash2, Package } from 'lucide-react';
import { rentalsService } from '../services/rentalsService';
import RentalForm from '../components/rentals/RentalForm';
import RentalDetailModal from '../components/rentals/RentalDetailModal';
import RentalPaymentModal from '../components/RentalPaymentModal';
import Notification from '../components/Notification';
import ConfirmModal from '../components/ConfirmModal';
import SearchBar from '../components/SearchBar';
import { useNotification } from '../hooks/useNotification';
import { useOrganizationColors } from '../hooks/useOrganizationColors';
import { formatDate } from '../utils/dateUtils';
import { useCurrency } from '../hooks/useCurrency';
import { useDateFilter } from '../contexts/DateFilterContext';

const Rentals = () => {
  const [rentals, setRentals] = useState([]);
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchFilters, setSearchFilters] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, data: null });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const { notification, hideNotification, showSuccess, showError, showWarning } = useNotification();
  const { gradients } = useOrganizationColors();
  const { formatCurrency } = useCurrency();
  const { startDate, endDate } = useDateFilter();

  useEffect(() => {
    loadRentals();
  }, [filter, startDate, endDate]);

  useEffect(() => {
    applySearchFilters();
  }, [rentals, searchFilters]);

  const loadRentals = async () => {
    try {
      setLoading(true);
      const params = {};
      
      // Filtro especial para "devuelto pero no pagado"
      if (filter === 'devuelto_no_pagado') {
        params.status = 'devuelto';
        params.unpaid = true;
      } else if (filter !== 'all') {
        params.status = filter;
      }
      
      // Agregar filtros de fecha si están definidos
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const data = await rentalsService.getRentals(params);
      
      // Filtrar en el frontend si es necesario
      if (filter === 'devuelto_no_pagado') {
        setRentals(data.filter(r => r.balance > 0));
      } else {
        setRentals(data);
      }
    } catch (error) {
      console.error('Error loading rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const applySearchFilters = () => {
    if (!searchFilters) {
      setFilteredRentals(rentals);
      return;
    }

    let filtered = [...rentals];

    // Búsqueda general
    if (searchFilters.searchTerm) {
      const term = searchFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.rental_number?.toLowerCase().includes(term) ||
        r.client?.name?.toLowerCase().includes(term) ||
        r.client?.email?.toLowerCase().includes(term)
      );
    }

    // Filtro por cliente
    if (searchFilters.client) {
      const clientTerm = searchFilters.client.toLowerCase();
      filtered = filtered.filter(r => 
        r.client?.name?.toLowerCase().includes(clientTerm)
      );
    }

    // Filtro por número
    if (searchFilters.number) {
      const numberTerm = searchFilters.number.toLowerCase();
      filtered = filtered.filter(r => 
        r.rental_number?.toLowerCase().includes(numberTerm)
      );
    }

    // Filtro por monto exacto
    if (searchFilters.amount) {
      filtered = filtered.filter(r => 
        r.total_cost === parseFloat(searchFilters.amount)
      );
    }

    // Filtro por fecha inicio
    if (searchFilters.startDate) {
      filtered = filtered.filter(r => 
        new Date(r.created_at) >= new Date(searchFilters.startDate)
      );
    }

    // Filtro por fecha fin
    if (searchFilters.endDate) {
      filtered = filtered.filter(r => 
        new Date(r.created_at) <= new Date(searchFilters.endDate + 'T23:59:59')
      );
    }

    setFilteredRentals(filtered);
  };

  const handleSearch = (filters) => {
    setSearchFilters(filters);
  };

  const getStatusBadge = (status) => {
    const badges = {
      activo: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      devuelto: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
      vencido: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      cancelado: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle }
    };
    return badges[status] || badges.activo;
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const badges = {
      pagado: { bg: 'bg-green-100', text: 'text-green-700', label: 'Pagado' },
      parcial: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Parcial' },
      pendiente_pago: { bg: 'bg-red-100', text: 'text-red-700', label: 'Pendiente' }
    };
    return badges[paymentStatus] || badges.pendiente_pago;
  };

  const handleChangeStatus = (rentalId, newStatus) => {
    setConfirmModal({
      isOpen: true,
      action: 'changeStatus',
      data: { rentalId, newStatus },
      title: 'Cambiar Estado',
      message: `¿Cambiar el estado del alquiler a "${newStatus}"?`,
      type: 'info'
    });
  };

  const executeChangeStatus = async (rentalId, newStatus) => {
    try {
      await rentalsService.updateRental(rentalId, { status: newStatus });
      loadRentals();
      showSuccess('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Error al actualizar el estado');
    }
  };

  const handleReturnRental = (rentalId) => {
    setConfirmModal({
      isOpen: true,
      action: 'returnRental',
      data: { rentalId },
      title: 'Marcar como Devuelto',
      message: '¿Marcar este alquiler como devuelto?',
      type: 'info'
    });
  };

  const executeReturnRental = async (rentalId) => {
    try {
      await rentalsService.updateRental(rentalId, { 
        status: 'devuelto',
        actual_return_date: new Date().toISOString()
      });
      loadRentals();
      showSuccess('Alquiler marcado como devuelto');
    } catch (error) {
      console.error('Error returning rental:', error);
      showError('Error al marcar como devuelto');
    }
  };


  const handleAddPayment = (rental) => {
    setSelectedRental(rental);
    setShowPaymentModal(true);
  };

  const handleViewDetails = (rental) => {
    setSelectedRental(rental);
    setShowDetails(true);
  };

  const handleCancelRental = (rentalId) => {
    setConfirmModal({
      isOpen: true,
      action: 'cancelRental',
      data: { rentalId },
      title: 'Cancelar Alquiler',
      message: '¿Estás seguro de que quieres cancelar este alquiler? Esta acción no se puede deshacer.',
      type: 'danger'
    });
  };

  const handlePaymentAdded = () => {
    loadRentals();
    showSuccess('Pago agregado exitosamente');
  };


  const executeCancelRental = async (rentalId) => {
    try {
      await rentalsService.cancelRental(rentalId);
      loadRentals();
      showSuccess('✅ Alquiler cancelado y stock devuelto');
    } catch (error) {
      console.error('Error canceling rental:', error);
      const errorMsg = error.response?.data?.detail || 'Error al cancelar el alquiler';
      showError('❌ ' + errorMsg);
    }
  };

  const handleConfirm = () => {
    const { action, data } = confirmModal;
    
    switch (action) {
      case 'changeStatus':
        executeChangeStatus(data.rentalId, data.newStatus);
        break;
      case 'returnRental':
        executeReturnRental(data.rentalId);
        break;
      case 'cancelRental':
        executeCancelRental(data.rentalId);
        break;
      default:
        break;
    }
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const totalAlquileres = rentals.reduce((sum, r) => sum + (r.total_cost || 0), 0);
  const alquileresActivos = rentals.filter(r => r.status === 'activo').length;
  const alquileresVencidos = rentals.filter(r => r.status === 'vencido').length;

  return (
    <div className="space-y-6">
      {/* Header Mejorado */}
      <div 
        className="rounded-2xl shadow-lg p-6 text-white"
        style={{ background: gradients.rentals }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Calendar size={32} />
              </div>
              Gestión de Alquileres
            </h1>
            <p className="text-teal-100 ml-14">Administra los alquileres de equipos</p>
            <div className="flex items-center gap-4 mt-3 ml-14 flex-wrap">
              <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-semibold">{rentals.length} Alquileres</span>
              </div>
              <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-semibold">{alquileresActivos} Activos</span>
              </div>
              {alquileresVencidos > 0 && (
                <div className="bg-red-500/30 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-red-300/30">
                  <span className="text-sm font-semibold">{alquileresVencidos} Vencidos</span>
                </div>
              )}
              <div className="bg-white/30 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/30">
                <span className="text-sm font-semibold">Total: {formatCurrency(totalAlquileres)}</span>
              </div>
            </div>
          </div>
          <button 
            className="bg-white text-teal-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Nuevo Alquiler
          </button>
        </div>
      </div>
      
      {showForm && (
        <RentalForm 
          onClose={() => setShowForm(false)} 
          onSuccess={() => {
            showSuccess('✅ Alquiler creado con éxito');
            loadRentals();
            setShowForm(false);
          }}
        />
      )}

      {/* Buscador */}
      <SearchBar 
        onSearch={handleSearch}
        placeholder="Buscar por número, cliente, email..."
        showFilters={true}
      />

      {/* Filters Mejorados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2 flex-wrap">
          {['all', 'activo', 'devuelto', 'devuelto_no_pagado', 'vencido', 'cancelado'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2.5 rounded-lg font-semibold transition-all ${
                filter === status
                  ? 'bg-teal-600 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Todos' : 
               status === 'devuelto_no_pagado' ? 'Devuelto pero No Pagado' :
               status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Rentals List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron alquileres</p>
          {searchFilters && (
            <p className="text-gray-400 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRentals.map((rental) => {
            const statusInfo = getStatusBadge(rental.status);
            const StatusIcon = statusInfo.icon;
            const daysRemaining = getDaysRemaining(rental.end_date);
            
            return (
              <div key={rental.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-purple-50 p-3 rounded-xl">
                      <Calendar className="text-purple-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900">{rental.rental_number}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusInfo.bg} ${statusInfo.text}`}>
                          <StatusIcon size={14} />
                          {rental.status}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPaymentStatusBadge(rental.payment_status).bg} ${getPaymentStatusBadge(rental.payment_status).text}`}>
                          {getPaymentStatusBadge(rental.payment_status).label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Cliente: {rental.client?.name || 'N/A'} • 
                        {new Date(rental.created_at || rental.start_date).toLocaleString('es-ES', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {/* Mostrar productos */}
                      {rental.items && rental.items.length > 0 ? (
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <Package size={14} className="text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {rental.items.map(item => `${item.product_name || item.product?.name || 'Producto'} (${item.quantity})`).join(', ')}
                          </span>
                        </div>
                      ) : rental.product && (
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <Package size={14} className="text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {rental.product.name || 'Producto'}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Inicio: {formatDate(rental.start_date)} • 
                        Fin: {formatDate(rental.end_date)}
                        {rental.status === 'activo' && daysRemaining >= 0 && (
                          <span className={`ml-2 ${daysRemaining <= 3 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                            ({daysRemaining} días restantes)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(rental.total_cost)}</p>
                    <p className="text-sm text-green-600">Pagado: {formatCurrency(rental.paid_amount)}</p>
                    {rental.balance > 0 && (
                      <p className="text-sm text-red-600">Pendiente: {formatCurrency(rental.balance)}</p>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="ml-4 flex gap-2">
                    <button 
                      onClick={() => handleViewDetails(rental)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Ver detalles"
                    >
                      <Eye size={20} />
                    </button>
                    {rental.balance > 0 && (
                      <button 
                        onClick={() => handleAddPayment(rental)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Agregar pago"
                      >
                        <DollarSign size={20} />
                      </button>
                    )}
                    {rental.status === 'activo' && (
                      <>
                        <button 
                          onClick={() => handleReturnRental(rental.id)}
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          title="Marcar como devuelto"
                        >
                          <CheckCircle size={20} />
                        </button>
                      </>
                    )}
                    {rental.status === 'activo' && daysRemaining < 0 && (
                      <button 
                        onClick={() => handleChangeStatus(rental.id, 'vencido')}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Marcar como vencido"
                      >
                        <XCircle size={20} />
                      </button>
                    )}
                    {rental.status !== 'cancelado' && rental.status !== 'devuelto' && (
                      <button 
                        onClick={() => handleCancelRental(rental.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Cancelar alquiler"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rentals.length === 0 && !loading && (
        <div className="text-center py-12">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No hay alquileres registrados</p>
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

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      {/* Payment Modal */}
      <RentalPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        rental={selectedRental}
        onPaymentAdded={handlePaymentAdded}
      />

      {/* Detail Modal */}
      {showDetails && selectedRental && (
        <RentalDetailModal
          rental={selectedRental}
          onClose={() => {
            setShowDetails(false);
            setSelectedRental(null);
          }}
        />
      )}
    </div>
  );
};

export default Rentals;
