import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, Mail, Phone, User, Lock, CheckCircle2, Sparkles, Zap, Shield, TrendingUp } from 'lucide-react';

export default function OrganizationRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Información de la empresa
    name: '',
    email: '',
    phone: '',
    
    // Información del administrador
    admin_username: '',
    admin_email: '',
    admin_password: '',
    admin_password_confirm: '',
    
    // Módulos que desea utilizar
    modules_requested: {
      dashboard: true,
      clients: true,
      products: true,
      inventory: true,
      quotations: true,
      sales: true,
      rentals: true,
      categories: true,
      suppliers: true
    },
    
    // Personalización
    primary_color: '#3b82f6',
    secondary_color: '#8b5cf6'
  });

  const [errors, setErrors] = useState({});

  const modules = [
    { key: 'dashboard', label: 'Dashboard', icon: TrendingUp, description: 'Panel de control y estadísticas' },
    { key: 'clients', label: 'Clientes', icon: User, description: 'Gestión de clientes' },
    { key: 'products', label: 'Productos', icon: Building2, description: 'Catálogo de productos' },
    { key: 'inventory', label: 'Inventario', icon: Shield, description: 'Control de stock' },
    { key: 'quotations', label: 'Cotizaciones', icon: Mail, description: 'Crear cotizaciones' },
    { key: 'sales', label: 'Ventas', icon: Zap, description: 'Facturación y ventas' },
    { key: 'rentals', label: 'Alquileres', icon: Sparkles, description: 'Gestión de alquileres' },
    { key: 'categories', label: 'Categorías', icon: Building2, description: 'Organizar productos' },
    { key: 'suppliers', label: 'Proveedores', icon: Building2, description: 'Gestión de proveedores' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleModuleToggle = (moduleKey) => {
    setFormData(prev => ({
      ...prev,
      modules_requested: {
        ...prev.modules_requested,
        [moduleKey]: !prev.modules_requested[moduleKey]
      }
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la empresa es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.admin_username.trim()) {
      newErrors.admin_username = 'El nombre de usuario es requerido';
    }
    
    if (!formData.admin_email.trim()) {
      newErrors.admin_email = 'El email del administrador es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.admin_email)) {
      newErrors.admin_email = 'Email inválido';
    }
    
    if (!formData.admin_password) {
      newErrors.admin_password = 'La contraseña es requerida';
    } else if (formData.admin_password.length < 6) {
      newErrors.admin_password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (formData.admin_password !== formData.admin_password_confirm) {
      newErrors.admin_password_confirm = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post('/api/organizations/register', formData);
      
      console.log('Registro exitoso:', response.data);
      setSuccess(true);
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Error al registrar:', error);
      
      if (error.response?.data?.detail) {
        setErrors({ submit: error.response.data.detail });
      } else {
        setErrors({ submit: 'Error al registrar la organización. Intenta de nuevo.' });
      }
      
      setStep(1); // Volver al inicio para corregir
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Registro Exitoso!</h2>
          <p className="text-gray-600 mb-6">
            Tu solicitud ha sido recibida. Nuestro equipo revisará tu información y te notificaremos cuando tu cuenta esté activada.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Próximos pasos:</strong>
              <br />
              1. Recibirás un email de confirmación
              <br />
              2. Revisaremos tu solicitud (24-48 hrs)
              <br />
              3. Te notificaremos cuando puedas acceder
            </p>
          </div>
          <p className="text-sm text-gray-500">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Registra tu Empresa</h1>
          <p className="text-blue-100">Comienza a gestionar tu inventario de forma profesional</p>
          
          {/* Progress Bar */}
          <div className="mt-6 flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all ${
                  s <= step ? 'bg-white' : 'bg-blue-400'
                }`}
              />
            ))}
          </div>
          <div className="mt-2 text-sm text-blue-100">
            Paso {step} de 3
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {errors.submit && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Step 1: Información de la Empresa */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Información de tu Empresa</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="inline w-4 h-4 mr-1" />
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Mi Empresa S.A."
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-1" />
                  Email Corporativo *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="contacto@miempresa.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-1" />
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+1 (809) 555-1234"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Administrador */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Cuenta de Administrador</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Nombre de Usuario *
                </label>
                <input
                  type="text"
                  name="admin_username"
                  value={formData.admin_username}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.admin_username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="admin"
                />
                {errors.admin_username && <p className="mt-1 text-sm text-red-600">{errors.admin_username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-1" />
                  Email del Administrador *
                </label>
                <input
                  type="email"
                  name="admin_email"
                  value={formData.admin_email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.admin_email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="admin@miempresa.com"
                />
                {errors.admin_email && <p className="mt-1 text-sm text-red-600">{errors.admin_email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="inline w-4 h-4 mr-1" />
                  Contraseña *
                </label>
                <input
                  type="password"
                  name="admin_password"
                  value={formData.admin_password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.admin_password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Mínimo 6 caracteres"
                />
                {errors.admin_password && <p className="mt-1 text-sm text-red-600">{errors.admin_password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="inline w-4 h-4 mr-1" />
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  name="admin_password_confirm"
                  value={formData.admin_password_confirm}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.admin_password_confirm ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Repite la contraseña"
                />
                {errors.admin_password_confirm && <p className="mt-1 text-sm text-red-600">{errors.admin_password_confirm}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Módulos */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecciona los Módulos</h3>
              <p className="text-gray-600 mb-6">Elige las funcionalidades que necesitas para tu negocio</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((module) => (
                  <div
                    key={module.key}
                    onClick={() => handleModuleToggle(module.key)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.modules_requested[module.key]
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        formData.modules_requested[module.key]
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <module.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">{module.label}</h4>
                          <input
                            type="checkbox"
                            checked={formData.modules_requested[module.key]}
                            onChange={() => handleModuleToggle(module.key)}
                            className="w-5 h-5 text-blue-600 rounded"
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mt-6">
                <h4 className="font-semibold text-gray-900 mb-2">¿Necesitas más módulos después?</h4>
                <p className="text-sm text-gray-600">
                  No te preocupes, podrás activar o desactivar módulos en cualquier momento desde la configuración de tu cuenta.
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-8 flex gap-4">
            {step > 1 && (
              <button
                onClick={handleBack}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Atrás
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </>
              ) : step === 3 ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Completar Registro
                </>
              ) : (
                'Siguiente'
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Iniciar Sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}








