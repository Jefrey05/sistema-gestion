import { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Calendar, 
  Users, 
  Package,
  CreditCard,
  Banknote,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Target,
  Award,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { summaryService } from '../services/summaryService';
import { dashboardService } from '../services/dashboardService';
import { useCurrency } from '../hooks/useCurrency';
import { useNotification } from '../hooks/useNotification';
import { useAuthStore } from '../store/useAuthStore';
import { useDateFilter } from '../contexts/DateFilterContext';

const BusinessSummary = () => {
  const [overview, setOverview] = useState(null);
  const [paymentBreakdown, setPaymentBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();
  const { showError } = useNotification();
  const { isAuthenticated } = useAuthStore();
  const { startDate, endDate } = useDateFilter();

  const loadSummaryData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading summary data - usando datos del dashboard');
      
      // Cargar datos del dashboard (misma fuente que el dashboard principal)
      const dashboardStats = await dashboardService.getStats(null, null);
      
      // Cargar resumen completo del negocio
      const data = await summaryService.getBusinessOverview(null, null);
      
      // USAR LOS DATOS DEL DASHBOARD para los pendientes (son más confiables)
      data.sales.total_pending = dashboardStats.pending_payments || 0;
      data.rentals.total_pending = dashboardStats.pending_rental_payments || 0;
      data.financial_summary.total_pending = (dashboardStats.pending_payments || 0) + (dashboardStats.pending_rental_payments || 0);
      
      console.log('=== RESUMEN DATA (usando dashboard) ===');
      console.log('Ventas total_pending:', data.sales?.total_pending);
      console.log('Alquileres total_pending:', data.rentals?.total_pending);
      console.log('Financial total_pending:', data.financial_summary?.total_pending);
      console.log('=== FIN RESUMEN DATA ===');
      
      setOverview(data);
      setPaymentBreakdown({ payment_methods: data.payment_methods || [] });
      
      console.log('Summary data loaded successfully');
    } catch (error) {
      console.error('Error loading summary data:', error);
      showError('Error al cargar las estadísticas del negocio');
      
      // Datos de fallback
      setOverview({
        sales: { by_status: [], by_payment_method: [], total_paid: 0, total_pending: 0, total_amount: 0, total_count: 0 },
        rentals: { by_status: [], by_payment_method: [], total_paid: 0, total_pending: 0, total_amount: 0, total_count: 0 },
        clients: { total: 0, active: 0, new_this_period: 0 },
        products: { total: 0, low_stock: 0, top_selling: [] },
        quotations: { total: 0, pending: 0, accepted: 0, converted: 0, conversion_rate: 0 },
        financial_summary: { total_revenue: 0, total_paid: 0, total_pending: 0, collection_rate: 0 },
        payment_methods: []
      });
      setPaymentBreakdown({ payment_methods: [] });
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSummaryData();
    }
  }, [isAuthenticated, loadSummaryData]);


  const getStatusIcon = (status) => {
    const icons = {
      'completada': CheckCircle,
      'pendiente_pago': Clock,
      'parcial': Clock,
      'cancelada': XCircle,
      'activo': CheckCircle,
      'devuelto': CheckCircle,
      'vencido': AlertTriangle,
      'renovado': CheckCircle
    };
    return icons[status] || Clock;
  };

  const getStatusColor = (status) => {
    const colors = {
      'completada': 'text-green-600 bg-green-100',
      'pendiente_pago': 'text-yellow-600 bg-yellow-100',
      'parcial': 'text-blue-600 bg-blue-100',
      'cancelada': 'text-red-600 bg-red-100',
      'activo': 'text-green-600 bg-green-100',
      'devuelto': 'text-green-600 bg-green-100',
      'vencido': 'text-red-600 bg-red-100',
      'renovado': 'text-blue-600 bg-blue-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      'efectivo': Banknote,
      'transferencia': Building,
      'tarjeta': CreditCard,
      'credito': Clock,
      'cheque': Building
    };
    return icons[method] || DollarSign;
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      'efectivo': 'text-green-600 bg-green-100',
      'transferencia': 'text-blue-600 bg-blue-100',
      'tarjeta': 'text-purple-600 bg-purple-100',
      'credito': 'text-orange-600 bg-orange-100',
      'cheque': 'text-gray-600 bg-gray-100'
    };
    return colors[method] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!overview || !paymentBreakdown) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600">No se pudieron cargar las estadísticas</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Moderno */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                <BarChart3 className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Resumen Ejecutivo
                </h1>
                <p className="text-gray-600 mt-1 text-lg">Panel de control integral del negocio</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 rounded-xl border border-green-200">
              <Activity className="text-green-600" size={24} />
              <div>
                <p className="text-xs text-green-600 font-medium">Estado del Sistema</p>
                <p className="text-sm font-bold text-green-700">Operativo</p>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs Principales - Diseño Moderno */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Ingresos */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-green-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                <Wallet className="text-white" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <TrendingUp size={16} />
                <span className="text-xs font-semibold">{(overview.sales?.total_count || 0) + (overview.rentals?.total_count || 0)}</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Ingresos</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency((overview.sales?.total_amount || 0) + (overview.rentals?.total_amount || 0))}</p>
          </div>

          {/* Pendientes */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-yellow-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                <Clock className="text-white" size={24} />
              </div>
              <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                <Activity size={16} />
                <span className="text-xs font-semibold">Activo</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Por Cobrar</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(overview.financial_summary?.total_pending || 0)}</p>
          </div>

          {/* Clientes */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-purple-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-purple-400 to-pink-600 p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                <Users className="text-white" size={24} />
              </div>
              <div className="flex items-center gap-1 text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                <Award size={16} />
                <span className="text-xs font-semibold">+{overview.clients?.new_this_period || 0}</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Clientes Activos</p>
            <p className="text-3xl font-bold text-gray-900">{overview.clients?.active || 0}</p>
          </div>
        </div>

        {/* Grid de Ventas y Alquileres */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ventas Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-3 rounded-xl">
                <ShoppingCart className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Ventas</h3>
                <p className="text-sm text-gray-500">{overview.sales?.total_count || 0} transacciones</p>
              </div>
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xs text-green-600 font-medium mb-1">Pagado</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(overview.sales?.total_paid || 0)}</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-3 text-center">
                <p className="text-xs text-yellow-600 font-medium mb-1">Pendiente</p>
                <p className="text-lg font-bold text-yellow-700">{formatCurrency(overview.sales?.total_pending || 0)}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-600 font-medium mb-1">Total</p>
                <p className="text-lg font-bold text-blue-700">{formatCurrency(overview.sales?.total_amount || 0)}</p>
              </div>
            </div>

          </div>

          {/* Alquileres Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-400 to-indigo-600 p-3 rounded-xl">
                <Calendar className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Alquileres</h3>
                <p className="text-sm text-gray-500">{overview.rentals?.total_count || 0} contratos</p>
              </div>
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xs text-green-600 font-medium mb-1">Pagado</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(overview.rentals?.total_paid || 0)}</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-3 text-center">
                <p className="text-xs text-yellow-600 font-medium mb-1">Pendiente</p>
                <p className="text-lg font-bold text-yellow-700">{formatCurrency(overview.rentals?.total_pending || 0)}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-600 font-medium mb-1">Total</p>
                <p className="text-lg font-bold text-blue-700">{formatCurrency(overview.rentals?.total_amount || 0)}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Métodos de Pago - Diseño Moderno */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-purple-400 to-pink-600 p-3 rounded-xl">
              <CreditCard className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Métodos de Pago</h3>
              <p className="text-sm text-gray-500">Desglose consolidado</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(paymentBreakdown.payment_methods || []).map((method) => {
              const PaymentIcon = getPaymentMethodIcon(method.method);
              return (
                <div key={method.method} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${getPaymentMethodColor(method.method)}`}>
                      <PaymentIcon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold capitalize text-gray-900">{method.method}</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ventas:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(method.sales_amount || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Alquileres:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(method.rentals_amount || 0)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 flex justify-between font-bold">
                      <span className="text-gray-700">Total:</span>
                      <span className="text-gray-900">{formatCurrency(method.total_amount || 0)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Información General - Diseño Moderno */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-gray-400 to-gray-600 p-3 rounded-xl">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Información General</h3>
              <p className="text-sm text-gray-500">Resumen de inventario y clientes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Package className="text-blue-600" size={20} />
                <p className="text-sm text-blue-700 font-semibold">Productos</p>
              </div>
              <p className="text-3xl font-bold text-blue-900">{overview.products?.total || 0}</p>
              <p className="text-xs text-blue-600 mt-1">Total en inventario</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="text-orange-600" size={20} />
                <p className="text-sm text-orange-700 font-semibold">Stock Bajo</p>
              </div>
              <p className="text-3xl font-bold text-orange-900">{overview.products?.low_stock || 0}</p>
              <p className="text-xs text-orange-600 mt-1">Requieren atención</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <Target className="text-purple-600" size={20} />
                <p className="text-sm text-purple-700 font-semibold">Cotizaciones</p>
              </div>
              <p className="text-3xl font-bold text-purple-900">{overview.quotations?.total || 0}</p>
              <p className="text-xs text-purple-600 mt-1">{overview.quotations?.pending || 0} pendientes, {overview.quotations?.accepted || 0} aceptadas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSummary;
