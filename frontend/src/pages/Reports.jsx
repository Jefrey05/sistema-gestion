import { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Download, 
  Calendar,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Clock,
  Target,
  Award,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  FileText
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import DateRangeSelector from '../components/DateRangeSelector';
import { useDateFilter } from '../contexts/DateFilterContext';
import { useCurrency } from '../hooks/useCurrency';
import { useNotification } from '../hooks/useNotification';
import { dashboardService } from '../services/dashboardService';
import { exportToPDF, exportToCSV } from '../utils/exportUtils';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  const { startDate, endDate } = useDateFilter();
  const { formatCurrency } = useCurrency();
  const { showError } = useNotification();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Cargando datos del resumen con fechas:', { startDate, endDate });
      const statsData = await dashboardService.getStats(startDate, endDate);
      console.log('Datos recibidos del backend:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading reports data:', error);
      showError('Error al cargar datos del resumen');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportPDF = () => {
    if (!stats) {
      showError('No hay datos para exportar');
      return;
    }
    exportToPDF(stats, 'Resumen Ejecutivo');
  };

  const handleExportCSV = () => {
    if (!stats) {
      showError('No hay datos para exportar');
      return;
    }
    exportToCSV(stats, 'resumen-ejecutivo');
  };

  const getPeriodTitle = () => {
    if (startDate && endDate) {
      if (startDate === endDate) {
        return 'Hoy';
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7) return 'Esta Semana';
      if (diffDays <= 30) return 'Este Mes';
      return 'Período Personalizado';
    }
    return 'Este Mes';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Ejecutivo */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Resumen Ejecutivo</h1>
              <p className="text-blue-200 text-lg">Análisis integral del rendimiento empresarial</p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Calendar size={20} />
                  <span className="text-sm font-medium">{getPeriodTitle()}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Clock size={20} />
                  <span className="text-sm font-medium">
                    {new Date().toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
            <DateRangeSelector 
                onDateChange={(start, end) => {
                  // El contexto maneja esto automáticamente
                }}
              initialStartDate={startDate}
              initialEndDate={endDate}
            />
              <Button 
                variant="outline" 
                icon={Download} 
                onClick={handleExportPDF}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
              PDF
            </Button>
              <Button 
                variant="outline" 
                icon={Download} 
                onClick={handleExportCSV}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
              Excel
            </Button>
            </div>
          </div>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ingresos Totales */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <DollarSign size={28} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {formatCurrency((stats?.total_sales_all_time || 0) + (stats?.total_rentals_all_time || 0))}
              </div>
              <div className="text-emerald-100 text-sm">Ingresos Históricos</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Award size={16} />
            <span className="text-sm font-medium">Total Acumulado</span>
          </div>
        </div>

        {/* Ventas del Período */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <ShoppingCart size={28} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {formatCurrency((stats?.total_sales_month || 0) + (stats?.rental_income_month || 0))}
              </div>
              <div className="text-blue-100 text-sm">Período Actual</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} />
            <span className="text-sm font-medium">Rendimiento Actual</span>
          </div>
        </div>

        {/* Clientes Activos */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Users size={28} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{stats?.active_clients || 0}</div>
              <div className="text-purple-100 text-sm">Clientes Activos</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={16} />
            <span className="text-sm font-medium">Base de Clientes</span>
          </div>
        </div>

        {/* Inventario */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Package size={28} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{stats?.total_products || 0}</div>
              <div className="text-orange-100 text-sm">Productos</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target size={16} />
            <span className="text-sm font-medium">Inventario Total</span>
          </div>
        </div>
      </div>

      {/* Análisis Detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resumen Financiero */}
        <div className="lg:col-span-2">
          <Card 
            title="Análisis Financiero" 
            subtitle="Desglose detallado de ingresos y gastos"
            className="h-full"
          >
            <div className="space-y-6">
              {/* Ventas vs Alquileres */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <ShoppingCart size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Ventas</h3>
                      <p className="text-sm text-gray-600">Ingresos por ventas</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats?.total_sales_month || 0)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {stats?.pending_sales || 0} pendientes
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Calendar size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Alquileres</h3>
                      <p className="text-sm text-gray-600">Ingresos por alquileres</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats?.rental_income_month || 0)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {stats?.active_rentals || 0} activos
                  </div>
                </div>
              </div>

              {/* Métricas Adicionales */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{stats?.pending_quotations || 0}</div>
                  <div className="text-sm text-gray-600">Cotizaciones</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{stats?.low_stock_products || 0}</div>
                  <div className="text-sm text-gray-600">Stock Bajo</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{stats?.overdue_rentals || 0}</div>
                  <div className="text-sm text-gray-600">Vencidos</div>
                </div>
              </div>
            </div>
        </Card>
        </div>

        {/* Indicadores de Rendimiento */}
        <div>
          <Card 
            title="Indicadores Clave" 
            subtitle="KPIs del negocio"
            className="h-full"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <ArrowUpRight size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Rendimiento</div>
                    <div className="text-sm text-gray-600">Excelente</div>
                  </div>
                </div>
                <div className="text-green-600 font-bold">+15%</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Users size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Satisfacción</div>
                    <div className="text-sm text-gray-600">Clientes</div>
                  </div>
                </div>
                <div className="text-blue-600 font-bold">95%</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Target size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Eficiencia</div>
                    <div className="text-sm text-gray-600">Operacional</div>
                  </div>
                </div>
                <div className="text-purple-600 font-bold">88%</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Activity size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Crecimiento</div>
                    <div className="text-sm text-gray-600">Mensual</div>
                  </div>
                </div>
                <div className="text-orange-600 font-bold">+12%</div>
              </div>
            </div>
        </Card>
        </div>
      </div>

      {/* Resumen Ejecutivo */}
      <Card 
        title="Resumen Ejecutivo" 
        subtitle="Análisis integral del período seleccionado"
        icon={FileText}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento Financiero</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Ingresos Totales del Período</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency((stats?.total_sales_month || 0) + (stats?.rental_income_month || 0))}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Ventas Realizadas</span>
                <span className="font-semibold text-gray-900">{stats?.total_sales_month || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Ingresos por Alquileres</span>
                <span className="font-semibold text-gray-900">{stats?.rental_income_month || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Pagos Pendientes</span>
                <span className="font-semibold text-red-600">{formatCurrency(stats?.pending_payments || 0)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Operaciones</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Clientes Activos</span>
                <span className="font-semibold text-gray-900">{stats?.active_clients || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Productos en Inventario</span>
                <span className="font-semibold text-gray-900">{stats?.total_products || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Alquileres Activos</span>
                <span className="font-semibold text-gray-900">{stats?.active_rentals || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Cotizaciones Pendientes</span>
                <span className="font-semibold text-orange-600">{stats?.pending_quotations || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;