import { useEffect, useState, useCallback } from 'react';
import { 
  Package, DollarSign, AlertTriangle, Users, FileText, 
  TrendingUp, ShoppingCart, Calendar, ArrowUpRight, ArrowDownRight, 
  Activity, Sparkles, RefreshCcw, Download, Filter, BarChart3, PieChart, Target, Building2, Settings,
  TrendingDown, Clock, CheckCircle, XCircle, Zap, Award, Briefcase, Eye, ChevronRight, BarChart2,
  Bell, AlertCircle, CreditCard, Trophy, Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { exportToCSV, exportToPDF, formatDashboardData, dataToHTMLTable } from '../utils/exportUtils';
import { 
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, Brush
} from 'recharts';
import api from '../services/api';
import DashboardSettings from '../components/DashboardSettings';
import { useCurrency } from '../hooks/useCurrency';
import { useNotification } from '../hooks/useNotification';
import { useAuthStore } from '../store/useAuthStore';
import { useDateFilter } from '../contexts/DateFilterContext';

const DashboardExecutive = () => {
  const [stats, setStats] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [dashboardSettings, setDashboardSettings] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null); // Stats del mes actual para la meta
  const [salesChartData, setSalesChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Usar fechas del contexto global
  const { startDate, endDate } = useDateFilter();

  // Hook para manejar la moneda
  const { formatCurrency } = useCurrency();
  const { showError } = useNotification();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => setMounted(true), 100);
      loadDashboardData();
      loadMonthlyStats(); // Cargar stats del mes actual
      loadSalesChartData(); // Cargar datos del gráfico
      loadOrganization();
      loadDashboardSettings();
    }
  }, [selectedPeriod, startDate, endDate, isAuthenticated]);

  // Cargar datos del gráfico de ventas y alquileres
  const loadSalesChartData = useCallback(async () => {
    try {
      // Usar las fechas del filtro global si existen
      const [salesData, rentalsData] = await Promise.all([
        dashboardService.getSalesChartWithDates(startDate, endDate),
        dashboardService.getRentalsChartWithDates(startDate, endDate)
      ]);
      
      console.log('Sales data:', salesData);
      console.log('Rentals data:', rentalsData);
      
      // Crear un mapa agrupado por MES y AÑO (no por día)
      const monthMap = {};
      
      // Procesar ventas - AGRUPAR POR MES
      if (salesData && salesData.data) {
        salesData.data.forEach(item => {
          const date = new Date(item.date);
          // Crear clave única por mes y año (ej: "Ene 2025")
          const monthKey = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
          if (!monthMap[monthKey]) {
            monthMap[monthKey] = { 
              mes: monthKey, 
              ventas: 0, 
              alquileres: 0, 
              date: new Date(date.getFullYear(), date.getMonth(), 1) // Primer día del mes para ordenar
            };
          }
          monthMap[monthKey].ventas += item.total || 0;
        });
      }
      
      // Procesar alquileres - AGRUPAR POR MES
      if (rentalsData && rentalsData.data) {
        rentalsData.data.forEach(item => {
          const date = new Date(item.date);
          // Crear clave única por mes y año (ej: "Ene 2025")
          const monthKey = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
          if (!monthMap[monthKey]) {
            monthMap[monthKey] = { 
              mes: monthKey, 
              ventas: 0, 
              alquileres: 0, 
              date: new Date(date.getFullYear(), date.getMonth(), 1) // Primer día del mes para ordenar
            };
          }
          monthMap[monthKey].alquileres += item.total || 0;
        });
      }
      
      // Convertir a array, ordenar por fecha y eliminar meses sin datos
      const chartData = Object.values(monthMap)
        .filter(item => item.ventas > 0 || item.alquileres > 0) // Solo meses con datos
        .sort((a, b) => a.date - b.date)
        .map(({ mes, ventas, alquileres }) => ({ 
          mes: mes.charAt(0).toUpperCase() + mes.slice(1), // Capitalizar primera letra
          ventas, 
          alquileres 
        }));
      
      console.log('Chart data (agrupado por mes):', chartData);
      setSalesChartData(chartData.length > 0 ? chartData : [{ mes: 'Sin datos', ventas: 0, alquileres: 0 }]);
    } catch (error) {
      console.error('Error loading sales chart data:', error);
      setSalesChartData([{ mes: 'Sin datos', ventas: 0, alquileres: 0 }]);
    }
  }, [startDate, endDate]);

  // Cargar estadísticas del mes actual (para la meta de ventas)
  const loadMonthlyStats = useCallback(async () => {
    try {
      // Obtener primer y último día del mes actual
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const startOfMonth = firstDay.toISOString().split('T')[0];
      const endOfMonth = lastDay.toISOString().split('T')[0];
      
      const data = await dashboardService.getStats(startOfMonth, endOfMonth);
      setMonthlyStats(data);
    } catch (error) {
      console.error('Error loading monthly stats:', error);
    }
  }, []);

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
        total_revenue_month: 0,
        rental_income_today: 0,
        rental_income_month: 0,
        rental_income_year: 0,
        pending_rental_payments: 0
      });
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);


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
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Calcular progreso hacia la meta (usando stats del mes actual, no del filtro)
  const salesGoal = dashboardSettings?.monthly_sales_goal || 0;
  const currentSales = monthlyStats?.total_sales_month || 0; // Usar monthlyStats en lugar de stats
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
      title: 'Alquileres',
      value: formatCurrency(stats?.rental_income_month || 0),
      icon: Calendar,
      gradient: 'from-indigo-600 to-indigo-400',
      customGradient: organization?.rentals_start_color && organization?.rentals_end_color 
        ? `linear-gradient(to right, ${organization.rentals_start_color}, ${organization.rentals_end_color})`
        : null,
      iconBg: 'bg-indigo-500/10',
      iconColor: 'text-indigo-600'
    }
  ];

  const quickStats = [
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
                    <p className="text-white/80 text-sm font-medium mb-1">Ingresos General</p>
                    <p className="text-white text-2xl font-black">{formatCurrency((stats?.total_sales_all_time || 0) + (stats?.total_rentals_all_time || 0))}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  {metric.trend !== 'neutral' && metric.change && (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Ingresos por Mes - Barras */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">📊 Ingresos por Mes</h2>
              <p className="text-sm text-gray-500">
                {startDate && endDate 
                  ? `Período: ${startDate.split('-').reverse().join('/')} - ${endDate.split('-').reverse().join('/')}`
                  : 'Solo se muestran los meses con ventas o alquileres registrados'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: organization?.sales_start_color || '#10b981' }}
                ></div>
                <span className="text-xs font-bold text-gray-700">Ventas</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: organization?.rentals_start_color || '#3b82f6' }}
                ></div>
                <span className="text-xs font-bold text-gray-700">Alquileres</span>
              </div>
            </div>
          </div>
          
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesChartData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="mes" 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px', fontWeight: '600' }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px', fontWeight: '600' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    padding: '16px'
                  }}
                  formatter={(value) => [`$${value.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, '']}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                />
                <Bar 
                  dataKey="ventas" 
                  fill={organization?.sales_start_color || '#10b981'}
                  name="Ventas"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
                <Bar 
                  dataKey="alquileres" 
                  fill={organization?.rentals_start_color || '#3b82f6'}
                  name="Alquileres"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions - Mejorado */}
        <div 
          className="relative overflow-hidden rounded-3xl shadow-lg p-6 text-white"
          style={{ background: organization?.quick_actions_start_color && organization?.quick_actions_end_color 
            ? `linear-gradient(135deg, ${organization.quick_actions_start_color}, ${organization.quick_actions_end_color})`
            : 'linear-gradient(135deg, #3b82f6, #4f46e5, #8b5cf6)' 
          }}
        >
          {/* Decoración de fondo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                <Zap size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black">Acciones Rápidas</h2>
                <p className="text-white/80 text-xs font-medium">Accesos directos</p>
              </div>
            </div>
          
          <div className="space-y-2">
            <Link to="/sales" className="group block p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20 hover:border-white/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                  <ShoppingCart size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-base">Nueva Venta</p>
                  <p className="text-xs text-white/70">Registrar venta rápida</p>
                </div>
                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </div>
            </Link>

            <Link to="/quotations" className="group block p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20 hover:border-white/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                  <FileText size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-base">Nueva Cotización</p>
                  <p className="text-xs text-white/70">Crear cotización</p>
                </div>
                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </div>
            </Link>

            <Link to="/rentals" className="group block p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20 hover:border-white/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                  <Calendar size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-base">Nuevo Alquiler</p>
                  <p className="text-xs text-white/70">Registrar alquiler</p>
                </div>
                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </div>
            </Link>

            <Link to="/clients" className="group block p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20 hover:border-white/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                  <Users size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-base">Nuevo Cliente</p>
                  <p className="text-xs text-white/70">Agregar cliente</p>
                </div>
                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </div>
            </Link>

            <Link to="/products" className="group block p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20 hover:border-white/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                  <Package size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-base">Nuevo Producto</p>
                  <p className="text-xs text-white/70">Agregar producto</p>
                </div>
                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </div>
            </Link>
          </div>
          </div>
        </div>
        </div>

        {/* Meta de Ventas Mensual - Mejorada */}
        <div 
          className="relative overflow-hidden rounded-3xl shadow-lg p-8 text-white"
          style={{ background: organization?.goals_start_color && organization?.goals_end_color 
            ? `linear-gradient(135deg, ${organization.goals_start_color}, ${organization.goals_end_color})`
            : 'linear-gradient(135deg, #4f46e5, #3b82f6, #8b5cf6)' 
          }}
        >
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Target size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black">Meta de Ventas Mensual</h3>
                <p className="text-white/80 text-xs font-medium">Progreso hacia tu objetivo del mes</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-semibold text-sm border border-white/20"
            >
              <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              Configurar
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 size={16} className="text-white/70" />
                <p className="text-white/70 text-xs font-bold uppercase">Progreso</p>
              </div>
              <p className="text-4xl font-black mb-1">{salesProgress.toFixed(1)}%</p>
              <div className="flex items-center gap-1.5">
                {salesProgress >= 100 ? (
                  <CheckCircle size={14} className="text-green-300" />
                ) : (
                  <Clock size={14} className="text-yellow-300" />
                )}
                <p className="text-white/70 text-xs font-medium">
                  {salesProgress >= 100 ? 'Completada' : 'En progreso'}
                </p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-white/70" />
                <p className="text-white/70 text-xs font-bold uppercase">Actuales</p>
              </div>
              <p className="text-4xl font-black mb-1">{formatCurrency(currentSales)}</p>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-green-300" />
                <p className="text-white/70 text-xs font-medium">Este mes</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Award size={16} className="text-white/70" />
                <p className="text-white/70 text-xs font-bold uppercase">Objetivo</p>
              </div>
              <p className="text-4xl font-black mb-1">{formatCurrency(salesGoal)}</p>
              <div className="flex items-center gap-1.5">
                <Target size={14} className="text-blue-300" />
                <p className="text-white/70 text-xs font-medium">Meta mensual</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm flex items-center gap-2">
                <Activity size={16} />
                Barra de Progreso
              </span>
              <span className="text-lg font-black">
                {salesProgress >= 100 ? '🎉 ¡Completado!' : `${(100 - salesProgress).toFixed(1)}% restante`}
              </span>
            </div>
            
            <div className="relative w-full bg-white/20 rounded-full h-4 overflow-hidden">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 h-4 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2" 
                style={{ width: `${Math.min(salesProgress, 100)}%` }}
              >
                {salesProgress > 15 && (
                  <span className="text-white font-black text-xs drop-shadow">
                    {salesProgress.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-2 text-xs font-medium text-white/70">
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

export default DashboardExecutive;

