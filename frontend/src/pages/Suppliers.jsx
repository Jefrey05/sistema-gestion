import { useEffect, useState } from 'react';
import { inventoryService } from '../services/inventoryService';
import { Plus, Edit, Trash2, Truck, Mail, Phone, MapPin } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';
import { useOrganizationColors } from '../hooks/useOrganizationColors';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const { showSuccess, showError } = useNotification();
  const { gradients } = useOrganizationColors();

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando proveedores...');
      const data = await inventoryService.getSuppliers();
      console.log('✅ Proveedores recibidos:', data);
      setSuppliers(data || []);
    } catch (error) {
      console.error('❌ Error loading suppliers:', error);
      console.error('❌ Error completo:', error.response || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      showError('El nombre es requerido');
      return;
    }
    
    try {
      if (selectedSupplier) {
        await inventoryService.updateSupplier(selectedSupplier.id, formData);
        showSuccess('Proveedor actualizado exitosamente');
      } else {
        await inventoryService.createSupplier(formData);
        showSuccess('Proveedor creado exitosamente');
      }
      setShowModal(false);
      setFormData({ name: '', contact_name: '', email: '', phone: '', address: '' });
      setSelectedSupplier(null);
      loadSuppliers();
    } catch (error) {
      console.error('Error saving supplier:', error);
      showError(error.response?.data?.detail || 'Error al guardar el proveedor');
    }
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_name: supplier.contact_name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
      try {
        await inventoryService.deleteSupplier(id);
        loadSuppliers();
      } catch (error) {
        console.error('Error deleting supplier:', error);
        alert('Error al eliminar el proveedor');
      }
    }
  };

  const handleAdd = () => {
    setSelectedSupplier(null);
    setFormData({ name: '', contact_name: '', email: '', phone: '', address: '' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Mejorado */}
      <div 
        className="rounded-2xl shadow-lg p-6 text-white"
        style={{ background: gradients.suppliers }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Truck size={32} />
              </div>
              Gestión de Proveedores
            </h1>
            <p className="text-orange-100 ml-14">Administra tus proveedores y contactos</p>
            <div className="flex items-center gap-4 mt-3 ml-14">
              <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-semibold">{suppliers.length} Proveedores</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Plus size={20} />
            Nuevo Proveedor
          </button>
        </div>
      </div>

      {suppliers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="text-gray-400" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No hay proveedores</h3>
          <p className="text-gray-600 mb-6">Comienza agregando tu primer proveedor</p>
          <button
            onClick={handleAdd}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Crear Primer Proveedor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 border-b border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Truck className="text-orange-600" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg truncate">{supplier.name}</h3>
                    {supplier.contact_name && (
                      <p className="text-sm text-gray-600 mt-1 truncate">{supplier.contact_name}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {supplier.email && (
                  <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg">
                    <Mail size={16} className="text-blue-500 flex-shrink-0" />
                    <span className="truncate font-medium">{supplier.email}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg">
                    <Phone size={16} className="text-green-500 flex-shrink-0" />
                    <span className="font-medium">{supplier.phone}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg">
                    <MapPin size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2 font-medium">{supplier.address}</span>
                  </div>
                )}
              </div>

              <div className="p-4 flex gap-2">
                <button
                  onClick={() => handleEdit(supplier)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  <Edit size={16} />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Truck size={28} />
                {selectedSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              <p className="text-orange-100 mt-1">
                {selectedSupplier ? 'Actualiza la información del proveedor' : 'Completa los datos del nuevo proveedor'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Ej: Distribuidora Médica"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Persona de Contacto
                </label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Nombre del contacto"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="809-000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dirección
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                  rows="3"
                  placeholder="Dirección completa"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl"
                >
                  {selectedSupplier ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
