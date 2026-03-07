import { X, Upload, Save, FileText, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api';

const InvoiceSettingsModal = ({ onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rnc: '',
    address: '',
    city: '',
    address_number: '',
    website: '',
    invoice_email: '',
    logo_url: '',
    stamp_url: ''
  });

  useEffect(() => {
    fetchOrganizationData();
  }, []);

  const fetchOrganizationData = async () => {
    try {
      const response = await api.get('/organizations/me');
      const org = response.data;
      setFormData({
        name: org.name || '',
        rnc: org.rnc || '',
        address: org.address || '',
        city: org.city || '',
        address_number: org.address_number || '',
        website: org.website || '',
        invoice_email: org.invoice_email || org.email || '',
        logo_url: org.logo_url || '',
        stamp_url: org.stamp_url || ''
      });
    } catch (error) {
      console.error('Error al cargar datos de la organización:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await api.post('/organizations/me/upload-logo', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFormData(prev => ({
        ...prev,
        logo_url: response.data.logo_url
      }));
      alert('Logo subido exitosamente');
    } catch (error) {
      console.error('Error al subir logo:', error);
      alert('Error al subir el logo');
    } finally {
      setUploading(false);
    }
  };

  const handleStampUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await api.post('/organizations/me/upload-stamp', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFormData(prev => ({
        ...prev,
        stamp_url: response.data.stamp_url
      }));
      alert('Sello subido exitosamente');
    } catch (error) {
      console.error('Error al subir sello:', error);
      alert('Error al subir el sello');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/organizations/me/settings', {
        name: formData.name,
        rnc: formData.rnc,
        address: formData.address,
        city: formData.city,
        address_number: formData.address_number,
        website: formData.website,
        invoice_email: formData.invoice_email,
        logo_url: formData.logo_url,
        stamp_url: formData.stamp_url,
        primary_color: '#0066cc',
        secondary_color: '#00cc66',
        modules_enabled: {}
      });

      alert('Configuración de factura guardada exitosamente');
      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      alert('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `https://sistema-gestion-api.onrender.com${url}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Configuración de Factura</h2>
                <p className="text-blue-100 text-sm">Datos que aparecerán en las facturas impresas</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Información Básica */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre de la Empresa *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: ZIBAMED, S.R.L."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    RNC
                  </label>
                  <input
                    type="text"
                    name="rnc"
                    value={formData.rnc}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: 131141851"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Santo Domingo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="invoice_email"
                    value={formData.invoice_email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: contacto@empresa.com"
                  />
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Dirección</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dirección Completa
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Calle Ortega y Gasset Esquina 36"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número
                  </label>
                  <input
                    type="text"
                    name="address_number"
                    value={formData.address_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: no. 70"
                  />
                </div>
              </div>
            </div>

            {/* Página Web */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Página Web (Opcional)</h3>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej: www.zibamed.com"
              />
            </div>

            {/* Logo y Sello */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Logo y Sello</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Logo de la Empresa
                  </label>
                  <div className="space-y-3">
                    {formData.logo_url && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center bg-white">
                        <img 
                          src={getFullImageUrl(formData.logo_url)} 
                          alt="Logo" 
                          className="max-h-24 object-contain"
                        />
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                      <Upload size={20} />
                      <span>{uploading ? 'Subiendo...' : 'Subir Logo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                {/* Sello */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sello/Firma
                  </label>
                  <div className="space-y-3">
                    {formData.stamp_url && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center bg-white">
                        <img 
                          src={getFullImageUrl(formData.stamp_url)} 
                          alt="Sello" 
                          className="max-h-24 object-contain"
                        />
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                      <ImageIcon size={20} />
                      <span>{uploading ? 'Subiendo...' : 'Subir Sello'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleStampUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || uploading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSettingsModal;
