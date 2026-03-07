import { useState, useEffect } from 'react';
import { 
  Settings, 
  Package, 
  Users, 
  FileText, 
  ShoppingCart, 
  Calendar, 
  FolderTree, 
  Truck, 
  ArrowLeftRight,
  LayoutDashboard,
  TrendingUp,
  Save,
  Check
} from 'lucide-react';
import { useNotification } from '../hooks/useNotification';
import { organizationsService } from '../services/organizationsService';

const ModuleSettings = () => {
  const [modules, setModules] = useState({
    dashboard: true,
    summary: true,
    sales: true,
    rentals: true,
    quotations: true,
    clients: true,
    inventory: true,
    categories: true,
    suppliers: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reloading, setReloading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const moduleDefinitions = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      description: 'Panel principal con estadísticas y métricas',
      icon: LayoutDashboard,
      required: true // Siempre debe estar activo
    },
    {
      key: 'summary',
      label: 'Resumen',
      description: 'Estadísticas detalladas de ventas, alquileres y pagos',
      icon: TrendingUp,
      required: false
    },
    {
      key: 'clients',
      label: 'Clientes',
      description: 'Gestión de clientes y contactos',
      icon: Users,
      required: false
    },
    {
      key: 'quotations',
      label: 'Cotizaciones',
      description: 'Crear y gestionar cotizaciones',
      icon: FileText,
      required: false
    },
    {
      key: 'sales',
      label: 'Ventas',
      description: 'Registro y gestión de ventas',
      icon: ShoppingCart,
      required: false
    },
    {
      key: 'rentals',
      label: 'Alquileres',
      description: 'Gestión de alquileres de equipos',
      icon: Calendar,
      required: false
    },
    {
      key: 'inventory',
      label: 'Productos',
      description: 'Gestión de inventario y productos',
      icon: Package,
      required: false
    },
    {
      key: 'categories',
      label: 'Categorías',
      description: 'Organización de productos por categorías',
      icon: FolderTree,
      required: false
    },
    {
      key: 'suppliers',
      label: 'Proveedores',
      description: 'Gestión de proveedores',
      icon: Truck,
      required: false
    }
  ];

  useEffect(() => {
    loadModuleSettings();
  }, []);

  const loadModuleSettings = async () => {
    try {
      setLoading(true);
      const organization = await organizationsService.getCurrentOrganization();
      if (organization?.modules_enabled) {
        setModules(organization.modules_enabled);
      }
    } catch (error) {
      console.error('Error loading module settings:', error);
      showError('Error al cargar la configuración de módulos');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleToggle = (moduleKey) => {
    const module = moduleDefinitions.find(m => m.key === moduleKey);
    
    // No permitir desactivar módulos requeridos
    if (module?.required) {
      showError('Este módulo es requerido y no puede ser desactivado');
      return;
    }

    setModules(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await organizationsService.updateModules(modules);
      showSuccess('Configuración guardada exitosamente. Recargando página...');
      
      // Mostrar estado de recarga
      setReloading(true);
      
      // Recargar la página automáticamente después de 1 segundo
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error saving module settings:', error);
      showError('Error al guardar la configuración de módulos');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando configuración...</span>
      </div>
    );
  }

  if (reloading) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="mt-3 text-green-600 font-medium">Recargando página...</span>
        <span className="text-sm text-gray-500 mt-1">Los cambios se aplicarán automáticamente</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="text-blue-600" size={28} />
            Configuración de Módulos
          </h2>
          <p className="text-gray-600 mt-1">
            Activa o desactiva los módulos que quieres usar en tu sistema
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || reloading}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Guardando...
            </>
          ) : reloading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Recargando...
            </>
          ) : (
            <>
              <Save size={20} />
              Guardar Cambios
            </>
          )}
        </button>
      </div>

      <div className="grid gap-4">
        {moduleDefinitions.map((module) => {
          const Icon = module.icon;
          const isActive = modules[module.key];
          const isRequired = module.required;

          return (
            <div
              key={module.key}
              className={`card border-2 transition-all ${
                isActive 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              } ${isRequired ? 'opacity-75' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    isActive ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Icon 
                      className={isActive ? 'text-green-600' : 'text-gray-400'} 
                      size={24} 
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      {module.label}
                      {isRequired && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          Requerido
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {module.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 text-sm ${
                    isActive ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {isActive ? (
                      <>
                        <Check size={16} />
                        Activo
                      </>
                    ) : (
                      'Inactivo'
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleModuleToggle(module.key)}
                    disabled={isRequired}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isActive ? 'bg-green-600' : 'bg-gray-300'
                    } ${isRequired ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Información Importante</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Los módulos desactivados no aparecerán en el menú de navegación</li>
          <li>• Los datos de módulos desactivados se mantienen seguros</li>
          <li>• Puedes reactivar los módulos en cualquier momento</li>
          <li>• El Dashboard siempre permanece activo</li>
          <li>• La página se recargará automáticamente al guardar los cambios</li>
        </ul>
      </div>

      {/* Botón de Guardar */}
      <div className="flex justify-end pt-6">
        <button
          onClick={handleSave}
          disabled={saving || reloading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Guardando...
            </>
          ) : reloading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Recargando página...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar Cambios
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ModuleSettings;
