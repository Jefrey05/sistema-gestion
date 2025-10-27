import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useModules } from '../hooks/useModules';
import { useDateFilter } from '../contexts/DateFilterContext';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Truck, 
  ArrowLeftRight, 
  LogOut,
  Menu,
  Settings,
  Building,
  X,
  Users,
  FileText,
  ShoppingCart,
  Calendar,
  ToggleLeft,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';
import NotificationCenter from './NotificationCenter';
import DateRangeSelector from './DateRangeSelector';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isModuleEnabled, loading: modulesLoading } = useModules();
  const { startDate, endDate, handleDateChange } = useDateFilter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Super Admin solo ve panel de organizaciones
  const isSuperAdmin = user?.organization_id === null;
  
  const allMenuItems = isSuperAdmin ? [
    // Menú para Super Admin (NO tiene configuración porque no tiene organización)
    { path: '/admin/organizations', icon: Building, label: 'Gestión de Organizaciones' },
  ] : [
    // Menú para usuarios de organizaciones
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', module: 'dashboard' },
    { path: '/summary', icon: TrendingUp, label: 'Resumen', module: 'summary' },
    // { path: '/reports', icon: BarChart3, label: 'Reportes', module: 'dashboard' },  // Temporalmente deshabilitado
    { path: '/clients', icon: Users, label: 'Clientes', module: 'clients' },
    { path: '/quotations', icon: FileText, label: 'Cotizaciones', module: 'quotations' },
    { path: '/sales', icon: ShoppingCart, label: 'Ventas', module: 'sales' },
    { path: '/rentals', icon: Calendar, label: 'Alquileres', module: 'rentals' },
    { path: '/products', icon: Package, label: 'Productos', module: 'inventory' },
    { path: '/categories', icon: FolderTree, label: 'Categorías', module: 'categories' },
    { path: '/suppliers', icon: Truck, label: 'Proveedores', module: 'suppliers' },
    { path: '/movements', icon: ArrowLeftRight, label: 'Movimientos', module: 'inventory' },
    { path: '/settings', icon: Settings, label: 'Configuración', divider: true },
    { path: '/module-settings', icon: ToggleLeft, label: 'Módulos', divider: true },
    { path: '/admin/users', icon: Users, label: 'Usuarios', adminOnly: true, divider: true },
  ];

  // Filtrar menú basado en módulos activos y permisos
  const menuItems = allMenuItems.filter(item => {
    if (isSuperAdmin) return true; // Super admin ve todo
    if (item.adminOnly && user?.role !== 'admin') return false; // Solo admin ve items adminOnly
    if (!item.module) return true; // Items sin módulo (como configuración) siempre se muestran
    return isModuleEnabled(item.module);
  });

  // Mostrar loading mientras se cargan los módulos
  if (modulesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Premium */}
      <header className="bg-white border-b border-gray-200 fixed w-full z-30 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent ml-2 lg:ml-0 hover:scale-105 transition-transform duration-300">
                {isSuperAdmin ? 'Panel de Administración SaaS' : 'Sistema Empresarial'}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Selector de Fechas Global */}
              <DateRangeSelector 
                onDateChange={handleDateChange}
                initialStartDate={startDate}
                initialEndDate={endDate}
              />
              
              {/* Notificaciones */}
              <NotificationCenter />
              
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Premium */}
      <aside className={`
        fixed top-16 left-0 z-20 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-lg
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <nav className="p-4 space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <div key={item.path}>
                {item.divider && index > 0 && (
                  <div className="my-4 border-t border-gray-200"></div>
                )}
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 scale-105' 
                      : 'text-gray-700 hover:bg-gray-50 hover:scale-105'
                    }
                  `}
                >
                  {/* Indicador activo */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                  )}
                  
                  {/* Icono con animación */}
                  <div className={`transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`}>
                    <Icon size={20} />
                  </div>
                  
                  <span className="font-medium">{item.label}</span>
                </Link>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="pt-16 lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
