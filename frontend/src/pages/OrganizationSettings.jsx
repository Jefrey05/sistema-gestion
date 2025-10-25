import { useState, useEffect } from 'react';
import { Building2, Palette, Upload, Save, CheckCircle2, Package, Users, FileText, ShoppingCart, Calendar, TrendingUp, Boxes, Truck, AlertTriangle, Trash2, Settings, X, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';
import Notification from '../components/Notification';
import SystemResetModal from '../components/SystemResetModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import SessionManagementModal from '../components/SessionManagementModal';
import { dashboardService } from '../services/dashboardService';
import { organizationsService } from '../services/organizationsService';

export default function OrganizationSettings() {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [organizationStats, setOrganizationStats] = useState(null);
  const [showColorModal, setShowColorModal] = useState(false);
  const [isInvoiceSettingsOpen, setIsInvoiceSettingsOpen] = useState(false);
  const [stampFile, setStampFile] = useState(null);
  const [stampPreview, setStampPreview] = useState(null);
  const [uploadingStamp, setUploadingStamp] = useState(false);
  const [invoiceSettings, setInvoiceSettings] = useState({
    rnc: '',
    address: '',
    city: '',
    address_number: '',
    website: '',
    invoice_email: '',
    phone: ''
  });
  const [tempColors, setTempColors] = useState({ 
    primary: '#3b82f6', 
    secondary: '#8b5cf6',
    clients_start: '#10b981',
    clients_end: '#059669',
    quotations_start: '#f59e0b',
    quotations_end: '#d97706',
    sales_start: '#3b82f6',
    sales_end: '#2563eb',
    rentals_start: '#8b5cf6',
    rentals_end: '#7c3aed',
    products_start: '#06b6d4',
    products_end: '#0891b2',
    categories_start: '#ec4899',
    categories_end: '#db2777',
    suppliers_start: '#f97316',
    suppliers_end: '#ea580c',
    goals_start: '#14b8a6',
    goals_end: '#0d9488',
    quickActions_start: '#6366f1',
    quickActions_end: '#4f46e5'
  });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSystemReset = async () => {
    try {
      await dashboardService.resetOrganizationData();
      showNotification('success', 'Sistema reseteado exitosamente. Todos los datos han sido eliminados.');
      setShowResetModal(false);
      // Recargar la página para reflejar los cambios
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error al resetear sistema:', error);
      showNotification('error', 'Error al resetear el sistema. Inténtalo de nuevo.');
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    
    try {
      setUploadingLogo(true);
      const response = await dashboardService.uploadLogo(logoFile);
      
      // Actualizar el estado local
      setOrganization(prev => ({
        ...prev,
        logo_url: response.logo_url
      }));
      
      showNotification('success', 'Logo actualizado correctamente');
      setLogoFile(null);
      setLogoPreview(null);
    } catch (error) {
      console.error('Error al subir logo:', error);
      showNotification('error', 'Error al subir el logo. Inténtalo de nuevo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDeleteLogo = async () => {
    try {
      await dashboardService.deleteLogo();
      
      // Actualizar el estado local
      setOrganization(prev => ({
        ...prev,
        logo_url: null
      }));
      
      showNotification('success', 'Logo eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar logo:', error);
      showNotification('error', 'Error al eliminar el logo. Inténtalo de nuevo.');
    }
  };

  const handleOpenColorModal = () => {
    // Cargar colores actuales
    setTempColors({
      primary: settings.primary_color || '#3b82f6',
      secondary: settings.secondary_color || '#8b5cf6',
      clients_start: settings.clients_start_color || '#10b981',
      clients_end: settings.clients_end_color || '#059669',
      quotations_start: settings.quotations_start_color || '#f59e0b',
      quotations_end: settings.quotations_end_color || '#d97706',
      sales_start: settings.sales_start_color || '#3b82f6',
      sales_end: settings.sales_end_color || '#2563eb',
      rentals_start: settings.rentals_start_color || '#8b5cf6',
      rentals_end: settings.rentals_end_color || '#7c3aed',
      products_start: settings.products_start_color || '#06b6d4',
      products_end: settings.products_end_color || '#0891b2',
      categories_start: settings.categories_start_color || '#ec4899',
      categories_end: settings.categories_end_color || '#db2777',
      suppliers_start: settings.suppliers_start_color || '#f97316',
      suppliers_end: settings.suppliers_end_color || '#ea580c',
      goals_start: settings.goals_start_color || '#14b8a6',
      goals_end: settings.goals_end_color || '#0d9488',
      quickActions_start: settings.quick_actions_start_color || '#6366f1',
      quickActions_end: settings.quick_actions_end_color || '#4f46e5'
    });
    setShowColorModal(true);
  };

  const handleSaveColors = async () => {
    try {
      // Actualizar los colores en settings
      const updatedSettings = {
        ...settings,
        primary_color: tempColors.primary,
        secondary_color: tempColors.secondary,
        clients_start_color: tempColors.clients_start,
        clients_end_color: tempColors.clients_end,
        quotations_start_color: tempColors.quotations_start,
        quotations_end_color: tempColors.quotations_end,
        sales_start_color: tempColors.sales_start,
        sales_end_color: tempColors.sales_end,
        rentals_start_color: tempColors.rentals_start,
        rentals_end_color: tempColors.rentals_end,
        products_start_color: tempColors.products_start,
        products_end_color: tempColors.products_end,
        categories_start_color: tempColors.categories_start,
        categories_end_color: tempColors.categories_end,
        suppliers_start_color: tempColors.suppliers_start,
        suppliers_end_color: tempColors.suppliers_end,
        goals_start_color: tempColors.goals_start,
        goals_end_color: tempColors.goals_end,
        quick_actions_start_color: tempColors.quickActions_start,
        quick_actions_end_color: tempColors.quickActions_end
      };
      
      setSettings(updatedSettings);
      
      // Guardar en el backend
      await api.put('/organizations/me/settings', updatedSettings);
      
      showNotification('success', '🎨 Colores actualizados correctamente');
      setShowColorModal(false);
      
      // Recargar para aplicar cambios
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Error al guardar colores:', error);
      showNotification('error', 'Error al guardar los colores. Inténtalo de nuevo.');
    }
  };

  const [settings, setSettings] = useState({
    name: '',
    logo_url: '',
    primary_color: '#3b82f6',
    secondary_color: '#8b5cf6'
  });


  useEffect(() => {
    loadOrganization();
  }, []);

  const loadOrganization = async () => {
    try {
      // Verificar autenticación
      const token = localStorage.getItem('token');
      
      console.log('Token exists:', !!token);
      
      if (!token) {
        showNotification('error', 'No estás autenticado. Redirigiendo al login...');
        setLoading(false);
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        return;
      }
      
      console.log('Cargando organización...');
      
      // Usar el endpoint /me que incluye estadísticas
      const response = await api.get('/organizations/me');
      
      console.log('Organización cargada exitosamente:', response.data);
      
      // Validar que response.data existe
      if (!response.data) {
        throw new Error('No se recibieron datos del servidor');
      }
      
      setOrganization(response.data);
      
      // Establecer estadísticas desde la respuesta
      setOrganizationStats({
        total_users: response.data.total_users || 0,
        total_clients: response.data.total_clients || 0,
        total_products: response.data.total_products || 0,
        total_sales: response.data.total_sales || 0,
        total_rentals: response.data.total_rentals || 0
      });
      
      setSettings({
        name: response.data.name || '',
        logo_url: response.data.logo_url || '',
        primary_color: response.data.primary_color || '#3b82f6',
        secondary_color: response.data.secondary_color || '#8b5cf6',
        clients_start_color: response.data.clients_start_color || '#10b981',
        clients_end_color: response.data.clients_end_color || '#059669',
        quotations_start_color: response.data.quotations_start_color || '#f59e0b',
        quotations_end_color: response.data.quotations_end_color || '#d97706',
        sales_start_color: response.data.sales_start_color || '#3b82f6',
        sales_end_color: response.data.sales_end_color || '#2563eb',
        rentals_start_color: response.data.rentals_start_color || '#8b5cf6',
        rentals_end_color: response.data.rentals_end_color || '#7c3aed',
        products_start_color: response.data.products_start_color || '#06b6d4',
        products_end_color: response.data.products_end_color || '#0891b2',
        categories_start_color: response.data.categories_start_color || '#ec4899',
        categories_end_color: response.data.categories_end_color || '#db2777',
        suppliers_start_color: response.data.suppliers_start_color || '#f97316',
        suppliers_end_color: response.data.suppliers_end_color || '#ea580c',
        goals_start_color: response.data.goals_start_color || '#14b8a6',
        goals_end_color: response.data.goals_end_color || '#0d9488',
        quick_actions_start_color: response.data.quick_actions_start_color || '#6366f1',
        quick_actions_end_color: response.data.quick_actions_end_color || '#4f46e5'
      });
      
      // Configurar logo preview de forma segura
      if (response.data.logo_url) {
        setLogoPreview(`https://sistema-gestion-api.onrender.com${response.data.logo_url}`);
      } else {
        setLogoPreview(null);
      }
      
      // Configurar stamp preview
      if (response.data.stamp_url) {
        setStampPreview(`https://sistema-gestion-api.onrender.com${response.data.stamp_url}`);
      } else {
        setStampPreview(null);
      }
      
      // Configurar datos de facturación
      setInvoiceSettings({
        rnc: response.data.rnc || '',
        address: response.data.address || '',
        city: response.data.city || '',
        address_number: response.data.address_number || '',
        website: response.data.website || '',
        invoice_email: response.data.invoice_email || response.data.email || '',
        phone: response.data.phone || ''
      });
      
    } catch (error) {
      console.error('Error loading organization:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      if (error.response?.status === 401) {
        showNotification('error', 'Sesión expirada. Por favor, inicia sesión nuevamente.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.detail || 'El usuario no tiene una organización asignada';
        showNotification('error', errorMsg);
      } else if (error.response?.status === 403) {
        showNotification('error', 'No tienes permisos para acceder a esta información.');
      } else if (error.response?.status === 404) {
        showNotification('error', 'Organización no encontrada.');
      } else {
        const errorMsg = error.response?.data?.detail || error.message || 'Error al cargar la organización';
        showNotification('error', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizationStats = async () => {
    try {
      // Usar el endpoint de estadísticas de organizaciones
      const response = await api.get('/organizations/stats');
      
      if (response.data) {
        setOrganizationStats(response.data);
      }
    } catch (error) {
      console.error('Error loading organization stats:', error);
      // No mostrar error para las estadísticas, es opcional
      // Solo establecer valores por defecto
      setOrganizationStats({
        total_users: 0,
        total_clients: 0,
        total_products: 0,
        total_sales: 0,
        total_rentals: 0
      });
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        showNotification('error', 'El archivo es demasiado grande (máx 5MB)');
        return;
      }

      if (!file.type.startsWith('image/')) {
        showNotification('error', 'El archivo debe ser una imagen');
        return;
      }

      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleStampChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        showNotification('error', 'El archivo es demasiado grande (máx 5MB)');
        return;
      }

      if (!file.type.startsWith('image/')) {
        showNotification('error', 'El archivo debe ser una imagen');
        return;
      }

      setStampFile(file);
      setStampPreview(URL.createObjectURL(file));
    }
  };

  const handleStampUpload = async () => {
    if (!stampFile) return;
    
    try {
      setUploadingStamp(true);
      const formData = new FormData();
      formData.append('file', stampFile);
      
      const response = await api.post('/organizations/me/upload-stamp', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setOrganization(prev => ({
        ...prev,
        stamp_url: response.data.stamp_url
      }));
      
      showNotification('success', 'Sello actualizado correctamente');
      setStampFile(null);
      setStampPreview(response.data.stamp_url ? `https://sistema-gestion-api.onrender.com${response.data.stamp_url}` : null);
    } catch (error) {
      console.error('Error al subir sello:', error);
      showNotification('error', 'Error al subir el sello. Inténtalo de nuevo.');
    } finally {
      setUploadingStamp(false);
    }
  };

  const handleDeleteStamp = async () => {
    try {
      await api.delete('/organizations/me/stamp');
      
      setOrganization(prev => ({
        ...prev,
        stamp_url: null
      }));
      
      setStampPreview(null);
      showNotification('success', 'Sello eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar sello:', error);
      showNotification('error', 'Error al eliminar el sello');
    }
  };

  const handleSaveInvoiceSettings = async () => {
    try {
      setSaving(true);
      await api.put('/organizations/me/settings', {
        ...settings,
        ...invoiceSettings
      });
      
      showNotification('success', 'Configuración de factura guardada correctamente');
      await loadOrganization();
    } catch (error) {
      console.error('Error al guardar configuración de factura:', error);
      showNotification('error', 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Subir logo si hay uno nuevo
      let logo_url = settings.logo_url;
      if (logoFile) {
        logo_url = await uploadLogo();
      }

      // Actualizar settings
      await api.put('/organizations/me/settings', {
        ...settings,
        logo_url
      });

      showNotification('success', 'Configuración guardada exitosamente');
      loadOrganization(); // Recargar
      setLogoFile(null); // Limpiar archivo temporal
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('error', 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuración de la Organización</h1>
        <p className="text-gray-600 mt-2">Personaliza la apariencia y configuración de tu empresa</p>
      </div>

      {/* Organization Info Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-8">
        <div className="flex items-center gap-4">
          {logoPreview ? (
            <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-lg bg-white object-contain p-2" />
          ) : (
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold text-2xl">
              {organization?.name?.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{organization?.name}</h2>
            <p className="text-blue-100">{organization?.email}</p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
        {/* Logo Upload */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Logo de la Empresa
          </h3>
          
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-12 h-12 text-gray-400" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex gap-3 mb-2">
                <label className="bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Seleccionar Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
                
                {logoFile && (
                  <button
                    onClick={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {uploadingLogo ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Subir Logo
                      </>
                    )}
                  </button>
                )}
                
                {organization?.logo_url && (
                  <button
                    onClick={handleDeleteLogo}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Eliminar Logo
                  </button>
                )}
              </div>
              
              <p className="text-sm text-gray-600">
                Formatos: JPG, PNG, SVG (máx 5MB)
              </p>
              
              {logoFile && (
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {logoFile.name} - Listo para subir
                </p>
              )}
              
              {organization?.logo_url && !logoFile && (
                <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Logo actual: {organization.logo_url.split('/').pop()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Company Name */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Información de la Empresa
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Empresa
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Invoice Configuration */}
        <div className="border-t pt-8">
          <button
            onClick={() => setIsInvoiceSettingsOpen(!isInvoiceSettingsOpen)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors mb-4"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">
                Configuración de Factura
              </h3>
            </div>
            {isInvoiceSettingsOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {isInvoiceSettingsOpen && (
            <>
              <p className="text-sm text-gray-600 mb-6">
                Datos que aparecerán en las facturas, cotizaciones y alquileres impresos
              </p>

              <div className="space-y-6">
            {/* Basic Invoice Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RNC / Identificación Fiscal
                </label>
                <input
                  type="text"
                  value={invoiceSettings.rnc}
                  onChange={(e) => setInvoiceSettings({ ...invoiceSettings, rnc: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: 131141851"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={invoiceSettings.city}
                  onChange={(e) => setInvoiceSettings({ ...invoiceSettings, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Santo Domingo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={invoiceSettings.address}
                  onChange={(e) => setInvoiceSettings({ ...invoiceSettings, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Calle Ortega y Gasset Esquina 36"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número
                </label>
                <input
                  type="text"
                  value={invoiceSettings.address_number}
                  onChange={(e) => setInvoiceSettings({ ...invoiceSettings, address_number: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: no. 70"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Página Web (Opcional)
                </label>
                <input
                  type="text"
                  value={invoiceSettings.website}
                  onChange={(e) => setInvoiceSettings({ ...invoiceSettings, website: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: www.empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico para Facturas
                </label>
                <input
                  type="email"
                  value={invoiceSettings.invoice_email}
                  onChange={(e) => setInvoiceSettings({ ...invoiceSettings, invoice_email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: facturacion@empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono de la Empresa
                </label>
                <input
                  type="tel"
                  value={invoiceSettings.phone}
                  onChange={(e) => setInvoiceSettings({ ...invoiceSettings, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: (809) 555-1234"
                />
              </div>
            </div>

            {/* Stamp Upload */}
            <div className="border-t pt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Sello/Firma para Facturas
              </h4>
              
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  {stampPreview ? (
                    <img src={stampPreview} alt="Sello" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex gap-3 mb-2">
                    <label className="bg-green-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-green-700 transition-colors inline-flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Seleccionar Sello
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleStampChange}
                        className="hidden"
                      />
                    </label>
                    
                    {stampFile && (
                      <button
                        onClick={handleStampUpload}
                        disabled={uploadingStamp}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        {uploadingStamp ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            Subir Sello
                          </>
                        )}
                      </button>
                    )}
                    
                    {organization?.stamp_url && (
                      <button
                        onClick={handleDeleteStamp}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                      >
                        <Trash2 className="w-5 h-5" />
                        Eliminar Sello
                      </button>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Formatos: JPG, PNG, SVG (máx 5MB)
                  </p>
                  
                  {stampFile && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {stampFile.name} - Listo para subir
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveInvoiceSettings}
                disabled={saving}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Configuración de Factura
                  </>
                )}
              </button>
            </div>
          </div>
            </>
          )}
        </div>

        {/* Colors - Botón para abrir modal */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            🎨 Colores del Sistema
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            Personaliza los colores del gradiente principal del sistema
          </p>

          <button
            onClick={handleOpenColorModal}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            <Settings className="w-5 h-5" />
            Configurar Colores
          </button>
        </div>

        {/* Modal de Configuración de Colores */}
        {showColorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-white" />
                    <h2 className="text-xl font-bold text-white">Configurar Colores del Sistema</h2>
                  </div>
                  <button
                    onClick={() => setShowColorModal(false)}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🎨 Colores por Módulo</h3>

                {/* Grid de colores de módulos */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Color Principal */}
                  <div className="col-span-2 border border-gray-200 rounded-lg p-3 bg-gradient-to-br from-blue-50 to-purple-50">
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      🎨 Color Principal
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Inicio</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.primary}
                            onChange={(e) => setTempColors({ ...tempColors, primary: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.primary}
                            onChange={(e) => setTempColors({ ...tempColors, primary: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Fin</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.secondary}
                            onChange={(e) => setTempColors({ ...tempColors, secondary: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.secondary}
                            onChange={(e) => setTempColors({ ...tempColors, secondary: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 h-8 rounded" style={{ background: `linear-gradient(to right, ${tempColors.primary}, ${tempColors.secondary})` }} />
                  </div>
                  {/* Clientes */}
                  <div className="col-span-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      👥 Clientes
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Inicio</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.clients_start}
                            onChange={(e) => setTempColors({ ...tempColors, clients_start: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.clients_start}
                            onChange={(e) => setTempColors({ ...tempColors, clients_start: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Fin</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.clients_end}
                            onChange={(e) => setTempColors({ ...tempColors, clients_end: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.clients_end}
                            onChange={(e) => setTempColors({ ...tempColors, clients_end: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 h-8 rounded" style={{ background: `linear-gradient(to right, ${tempColors.clients_start}, ${tempColors.clients_end})` }} />
                  </div>

                  {/* Cotizaciones */}
                  <div className="col-span-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      📄 Cotizaciones
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Inicio</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.quotations_start}
                            onChange={(e) => setTempColors({ ...tempColors, quotations_start: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.quotations_start}
                            onChange={(e) => setTempColors({ ...tempColors, quotations_start: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Fin</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.quotations_end}
                            onChange={(e) => setTempColors({ ...tempColors, quotations_end: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.quotations_end}
                            onChange={(e) => setTempColors({ ...tempColors, quotations_end: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 h-8 rounded" style={{ background: `linear-gradient(to right, ${tempColors.quotations_start}, ${tempColors.quotations_end})` }} />
                  </div>

                  {/* Ventas */}
                  <div className="col-span-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      🛒 Ventas
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Inicio</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.sales_start}
                            onChange={(e) => setTempColors({ ...tempColors, sales_start: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.sales_start}
                            onChange={(e) => setTempColors({ ...tempColors, sales_start: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Fin</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.sales_end}
                            onChange={(e) => setTempColors({ ...tempColors, sales_end: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.sales_end}
                            onChange={(e) => setTempColors({ ...tempColors, sales_end: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 h-8 rounded" style={{ background: `linear-gradient(to right, ${tempColors.sales_start}, ${tempColors.sales_end})` }} />
                  </div>

                  {/* Alquileres */}
                  <div className="col-span-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      📅 Alquileres
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Inicio</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.rentals_start}
                            onChange={(e) => setTempColors({ ...tempColors, rentals_start: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.rentals_start}
                            onChange={(e) => setTempColors({ ...tempColors, rentals_start: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Fin</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.rentals_end}
                            onChange={(e) => setTempColors({ ...tempColors, rentals_end: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.rentals_end}
                            onChange={(e) => setTempColors({ ...tempColors, rentals_end: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 h-8 rounded" style={{ background: `linear-gradient(to right, ${tempColors.rentals_start}, ${tempColors.rentals_end})` }} />
                  </div>

                  {/* Productos */}
                  <div className="col-span-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      📦 Productos
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Inicio</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.products_start}
                            onChange={(e) => setTempColors({ ...tempColors, products_start: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.products_start}
                            onChange={(e) => setTempColors({ ...tempColors, products_start: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Fin</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.products_end}
                            onChange={(e) => setTempColors({ ...tempColors, products_end: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.products_end}
                            onChange={(e) => setTempColors({ ...tempColors, products_end: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 h-8 rounded" style={{ background: `linear-gradient(to right, ${tempColors.products_start}, ${tempColors.products_end})` }} />
                  </div>

                  {/* Categorías */}
                  <div className="col-span-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      🏷️ Categorías
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Inicio</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.categories_start}
                            onChange={(e) => setTempColors({ ...tempColors, categories_start: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.categories_start}
                            onChange={(e) => setTempColors({ ...tempColors, categories_start: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Fin</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.categories_end}
                            onChange={(e) => setTempColors({ ...tempColors, categories_end: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.categories_end}
                            onChange={(e) => setTempColors({ ...tempColors, categories_end: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 h-8 rounded" style={{ background: `linear-gradient(to right, ${tempColors.categories_start}, ${tempColors.categories_end})` }} />
                  </div>

                  {/* Proveedores */}
                  <div className="col-span-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      🚚 Proveedores
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Inicio</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.suppliers_start}
                            onChange={(e) => setTempColors({ ...tempColors, suppliers_start: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.suppliers_start}
                            onChange={(e) => setTempColors({ ...tempColors, suppliers_start: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Fin</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.suppliers_end}
                            onChange={(e) => setTempColors({ ...tempColors, suppliers_end: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.suppliers_end}
                            onChange={(e) => setTempColors({ ...tempColors, suppliers_end: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 h-8 rounded" style={{ background: `linear-gradient(to right, ${tempColors.suppliers_start}, ${tempColors.suppliers_end})` }} />
                  </div>

                  {/* Meta de Ventas */}
                  <div className="col-span-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      🎯 Meta de Ventas
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Inicio</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.goals_start}
                            onChange={(e) => setTempColors({ ...tempColors, goals_start: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.goals_start}
                            onChange={(e) => setTempColors({ ...tempColors, goals_start: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Fin</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.goals_end}
                            onChange={(e) => setTempColors({ ...tempColors, goals_end: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.goals_end}
                            onChange={(e) => setTempColors({ ...tempColors, goals_end: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 h-8 rounded" style={{ background: `linear-gradient(to right, ${tempColors.goals_start}, ${tempColors.goals_end})` }} />
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="col-span-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      ⚡ Acciones Rápidas
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Inicio</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.quickActions_start}
                            onChange={(e) => setTempColors({ ...tempColors, quickActions_start: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.quickActions_start}
                            onChange={(e) => setTempColors({ ...tempColors, quickActions_start: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Color Fin</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tempColors.quickActions_end}
                            onChange={(e) => setTempColors({ ...tempColors, quickActions_end: e.target.value })}
                            className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.quickActions_end}
                            onChange={(e) => setTempColors({ ...tempColors, quickActions_end: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 h-8 rounded" style={{ background: `linear-gradient(to right, ${tempColors.quickActions_start}, ${tempColors.quickActions_end})` }} />
                  </div>
                </div>

                {/* Vista Previa del Gradiente */}
                <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                  <p className="text-sm font-bold text-gray-700 mb-3">🎨 Vista Previa del Gradiente:</p>
                  <div
                    className="h-32 rounded-xl shadow-xl"
                    style={{
                      background: `linear-gradient(135deg, ${tempColors.primary}, ${tempColors.secondary})`
                    }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 p-4 rounded-b-2xl flex justify-end gap-3 border-t border-gray-200">
                <button
                  onClick={() => setShowColorModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveColors}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-semibold flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Guardar Colores
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Plan Info (Read-only) */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Plan de Suscripción</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Plan Actual:</p>
              <p className="font-semibold text-gray-900 capitalize">{organization?.subscription_plan}</p>
            </div>
            <div>
              <p className="text-gray-600">Estado:</p>
              <p className="font-semibold text-green-600">Activo</p>
            </div>
            <div>
              <p className="text-gray-600">Usuarios:</p>
              <p className="font-semibold text-gray-900">
                {organization?.total_users || 0} / {organization?.max_users === -1 ? '∞' : organization?.max_users}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Productos:</p>
              <p className="font-semibold text-gray-900">
                {organizationStats?.total_products || 0} / {organization?.max_products === -1 ? '∞' : organization?.max_products}
              </p>
            </div>
          </div>
        </div>

        {/* Organization Statistics */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Estadísticas de la Organización
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Resumen general de tu organización y actividad del sistema
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Total Usuarios */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Users className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">Usuarios</p>
                  <p className="text-2xl font-bold text-blue-900">{organizationStats?.total_users || 0}</p>
                </div>
              </div>
            </div>

            {/* Total Clientes */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-200 rounded-lg">
                  <Users className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">Clientes</p>
                  <p className="text-2xl font-bold text-green-900">{organizationStats?.total_clients || 0}</p>
                </div>
              </div>
            </div>

            {/* Total Productos */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-200 rounded-lg">
                  <Package className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm text-purple-700 font-medium">Productos</p>
                  <p className="text-2xl font-bold text-purple-900">{organizationStats?.total_products || 0}</p>
                </div>
              </div>
            </div>

            {/* Total Ventas */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-200 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-orange-700" />
                </div>
                <div>
                  <p className="text-sm text-orange-700 font-medium">Ventas</p>
                  <p className="text-2xl font-bold text-orange-900">{organizationStats?.total_sales || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Reset Section */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Zona de Peligro
          </h3>
          
          <div className="space-y-4">
            <div className="bg-white border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Resetear Sistema</h4>
              <p className="text-sm text-gray-600 mb-4">
                Esta acción eliminará <strong>TODOS</strong> los datos de tu organización de forma permanente. 
                Solo se mantendrán la organización, usuarios y configuraciones básicas.
              </p>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowResetModal(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Resetear Sistema
                </button>
                <span className="text-xs text-gray-500">
                  Útil para limpiar datos de prueba o empezar de cero
                </span>
              </div>
            </div>

            <div className="bg-white border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Cambiar Contraseña</h4>
              <p className="text-sm text-gray-600 mb-4">
                Actualiza tu contraseña de acceso al sistema.
              </p>
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Cambiar Contraseña
              </button>
            </div>

            <div className="bg-white border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Gestión de Sesiones</h4>
              <p className="text-sm text-gray-600 mb-4">
                Administra las sesiones activas de tu cuenta.
              </p>
              <button
                onClick={() => setShowSessionModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Ver Sesiones Activas
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold shadow-lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* System Reset Modal */}
      <SystemResetModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleSystemReset}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={(message) => showNotification('success', message)}
        onError={(message) => showNotification('error', message)}
      />

      {/* Session Management Modal */}
      <SessionManagementModal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        onSuccess={(message) => showNotification('success', message)}
        onError={(message) => showNotification('error', message)}
      />

    </div>
  );
}
