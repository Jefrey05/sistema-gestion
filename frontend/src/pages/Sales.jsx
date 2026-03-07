import { useState, useEffect, useMemo, useCallback } from 'react';
import { ShoppingCart, Plus, DollarSign, CheckCircle, Clock, XCircle, Edit, Trash2 } from 'lucide-react';
import { salesService } from '../services/salesService';
import SaleFormCompact from '../components/sales/SaleFormCompact';
import SaleDetailModal from '../components/sales/SaleDetailModal';
import Notification from '../components/Notification';
import ConfirmModal from '../components/ConfirmModal';
import AddPaymentModal from '../components/AddPaymentModal';
import SalesListItem from '../components/SalesListItem';
import SearchBar from '../components/SearchBar';
import { useNotification } from '../hooks/useNotification';
import { useOrganizationColors } from '../hooks/useOrganizationColors';
import { useCurrency } from '../hooks/useCurrency';
import { useDateFilter } from '../contexts/DateFilterContext';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchFilters, setSearchFilters] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, data: null });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [saleForPayment, setSaleForPayment] = useState(null);
  const { notification, hideNotification, showSuccess, showError, showWarning } = useNotification();
  const { gradients } = useOrganizationColors();
  const { formatCurrency } = useCurrency();
  const { startDate, endDate } = useDateFilter();

  useEffect(() => {
    loadSales();
  }, [filter, startDate, endDate]);

  useEffect(() => {
    applySearchFilters();
  }, [sales, searchFilters]);

  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      
      // Agregar filtros de fecha si están definidos
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const data = await salesService.getSales(params);
      setSales(data);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, startDate, endDate]);

  const applySearchFilters = () => {
    if (!searchFilters) {
      setFilteredSales(sales);
      return;
    }

    let filtered = [...sales];

    // Búsqueda general
    if (searchFilters.searchTerm) {
      const term = searchFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.sale_number?.toLowerCase().includes(term) ||
        s.client?.name?.toLowerCase().includes(term) ||
        s.client?.email?.toLowerCase().includes(term)
      );
    }

    // Filtro por cliente
    if (searchFilters.client) {
      const clientTerm = searchFilters.client.toLowerCase();
      filtered = filtered.filter(s => 
        s.client?.name?.toLowerCase().includes(clientTerm)
      );
    }

    // Filtro por número
    if (searchFilters.number) {
      const numberTerm = searchFilters.number.toLowerCase();
      filtered = filtered.filter(s => 
        s.sale_number?.toLowerCase().includes(numberTerm)
      );
    }

    // Filtro por monto exacto
    if (searchFilters.amount) {
      filtered = filtered.filter(s => 
        s.total === parseFloat(searchFilters.amount)
      );
    }

    // Filtro por fecha inicio
    if (searchFilters.startDate) {
      filtered = filtered.filter(s => 
        new Date(s.created_at) >= new Date(searchFilters.startDate)
      );
    }

    // Filtro por fecha fin
    if (searchFilters.endDate) {
      filtered = filtered.filter(s => 
        new Date(s.created_at) <= new Date(searchFilters.endDate + 'T23:59:59')
      );
    }

    setFilteredSales(filtered);
  };

  const handleSearch = (filters) => {
    setSearchFilters(filters);
  };

  const handleChangeStatus = useCallback((saleId, newStatus) => {
    setConfirmModal({
      isOpen: true,
      action: 'changeStatus',
      data: { saleId, newStatus },
      title: 'Cambiar Estado',
      message: `¿Cambiar el estado de la venta a "${newStatus}"?`,
      type: 'info'
    });
  }, []);

  const executeChangeStatus = async (saleId, newStatus) => {
    try {
      await salesService.updateSale(saleId, { status: newStatus });
      loadSales();
      showSuccess('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Error al actualizar el estado');
    }
  };

  const handleAddPayment = useCallback((sale) => {
    setSaleForPayment(sale);
    setShowPaymentModal(true);
  }, []);

  const executeAddPayment = async (saleId, amount, paymentMethod, paymentReference = '') => {
    try {
      await salesService.createPayment({
        sale_id: saleId,
        amount: amount,
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        payment_date: new Date().toISOString()
      });
      
      // Si hay referencia, actualizar también la venta principal para que aparezca en el modal
      if (paymentReference) {
        await salesService.updateSale(saleId, { payment_reference: paymentReference });
      }
      
      loadSales();
      showSuccess(`Pago de ${formatCurrency(amount)} registrado correctamente`);
    } catch (error) {
      console.error('Error adding payment:', error);
      showError('Error al registrar el pago');
    }
  };

  const handleCancelSale = useCallback((saleId) => {
    setConfirmModal({
      isOpen: true,
      action: 'cancelSale',
      data: { saleId },
      title: 'Cancelar Venta',
      message: '¿Estás seguro de cancelar esta venta? Esta acción no se puede deshacer.',
      type: 'danger'
    });
  }, []);

  const handleViewDetails = useCallback((sale) => {
    setSelectedSale(sale);
    setShowDetails(true);
  }, []);

  const executeCancelSale = async (saleId) => {
    try {
      await salesService.updateSale(saleId, { status: 'cancelada' });
      loadSales();
      showSuccess('Venta cancelada correctamente');
    } catch (error) {
      console.error('Error canceling sale:', error);
      showError('Error al cancelar la venta');
    }
  };

  const handleConfirm = () => {
    const { action, data } = confirmModal;
    
    switch (action) {
      case 'changeStatus':
        executeChangeStatus(data.saleId, data.newStatus);
        break;
      case 'cancelSale':
        executeCancelSale(data.saleId);
        break;
      default:
        break;
    }
  };

  const handlePaymentConfirm = async (amount, paymentMethod, paymentReference) => {
    if (saleForPayment) {
      await executeAddPayment(saleForPayment.id, amount, paymentMethod, paymentReference);
      setShowPaymentModal(false);
      setSaleForPayment(null);
    }
  };

  const handlePaymentModalClose = () => {
    console.log('Sales: handlePaymentModalClose called');
    setShowPaymentModal(false);
    setSaleForPayment(null);
  };

  const statusBadges = useMemo(() => ({
    completada: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
    pendiente_pago: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
    parcial: { bg: 'bg-blue-100', text: 'text-blue-700', icon: DollarSign },
    cancelada: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
  }), []);

  const paymentMethodBadges = useMemo(() => ({
    efectivo: 'bg-green-50 text-green-700',
    transferencia: 'bg-blue-50 text-blue-700',
    tarjeta: 'bg-purple-50 text-purple-700',
    credito: 'bg-orange-50 text-orange-700',
    cheque: 'bg-gray-50 text-gray-700'
  }), []);

  const getStatusBadge = useCallback((status) => {
    return statusBadges[status] || statusBadges.completada;
  }, [statusBadges]);

  const getPaymentMethodBadge = useCallback((method) => {
    return paymentMethodBadges[method] || paymentMethodBadges.efectivo;
  }, [paymentMethodBadges]);

  const totalVentas = useMemo(() => sales.reduce((sum, sale) => sum + (sale.total || 0), 0), [sales]);
  const ventasCompletadas = useMemo(() => sales.filter(s => s.status === 'completada').length, [sales]);
  const ventasPendientes = useMemo(() => sales.filter(s => s.status === 'pendiente_pago' || s.status === 'parcial').length, [sales]);

  return (
    <div className="space-y-6">
      {/* Header Mejorado */}
      <div 
        className="rounded-2xl shadow-lg p-6 text-white"
        style={{ background: gradients.sales }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <ShoppingCart size={32} />
              </div>
              Gestión de Ventas
            </h1>
            <p className="text-emerald-100 ml-14">Administra tus ventas y facturación</p>
            <div className="flex items-center gap-4 mt-3 ml-14 flex-wrap">
              <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-semibold">{sales.length} Ventas</span>
              </div>
              <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-semibold">{ventasCompletadas} Completadas</span>
              </div>
              <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-semibold">{ventasPendientes} Pendientes</span>
              </div>
              <div className="bg-white/30 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/30">
                <span className="text-sm font-semibold">Total: {formatCurrency(totalVentas)}</span>
              </div>
            </div>
          </div>
          <button 
            className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Nueva Venta
          </button>
        </div>
      </div>
      
      {showForm && (
        <SaleFormCompact 
          onClose={() => setShowForm(false)} 
          onSuccess={() => {
            showSuccess('✅ Venta creada con éxito');
            loadSales();
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
          {['all', 'completada', 'pendiente_pago', 'parcial', 'cancelada'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2.5 rounded-lg font-semibold transition-all ${
                filter === status
                  ? 'bg-emerald-600 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Todas' : status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Sales List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron ventas</p>
          {searchFilters && (
            <p className="text-gray-400 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSales.map((sale) => (
            <SalesListItem
              key={sale.id}
              sale={sale}
              onAddPayment={handleAddPayment}
              onChangeStatus={handleChangeStatus}
              onCancelSale={handleCancelSale}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {sales.length === 0 && !loading && (
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No hay ventas registradas</p>
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

      {/* Add Payment Modal */}
      {saleForPayment && (
        <AddPaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentModalClose}
          onConfirm={handlePaymentConfirm}
          saleTotal={saleForPayment.total}
          currentPaid={saleForPayment.paid_amount}
          salePaymentMethod={saleForPayment.payment_method}
        />
      )}

      {/* Detail Modal */}
      {showDetails && selectedSale && (
        <SaleDetailModal
          sale={selectedSale}
          onClose={() => {
            setShowDetails(false);
            setSelectedSale(null);
          }}
        />
      )}
    </div>
  );
};

export default Sales;
