import { useEffect, useState, useCallback } from 'react';
import { 
  Package, DollarSign, AlertTriangle, Users, FileText, 
  TrendingUp, ShoppingCart, Calendar, ArrowUpRight, ArrowDownRight, 
  Activity, Sparkles, RefreshCcw, Download, Filter, BarChart3, PieChart, Target, Building2, Settings,
  TrendingDown, Clock, CheckCircle, XCircle, Zap, Award, Briefcase, Eye, ChevronRight, BarChart2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { exportToCSV, exportToPDF, formatDashboardData, dataToHTMLTable } from '../utils/exportUtils';
import api from '../services/api';
import DashboardSettings from '../components/DashboardSettings';
import DateRangeSelector from '../components/DateRangeSelector';
import { useCurrency } from '../hooks/useCurrency';
import { useNotification } from '../hooks/useNotification';
import { useAuthStore } from '../store/useAuthStore';

const DashboardProfessional = () => {
  const [stats, setStats] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [dashboardSettings, setDashboardSettings] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Hook para manejar la moneda
  const { formatCurrency } = useCurrency();
  const { showError } = useNotification();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => setMounted(true), 100);
      loadDashboardData();
      loadOrganization();
      loadDashboardSettings();
      loadRecentActivities();
    }
  }, [selectedPeriod, startDate, endDate, isAuthenticated]);

  const loadOrganization = useCallback(async () => {
    try {
      const response = await api.get('/organizations/me');
      setOrganization(response.data);
    } catch (error) {
      console.error('Error loading organization:', error);
    }
  }, []);

  const loadDashboardSettings = useCallback(async () => {
    try {
      const settings = await dashboardService.getDashboardSettings();
      setDashboardSettings(settings);
    } catch (error) {
      console.error('Error loading dashboard settings:', error);
    }
  }, []);

  const loadRecentActivities = useCallback(async () => {
    try {
      const activities = await dashboardService.getRecentActivities();
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error loading recent activities:', error);
      setRecentActivities([]);
    }
  }, []);

  const handleSettingsUpdate = (newSettings) => {
    setDashboardSettings(newSettings);
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard data...', { startDate, endDate });
      const data = await dashboardService.getStats(startDate, endDate);
      setStats(data);
      console.log('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Fallback a datos vacíos
      setStats({
        total_sales_today: 0,
        total_sales_month: 0,
        total_sales_year: 0,
        pending_sales: 0,
        total_products: 0,
        total_value: 0,
        low_stock_products: 0,
        products_rented: 0,
        total_clients: 0,
        active_clients: 0,
        new_clients_month: 0,
        pending_quotations: 0,
        accepted_quotations: 0,
        quotations_this_month: 0,
        active_rentals: 0,
        overdue_rentals: 0,
        rentals_this_month: 0,
        pending_payments: 0,
        total_revenue_month: 0
      });
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  const handleDateChange = (newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  // Verificar si hay datos
  const hasData = stats && (
    stats.total_products > 0 || 
    stats.total_clients > 0 || 
    stats.total_sales_month > 0 ||
    stats.quotations_this_month > 0
  );

  const handleExportCSV = () => {
    if (!stats) {
      showError('No hay datos para exportar');
      return;
    }
    const data = formatDashboardData(stats);
    exportToCSV(data, `dashboard-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportPDF = () => {
    if (!stats) {
      showError('No hay datos para exportar');
      return;
    }
    const data = formatDashboardData(stats);
    const tableHTML = dataToHTMLTable(data);
    exportToPDF('Reporte del Dashboard', tableHTML);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Si no hay stats, mostrar mensaje de error
  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar el Dashboard</h2>
          <p className="text-gray-600 mb-4">No se pudieron cargar los datos del dashboard.</p>
          <button 
            onClick={() => {
              setLoading(true);
              loadDashboardData();
              loadOrganization();
              loadDashboardSettings();
              loadRecentActivities();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Calcular progreso hacia la meta
  const salesGoal = dashboardSettings?.monthly_sales_goal || 0;
  const currentSales = stats?.total_sales_month || 0;
  const salesProgress = salesGoal > 0 ? (currentSales / salesGoal) * 100 : 0;
  const salesChange = salesGoal > 0 ? `${salesProgress.toFixed(1)}%` : 'Sin meta';

  const mainMetrics = [
    {
      title: 'Ingreso Total',
      value: formatCurrency(stats?.total_revenue_month || 0),
      icon: DollarSign,
      gradient: 'from-emerald-600 to-green-500',
      customGradient: 'linear-gradient(to right, #10b981, #059669)', // Color fijo verde
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Ventas',
      value: formatCurrency(stats?.total_sales_month || 0),
      icon: ShoppingCart,
      gradient: 'from-green-600 to-green-400',
      customGradient: organization?.sales_start_color && organization?.sales_end_color 
        ? `linear-gradient(to right, ${organization.sales_start_color}, ${organization.sales_end_color})`
        : null,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-600'
    },
    {
      title: 'Clientes Activos',
      value: (stats?.active_clients || 0).toString(),
      change: `+${stats?.new_clients_month || 0}`,
      changeValue: 'nuevos este mes',
      trend: 'up',
      icon: Users,
      gradient: 'from-purple-600 to-purple-400',
      customGradient: organization?.clients_start_color && organization?.clients_end_color 
        ? `linear-gradient(to right, ${organization.clients_start_color}, ${organization.clients_end_color})`
        : null,
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Alquileres',
      value: (stats?.active_rentals || 0).toString(),
      icon: Calendar,
      gradient: 'from-orange-600 to-orange-400',
      customGradient: organization?.rentals_start_color && organization?.rentals_end_color 
        ? `linear-gradient(to right, ${organization.rentals_start_color}, ${organization.rentals_end_color})`
        : null,
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-600'
    }
  ];

  const quickStats = [
    {
      title: 'Productos en Stock',
      value: stats?.total_products || 0,
      subValue: `${stats?.low_stock_products || 0} bajo stock`,
      alert: stats?.low_stock_products > 0,
      icon: Package,
      color: 'blue',
      customGradient: organization?.products_start_color && organization?.products_end_color 
        ? `linear-gradient(to right, ${organization.products_start_color}, ${organization.products_end_color})`
        : null,
      link: '/products'
    },
    {
      title: 'Cotizaciones Pendientes',
      value: stats?.pending_quotations || 0,
      subValue: `${stats?.accepted_quotations || 0} aceptadas`,
      alert: (stats?.pending_quotations || 0) > 10,
      icon: FileText,
      color: 'green',
      customGradient: organization?.quotations_start_color && organization?.quotations_end_color 
        ? `linear-gradient(to right, ${organization.quotations_start_color}, ${organization.quotations_end_color})`
        : null,
      link: '/quotations'
    },
    {
      title: 'Pagos Pendientes Ventas',
      value: formatCurrency(stats?.pending_payments || 0),
      subValue: 'Ventas por cobrar',
      alert: (stats?.pending_payments || 0) > 0,
      icon: AlertTriangle,
      color: 'red',
      customGradient: organization?.sales_start_color && organization?.sales_end_color 
        ? `linear-gradient(to right, ${organization.sales_start_color}, ${organization.sales_end_color})`
        : null,
      link: '/sales'
    },
    {
      title: 'Pagos Pendientes Alquileres',
      value: formatCurrency(stats?.pending_rental_payments || 0),
      subValue: 'Alquileres por cobrar',
      alert: (stats?.pending_rental_payments || 0) > 0,
      icon: AlertTriangle,
      color: 'orange',
      customGradient: organization?.rentals_start_color && organization?.rentals_end_color 
        ? `linear-gradient(to right, ${organization.rentals_start_color}, ${organization.rentals_end_color})`
        : null,
      link: '/rentals'
    },
    {
      title: 'Valor Inventario',
      value: formatCurrency(stats?.total_value || 0),
      subValue: 'Total en stock',
      alert: false,
      icon: BarChart3,
      color: 'purple',
      customGradient: organization?.products_start_color && organization?.products_end_color 
        ? `linear-gradient(to right, ${organization.products_start_color}, ${organization.products_end_color})`
        : null,
      link: '/products'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-300',
      green: 'bg-green-50 border-green-200 text-green-700 hover:border-green-300',
      red: 'bg-red-50 border-red-200 text-red-700 hover:border-red-300',
      purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-300'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-[1920px] mx-auto space-y-6 pb-8">
        {/* Header Empresarial Premium */}
        <div 
          className="relative overflow-hidden rounded-3xl shadow-2xl"
          style={{
            background: organization?.primary_color && organization?.secondary_color
              ? `linear-gradient(135deg, ${organization.primary_color}, ${organization.secondary_color})`
              : 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)'
          }}
        >
          {/* Patrón de fondo animado */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
          
          <div className="relative z-10 p-8">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                {organization?.logo_url ? (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <img 
                      src={organization.logo_url.startsWith('http') ? organization.logo_url : `http://localhost:8000${organization.logo_url}`} 
                      alt={organization.name} 
                      className="relative w-20 h-20 rounded-2xl bg-white/95 backdrop-blur-sm p-3 object-contain shadow-2xl group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  </div>
                ) : null}
                <div className="relative w-20 h-20 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-300 group" style={{display: organization?.logo_url ? 'none' : 'flex'}}>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  <Building2 className="relative text-blue-600" size={44} />
                </div>
                
                <div className="text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-5xl font-black tracking-tight drop-shadow-lg">
                      {organization?.name || 'Mi Empresa'}
                    </h1>
                    <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
                      <Zap className="inline w-4 h-4 mr-1" />
                      En Vivo
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <p className="text-lg font-semibold">
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="h-4 w-px bg-white/30"></div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <p className="text-lg font-semibold">
                        {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="group relative px-5 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-semibold border border-white/20 hover:border-white/40 hover:shadow-xl"
                >
                  <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="hidden xl:inline">Configurar</span>
                </button>
                
                <DateRangeSelector 
                  onDateChange={handleDateChange}
                  initialStartDate={startDate}
                  initialEndDate={endDate}
                />
                
                <button
                  onClick={loadDashboardData}
                  className="group px-5 py-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl flex items-center gap-2 transition-all duration-300 font-semibold text-gray-700 hover:text-blue-600 border border-white/50"
                >
                  <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="hidden xl:inline">Actualizar</span>
                </button>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="px-5 py-3 bg-white text-blue-600 rounded-xl shadow-lg hover:shadow-2xl flex items-center gap-2 transition-all duration-300 font-semibold hover:bg-blue-50 border border-blue-100"
                  >
                    <Download className="w-5 h-5" />
                    <span className="hidden xl:inline">Exportar</span>
                  </button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                      <button
                        onClick={() => {
                          handleExportCSV();
                          setShowExportMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors text-gray-700 hover:text-blue-600 font-medium"
                      >
                        <Download size={18} />
                        Exportar a Excel (CSV)
                      </button>
                      <div className="h-px bg-gray-100"></div>
                      <button
                        onClick={() => {
                          handleExportPDF();
                          setShowExportMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors text-gray-700 hover:text-blue-600 font-medium"
                      >
                        <Download size={18} />
                        Exportar a PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Preview in Header */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Ingresos Hoy</p>
                    <p className="text-white text-2xl font-black">{formatCurrency(stats?.total_sales_today || 0)}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <DollarSign className="text-white" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Productos</p>
                    <p className="text-white text-2xl font-black">{stats?.total_products || 0}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Package className="text-white" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Clientes Activos</p>
                    <p className="text-white text-2xl font-black">{stats?.active_clients || 0}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Users className="text-white" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Alquileres</p>
                    <p className="text-white text-2xl font-black">{stats?.active_rentals || 0}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Calendar className="text-white" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje cuando no hay datos */}
        {!hasData && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-dashed border-blue-300 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              ¡Bienvenido a tu Dashboard!
            </h2>
            <p className="text-gray-600 mb-6">
              Aún no tienes datos registrados. Comienza agregando productos, clientes o realizando tu primera venta.
            </p>
            <div className="flex gap-3 justify-center">
              <Link 
                to="/products" 
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Agregar Productos
              </Link>
              <Link 
                to="/clients" 
                className="px-6 py-3 bg-white border-2 border-blue-300 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-all"
              >
                Agregar Clientes
              </Link>
            </div>
          </div>
        </div>
        )}

        {/* Main Metrics Grid - Solo mostrar si hay datos */}
        {hasData && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Decoración de fondo con gradiente */}
              <div 
                className={`absolute -right-12 -top-12 w-48 h-48 ${!metric.customGradient ? `bg-gradient-to-br ${metric.gradient}` : ''} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity`}
                style={metric.customGradient ? { background: metric.customGradient } : {}}
              ></div>
              
              <div className="p-7 relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div 
                    className={`relative p-4 ${!metric.customGradient ? `bg-gradient-to-br ${metric.gradient}` : ''} rounded-2xl shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                    style={metric.customGradient ? { background: metric.customGradient } : {}}
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md"></div>
                    <Icon className="relative text-white" size={32} />
                  </div>
                  {metric.trend !== 'neutral' && (
                    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold shadow-lg ${metric.trend === 'up' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'}`}>
                      <TrendIcon size={18} strokeWidth={3} />
                      {metric.change}
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-gray-500 text-xs font-bold mb-3 uppercase tracking-wider">{metric.title}</p>
                  <p className="text-5xl font-black text-gray-900 mb-3 tracking-tight">{metric.value}</p>
                  {metric.changeValue && (
                    <div className="flex items-center gap-2">
                      <div 
                        className={`h-1.5 w-1.5 rounded-full ${!metric.customGradient ? `bg-gradient-to-r ${metric.gradient}` : ''}`}
                        style={metric.customGradient ? { background: metric.customGradient } : {}}
                      ></div>
                      <p className="text-sm text-gray-600 font-semibold">{metric.changeValue}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Barra inferior decorativa con gradiente */}
              <div 
                className={`h-2 ${!metric.customGradient ? `bg-gradient-to-r ${metric.gradient}` : ''} opacity-80`}
                style={metric.customGradient ? { background: metric.customGradient } : {}}
              ></div>
            </div>
          );
        })}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <Link
              key={index}
              to={stat.link}
              className={`group relative block p-6 rounded-2xl bg-white border-2 border-gray-100 hover:border-blue-400 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              style={{ transitionDelay: `${(index + 4) * 100}ms` }}
            >
              {/* Fondo decorativo */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div 
                    className={`p-3.5 ${!stat.customGradient ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : ''} rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}
                    style={stat.customGradient ? { background: stat.customGradient } : {}}
                  >
                    <Icon size={26} className="text-white" />
                  </div>
                  {stat.alert && (
                    <div className="relative flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
                      <div className="absolute inset-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></div>
                      <span className="text-xs font-bold text-red-600">Alerta</span>
                    </div>
                  )}
                </div>
                <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">{stat.title}</p>
                <p className="text-3xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{stat.value}</p>
                <div className="flex items-center gap-2">
                  <ChevronRight size={14} className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  <p className="text-xs text-gray-500 font-semibold group-hover:text-gray-700">{stat.subValue}</p>
                </div>
              </div>
            </Link>
          );
        })}
        </div>

        {/* Charts and Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl">
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md"></div>
                <Activity size={28} className="relative text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900">Actividad Reciente</h2>
                <p className="text-sm text-gray-500 font-medium">Últimas transacciones del sistema</p>
              </div>
            </div>
            <Link to="/summary" className="group px-5 py-2.5 text-blue-600 hover:bg-blue-50 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border-2 border-transparent hover:border-blue-200">
              Ver todo
              <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="group flex items-center gap-4 p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-md">
                  <div className="text-3xl group-hover:scale-110 transition-transform">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={14} className="text-gray-400" />
                      <p className="text-sm text-gray-500 font-medium">
                        {new Date(activity.date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm ${
                      activity.status === 'completada' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                      activity.status === 'pendiente' ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
                      activity.status === 'activo' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-700 font-bold text-lg mb-2">No hay actividades recientes</p>
                <p className="text-sm text-gray-500">Empieza registrando clientes y productos para ver tu actividad aquí</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div 
          className="relative overflow-hidden rounded-3xl shadow-2xl p-8 text-white"
          style={{ background: organization?.quick_actions_start_color && organization?.quick_actions_end_color 
            ? `linear-gradient(135deg, ${organization.quick_actions_start_color}, ${organization.quick_actions_end_color})`
            : 'linear-gradient(135deg, #3b82f6, #4f46e5, #8b5cf6)' 
          }}
        >
          {/* Decoración de fondo animada */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl">
                <Zap size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black">Acciones Rápidas</h2>
                <p className="text-white/80 text-sm font-medium">Accesos directos</p>
              </div>
            </div>
          
          <div className="space-y-3">
            <Link to="/sales" className="group block p-5 bg-white/10 rounded-2xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20 hover:border-white/40 hover:shadow-xl hover:-translate-y-1 duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <ShoppingCart size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-black text-lg">Nueva Venta</p>
                  <p className="text-sm text-white/80">Registrar venta rápida</p>
                </div>
                <ChevronRight className="group-hover:translate-x-2 transition-transform" size={20} />
              </div>
            </Link>

            <Link to="/quotations" className="group block p-5 bg-white/10 rounded-2xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20 hover:border-white/40 hover:shadow-xl hover:-translate-y-1 duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <FileText size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-black text-lg">Nueva Cotización</p>
                  <p className="text-sm text-white/80">Crear cotización</p>
                </div>
                <ChevronRight className="group-hover:translate-x-2 transition-transform" size={20} />
              </div>
            </Link>

            <Link to="/rentals" className="group block p-5 bg-white/10 rounded-2xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20 hover:border-white/40 hover:shadow-xl hover:-translate-y-1 duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <Calendar size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-black text-lg">Nuevo Alquiler</p>
                  <p className="text-sm text-white/80">Registrar alquiler</p>
                </div>
                <ChevronRight className="group-hover:translate-x-2 transition-transform" size={20} />
              </div>
            </Link>

            <Link to="/clients" className="group block p-5 bg-white/10 rounded-2xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20 hover:border-white/40 hover:shadow-xl hover:-translate-y-1 duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <Users size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-black text-lg">Nuevo Cliente</p>
                  <p className="text-sm text-white/80">Agregar cliente</p>
                </div>
                <ChevronRight className="group-hover:translate-x-2 transition-transform" size={20} />
              </div>
            </Link>

            <Link to="/products" className="group block p-5 bg-white/10 rounded-2xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20 hover:border-white/40 hover:shadow-xl hover:-translate-y-1 duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <Package size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-black text-lg">Nuevo Producto</p>
                  <p className="text-sm text-white/80">Agregar producto</p>
                </div>
                <ChevronRight className="group-hover:translate-x-2 transition-transform" size={20} />
              </div>
            </Link>
          </div>
          </div>
        </div>
        </div>

        {/* Meta de Ventas Mensual - Rediseñada */}
        <div 
          className="relative overflow-hidden rounded-3xl shadow-2xl p-10 text-white"
          style={{ background: organization?.goals_start_color && organization?.goals_end_color 
            ? `linear-gradient(135deg, ${organization.goals_start_color}, ${organization.goals_end_color})`
            : 'linear-gradient(135deg, #4f46e5, #3b82f6, #06b6d4)' 
          }}
        >
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-5">
              <div className="relative p-5 bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl">
                <div className="absolute inset-0 bg-white/10 rounded-2xl blur-lg"></div>
                <Target size={40} className="relative" />
              </div>
              <div>
                <h3 className="text-4xl font-black mb-1">Meta de Ventas Mensual</h3>
                <p className="text-white/90 text-lg font-semibold">Progreso hacia tu objetivo del mes</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="group bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-bold border border-white/30 hover:border-white/50 hover:shadow-xl"
            >
              <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Configurar Meta
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BarChart2 size={20} />
                </div>
                <p className="text-white/80 text-sm font-bold uppercase tracking-wide">Progreso</p>
              </div>
              <p className="text-5xl font-black mb-1">{salesProgress.toFixed(1)}%</p>
              <div className="flex items-center gap-2">
                {salesProgress >= 100 ? (
                  <CheckCircle size={16} className="text-green-300" />
                ) : (
                  <Clock size={16} className="text-yellow-300" />
                )}
                <p className="text-white/80 text-sm font-semibold">
                  {salesProgress >= 100 ? 'Meta completada' : 'En progreso'}
                </p>
              </div>
            </div>
            
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <DollarSign size={20} />
                </div>
                <p className="text-white/80 text-sm font-bold uppercase tracking-wide">Ventas Actuales</p>
              </div>
              <p className="text-5xl font-black mb-1">{formatCurrency(currentSales)}</p>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-green-300" />
                <p className="text-white/80 text-sm font-semibold">Este mes</p>
              </div>
            </div>
            
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Award size={20} />
                </div>
                <p className="text-white/80 text-sm font-bold uppercase tracking-wide">Meta Objetivo</p>
              </div>
              <p className="text-5xl font-black mb-1">{formatCurrency(salesGoal)}</p>
              <div className="flex items-center gap-2">
                <Target size={16} className="text-blue-300" />
                <p className="text-white/80 text-sm font-semibold">Objetivo mensual</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={18} />
                <span className="font-bold text-lg">Barra de Progreso</span>
              </div>
              <span className="text-2xl font-black">
                {salesProgress >= 100 ? '🎉 ¡Completado!' : `${(100 - salesProgress).toFixed(1)}% restante`}
              </span>
            </div>
            
            <div className="relative w-full bg-white/20 rounded-full h-6 overflow-hidden shadow-inner">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 h-6 rounded-full transition-all duration-1000 ease-out shadow-lg flex items-center justify-end pr-3" 
                style={{ width: `${Math.min(salesProgress, 100)}%` }}
              >
                {salesProgress > 10 && (
                  <span className="text-white font-black text-sm drop-shadow-lg">
                    {salesProgress.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-3 text-sm font-semibold text-white/80">
              <span>Inicio del mes</span>
              <span>Fin del mes</span>
            </div>
          </div>
        </div>
        </div>
        </>
        )}

        {/* Modal de Configuraciones */}
        <DashboardSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSettingsUpdate={handleSettingsUpdate}
        />
      </div>
    </div>
  );
};

export default DashboardProfessional;

