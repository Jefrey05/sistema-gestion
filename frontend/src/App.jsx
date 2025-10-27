import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { DateFilterProvider } from './contexts/DateFilterContext';
import LoginNew from './pages/LoginNew';
import AdminOrganizations from './pages/AdminOrganizations';
import AdminUsers from './pages/AdminUsers';
import OrganizationSettings from './pages/OrganizationSettings';
import DashboardProfessional from './pages/DashboardProfessional';
import DashboardExecutive from './pages/DashboardExecutive';
import Products from './pages/ProductosProfessional';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import Movements from './pages/Movements';
import Clients from './pages/Clients';
import Quotations from './pages/Quotations';
import Sales from './pages/Sales';
import Rentals from './pages/Rentals';
import BusinessSummary from './components/BusinessSummary';
import Reports from './pages/Reports';
import SystemFailures from './pages/SystemFailures';
import Layout from './components/Layout';
import ModuleSettings from './components/ModuleSettings';

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Componente para redirigir super admin al panel de organizaciones
function DashboardRedirect() {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === 'super_admin';
  
  if (isSuperAdmin) {
    return <Navigate to="/admin/organizations" replace />;
  }
  
  return <DashboardExecutive />;
}

function App() {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <CurrencyProvider>
      <DateFilterProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginNew />} />
          
          {/* Rutas protegidas */}
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<DashboardRedirect />} />
            <Route path="clients" element={<Clients />} />
            <Route path="quotations" element={<Quotations />} />
            <Route path="sales" element={<Sales />} />
            <Route path="rentals" element={<Rentals />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="movements" element={<Movements />} />
            
            {/* Resumen de estadísticas */}
            <Route path="summary" element={<BusinessSummary />} />
            <Route path="reports" element={<Reports />} />
            <Route path="failures" element={<SystemFailures />} />
            
            {/* Configuración de organización */}
            <Route path="settings" element={<OrganizationSettings />} />
            <Route path="module-settings" element={<ModuleSettings />} />
            
            {/* Panel de admin */}
            <Route path="admin/organizations" element={<AdminOrganizations />} />
            <Route path="admin/users" element={<AdminUsers />} />
          </Route>
          </Routes>
        </Router>
      </DateFilterProvider>
    </CurrencyProvider>
  );
}

export default App;
