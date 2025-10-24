import { useState, useEffect } from 'react';
import { FileText, Plus, Search, Eye, CheckCircle, XCircle, Clock, Edit, Trash2, DollarSign, Package } from 'lucide-react';
import { quotationsService } from '../services/quotationsService';
import QuotationFormCompact from '../components/quotations/QuotationFormCompact';
import QuotationRentalForm from '../components/quotations/QuotationRentalFormFinal';
import QuotationDetailModal from '../components/quotations/QuotationDetailModal';
import Notification from '../components/Notification';
import ConfirmModal from '../components/ConfirmModal';
import PaymentMethodModal from '../components/PaymentMethodModal';
import RentalDataModal from '../components/RentalDataModal';
import SearchBar from '../components/SearchBar';
import { useNotification } from '../hooks/useNotification';
import { useOrganizationColors } from '../hooks/useOrganizationColors';
import { useCurrency } from '../hooks/useCurrency';
import { useDateFilter } from '../contexts/DateFilterContext';
import { formatDateTime } from '../utils/dateUtils';

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchFilters, setSearchFilters] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [quotationType, setQuotationType] = useState('venta'); // 'venta' o 'alquiler'
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, data: null });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [showRentalPaymentModal, setShowRentalPaymentModal] = useState(false);
  const [quotationToConvert, setQuotationToConvert] = useState(null);
  const { notification, hideNotification, showSuccess, showError, showWarning } = useNotification();
  const { gradients } = useOrganizationColors();
  const { formatCurrency } = useCurrency();
  const { startDate, endDate } = useDateFilter();

  useEffect(() => {
    loadQuotations();
  }, [filter, startDate, endDate]);

  useEffect(() => {
    applySearchFilters();
  }, [quotations, searchFilters]);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      
      // Agregar filtros de fecha si están definidos
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const data = await quotationsService.getQuotations(params);
      setQuotations(data);
    } catch (error) {
      console.error('Error loading quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const applySearchFilters = () => {
    if (!searchFilters) {
      setFilteredQuotations(quotations);
      return;
    }

    let filtered = [...quotations];

    // Búsqueda general
    if (searchFilters.searchTerm) {
      const term = searchFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(q => 
        q.quotation_number?.toLowerCase().includes(term) ||
        q.client?.name?.toLowerCase().includes(term) ||
        q.client?.email?.toLowerCase().includes(term)
      );
    }

    // Filtro por cliente
    if (searchFilters.client) {
      const clientTerm = searchFilters.client.toLowerCase();
      filtered = filtered.filter(q => 
        q.client?.name?.toLowerCase().includes(clientTerm)
      );
    }

    // Filtro por número
    if (searchFilters.number) {
      const numberTerm = searchFilters.number.toLowerCase();
      filtered = filtered.filter(q => 
        q.quotation_number?.toLowerCase().includes(numberTerm)
      );
    }

    // Filtro por monto exacto
    if (searchFilters.amount) {
      filtered = filtered.filter(q => 
        q.total === parseFloat(searchFilters.amount)
      );
    }

    // Filtro por fecha inicio
    if (searchFilters.startDate) {
      filtered = filtered.filter(q => 
        new Date(q.created_at) >= new Date(searchFilters.startDate)
      );
    }

    // Filtro por fecha fin
    if (searchFilters.endDate) {
      filtered = filtered.filter(q => 
        new Date(q.created_at) <= new Date(searchFilters.endDate + 'T23:59:59')
      );
    }

    setFilteredQuotations(filtered);
  };

  const handleSearch = (filters) => {
    setSearchFilters(filters);
  };

  const handleChangeStatus = async (quotationId, newStatus) => {
    setConfirmModal({
      isOpen: true,
      action: 'changeStatus',
      data: { quotationId, newStatus },
      title: 'Cambiar Estado',
      message: `¿Estás seguro de cambiar el estado a "${newStatus}"?`,
      type: 'info'
    });
  };

  const executeChangeStatus = async (quotationId, newStatus) => {
    try {
      await quotationsService.updateQuotationStatus(quotationId, newStatus);
      loadQuotations();
      showSuccess('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Error al actualizar el estado');
    }
  };

  const handleConvertToSale = (quotationId) => {
    const quotation = quotations.find(q => q.id === quotationId);
    setQuotationToConvert(quotation);
    setShowPaymentModal(true);
  };

  const handleConvertToRental = (quotationId) => {
    const quotation = quotations.find(q => q.id === quotationId);
    setQuotationToConvert(quotation);
    setShowRentalPaymentModal(true);
  };

  const executeConvertToSale = async (quotationId, paymentMethod) => {
    try {
      console.log('Converting quotation', quotationId, 'with payment method:', paymentMethod);
      const sale = await quotationsService.convertToSale(quotationId, paymentMethod);
      console.log('Sale created:', sale);
      loadQuotations();
      showSuccess(`¡Cotización convertida a venta exitosamente! Número: ${sale.sale_number || 'N/A'}`);
    } catch (error) {
      console.error('Error converting to sale:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Error desconocido';
      showError(`Error al convertir a venta: ${errorMsg}`);
    }
  };

  const executeConvertToRental = async (quotationId, rentalData) => {
    try {
      console.log('Converting quotation', quotationId, 'to rental with data:', rentalData);
      const rental = await quotationsService.convertToRental(quotationId, rentalData);
      console.log('Rental created:', rental);
      loadQuotations();
      showSuccess(`¡Cotización convertida a alquiler exitosamente! Número: ${rental.rental_number || 'N/A'}`);
    } catch (error) {
      console.error('Error converting to rental:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Error desconocido';
      showError(`Error al convertir a alquiler: ${errorMsg}`);
    }
  };

  const handleEdit = async (quotation) => {
    try {
      console.log('🔍 Verificando si se puede editar cotización:', quotation.id);
      
      // Verificar si la cotización puede ser editada
      const { can_edit, reason } = await quotationsService.canEdit(quotation.id);
      
      console.log('✅ Respuesta can_edit:', can_edit, 'reason:', reason);
      
      if (!can_edit) {
        showError(`No se puede editar: ${reason}`);
        return;
      }
      
      // Si puede editarse, abrir el formulario de edición
      console.log('✅ Abriendo formulario de edición');
      setSelectedQuotation(quotation);
      setQuotationType(quotation.quotation_type || 'venta');
      setShowForm(true);
    } catch (error) {
      console.error('❌ Error checking if quotation can be edited:', error);
      console.error('❌ Error details:', error.response?.data);
      showError('Error al verificar si la cotización puede ser editada: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = (quotationId) => {
    setConfirmModal({
      isOpen: true,
      action: 'delete',
      data: { quotationId },
      title: 'Eliminar Cotización',
      message: '¿Estás seguro de eliminar esta cotización? Esta acción no se puede deshacer.',
      type: 'danger'
    });
  };

  const executeDelete = async (quotationId) => {
    try {
      await quotationsService.deleteQuotation(quotationId);
      loadQuotations();
      showSuccess('Cotización eliminada correctamente');
    } catch (error) {
      console.error('Error deleting quotation:', error);
      const errorMsg = error.response?.data?.detail || 'Error al eliminar la cotización';
      showError(errorMsg);
    }
  };

  const handleConfirm = () => {
    const { action, data } = confirmModal;
    
    switch (action) {
      case 'changeStatus':
        executeChangeStatus(data.quotationId, data.newStatus);
        break;
      case 'delete':
        executeDelete(data.quotationId);
        break;
      default:
        break;
    }
  };

  const handlePaymentMethodConfirm = async (paymentMethod) => {
    if (quotationToConvert) {
      await executeConvertToSale(quotationToConvert.id, paymentMethod);
      setShowPaymentModal(false);
      setQuotationToConvert(null);
    }
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setQuotationToConvert(null);
  };

  const handleRentalDataConfirm = async (rentalData) => {
    if (quotationToConvert) {
      await executeConvertToRental(quotationToConvert.id, rentalData);
      setShowRentalModal(false);
      setQuotationToConvert(null);
    }
  };

  const handleRentalModalClose = () => {
    setShowRentalModal(false);
    setQuotationToConvert(null);
  };

  const handleRentalPaymentMethodConfirm = async (paymentMethod) => {
    if (quotationToConvert) {
      // Extraer datos de las notas
      const notes = quotationToConvert.notes || '';
      const startDateMatch = notes.match(/Fecha Inicio: (\d{4}-\d{2}-\d{2})/);
      const endDateMatch = notes.match(/Fecha Fin: (\d{4}-\d{2}-\d{2})/);
      const depositMatch = notes.match(/Depósito: ([\d.]+)/);
      
      const rentalData = {
        start_date: startDateMatch ? startDateMatch[1] : new Date().toISOString().split('T')[0],
        end_date: endDateMatch ? endDateMatch[1] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        rental_period: 'daily',
        deposit: depositMatch ? parseFloat(depositMatch[1]) : 0,
        payment_method: paymentMethod,
        condition_out: ''
      };
      
      await executeConvertToRental(quotationToConvert.id, rentalData);
      setShowRentalPaymentModal(false);
      setQuotationToConvert(null);
    }
  };

  const handleRentalPaymentModalClose = () => {
    setShowRentalPaymentModal(false);
    setQuotationToConvert(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      aceptada: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      rechazada: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      convertida: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
      vencida: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle }
    };
    return badges[status] || badges.pendiente;
  };

  const totalCotizaciones = quotations.reduce((sum, q) => sum + (q.total || 0), 0);
  const cotizacionesPendientes = quotations.filter(q => q.status === 'pendiente').length;
  const cotizacionesAceptadas = quotations.filter(q => q.status === 'aceptada').length;

  return (
    <div className="space-y-6">
      {/* Header Mejorado */}
      <div 
        className="rounded-2xl shadow-lg p-6 text-white"
        style={{ background: gradients.quotations }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <FileText size={32} />
              </div>
              Gestión de Cotizaciones
            </h1>
            <p className="text-cyan-100 ml-14">Administra tus cotizaciones y presupuestos</p>
            <div className="flex items-center gap-4 mt-3 ml-14 flex-wrap">
              <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-semibold">{quotations.length} Cotizaciones</span>
              </div>
              <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-semibold">{cotizacionesPendientes} Pendientes</span>
              </div>
              <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-semibold">{cotizacionesAceptadas} Aceptadas</span>
              </div>
              <div className="bg-white/30 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/30">
                <span className="text-sm font-semibold">Total: {formatCurrency(totalCotizaciones)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              type="button"
              className="bg-white text-cyan-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-cyan-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              onClick={() => {
                console.log('Abriendo formulario de cotización de ventas');
                setQuotationType('venta');
                setShowForm(true);
              }}
            >
              <Plus size={20} />
              Nueva Cotización Ventas
            </button>
            <button 
              type="button"
              className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              onClick={() => {
                console.log('Abriendo formulario de cotización de alquiler');
                setQuotationType('alquiler');
                setShowForm(true);
              }}
            >
              <Plus size={20} />
              Nueva Cotización Alquiler
            </button>
          </div>
        </div>
      </div>
      
      {showForm && quotationType === 'venta' && (
        <QuotationFormCompact 
          quotationType={quotationType}
          quotation={selectedQuotation}
          onClose={() => {
            setShowForm(false);
            setSelectedQuotation(null);
          }} 
          onSuccess={() => {
            showSuccess(selectedQuotation ? '✅ Cotización actualizada con éxito' : '✅ Cotización creada con éxito');
            loadQuotations();
            setShowForm(false);
            setSelectedQuotation(null);
          }}
        />
      )}

      {showForm && quotationType === 'alquiler' && (
        <QuotationRentalForm 
          quotation={selectedQuotation}
          onClose={() => {
            setShowForm(false);
            setSelectedQuotation(null);
          }} 
          onSuccess={() => {
            showSuccess(selectedQuotation ? '✅ Cotización de alquiler actualizada con éxito' : '✅ Cotización de alquiler creada con éxito');
            loadQuotations();
            setShowForm(false);
            setSelectedQuotation(null);
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Estado</h3>
          <div className="flex gap-2 flex-wrap">
            {['all', 'pendiente', 'aceptada', 'rechazada', 'convertida'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2.5 rounded-lg font-semibold transition-all ${
                  filter === status
                    ? 'bg-cyan-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Todas' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quotations List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredQuotations.length === 0 ? (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron cotizaciones</p>
          {searchFilters && (
            <p className="text-gray-400 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredQuotations.map((quotation) => {
            const statusInfo = getStatusBadge(quotation.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={quotation.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <FileText className="text-blue-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900">{quotation.quotation_number}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusInfo.bg} ${statusInfo.text}`}>
                          <StatusIcon size={14} />
                          {quotation.status}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${quotation.quotation_type === 'alquiler' ? 'bg-purple-100 text-purple-700' : 'bg-cyan-100 text-cyan-700'}`}>
                          {quotation.quotation_type === 'alquiler' ? 'Alquiler' : 'Venta'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Cliente: {quotation.client?.name || 'N/A'} • 
                        {formatDateTime(quotation.created_at || quotation.quotation_date, {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {/* Mostrar productos */}
                      {quotation.items && quotation.items.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <Package size={14} className="text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {quotation.items.map(item => `${item.product_name || item.product?.name || 'Producto'} (${item.quantity})`).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(quotation.total)}</p>
                    <p className="text-sm text-gray-600">{quotation.items?.length || 0} items</p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="ml-4 flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedQuotation(quotation);
                        setShowDetails(true);
                      }}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Ver detalles"
                    >
                      <Eye size={20} />
                    </button>
                    
                    {/* Botón Editar - Solo si no ha sido convertida */}
                    <button 
                      onClick={() => handleEdit(quotation)}
                      className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                      title="Editar cotización"
                    >
                      <Edit size={20} />
                    </button>
                    
                    {quotation.status === 'pendiente' && (
                      <>
                        <button 
                          onClick={() => handleChangeStatus(quotation.id, 'aceptada')}
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          title="Aceptar"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button 
                          onClick={() => handleChangeStatus(quotation.id, 'rechazada')}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Rechazar"
                        >
                          <XCircle size={20} />
                        </button>
                      </>
                    )}
                    {quotation.status === 'aceptada' && (
                      <>
                        {quotation.quotation_type === 'venta' ? (
                          <button 
                            onClick={() => handleConvertToSale(quotation.id)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Convertir a venta"
                          >
                            <DollarSign size={20} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleConvertToRental(quotation.id)}
                            className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                            title="Convertir a alquiler"
                          >
                            <DollarSign size={20} />
                          </button>
                        )}
                      </>
                    )}
                    <button 
                      onClick={() => handleDelete(quotation.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {quotations.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No hay cotizaciones</p>
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

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={handlePaymentModalClose}
        onConfirm={handlePaymentMethodConfirm}
        defaultMethod={quotationToConvert?.payment_method || 'efectivo'}
      />

      {/* Rental Data Modal */}
      <RentalDataModal
        isOpen={showRentalModal}
        onClose={handleRentalModalClose}
        onConfirm={handleRentalDataConfirm}
        quotation={quotationToConvert}
      />

      {/* Rental Payment Method Modal */}
      <PaymentMethodModal
        isOpen={showRentalPaymentModal}
        onClose={handleRentalPaymentModalClose}
        onConfirm={handleRentalPaymentMethodConfirm}
        defaultMethod={quotationToConvert?.payment_method || 'efectivo'}
        title="Seleccionar Método de Pago para Alquiler"
      />

      {/* Detail Modal */}
      {showDetails && selectedQuotation && (
        <QuotationDetailModal
          quotation={selectedQuotation}
          onClose={() => {
            setShowDetails(false);
            setSelectedQuotation(null);
          }}
        />
      )}
    </div>
  );
};

export default Quotations;
