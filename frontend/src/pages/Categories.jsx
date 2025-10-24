import { useEffect, useState } from 'react';
import { inventoryService } from '../services/inventoryService';
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';
import { useOrganizationColors } from '../hooks/useOrganizationColors';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { showSuccess, showError } = useNotification();
  const { gradients } = useOrganizationColors();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando categorías...');
      const data = await inventoryService.getCategories();
      console.log('✅ Categorías recibidas:', data);
      setCategories(data || []);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
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
      if (selectedCategory) {
        await inventoryService.updateCategory(selectedCategory.id, formData);
        showSuccess('Categoría actualizada exitosamente');
      } else {
        await inventoryService.createCategory(formData);
        showSuccess('Categoría creada exitosamente');
      }
      setShowModal(false);
      setFormData({ name: '', description: '' });
      setSelectedCategory(null);
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      showError(error.response?.data?.detail || 'Error al guardar la categoría');
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await inventoryService.deleteCategory(id);
        showSuccess('Categoría eliminada exitosamente');
        loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        showError(error.response?.data?.detail || 'Error al eliminar la categoría');
      }
    }
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setFormData({ name: '', description: '' });
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
        style={{ background: gradients.categories }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <FolderTree size={32} />
              </div>
              Gestión de Categorías
            </h1>
            <p className="text-purple-100 ml-14">Organiza tus productos por categorías</p>
            <div className="flex items-center gap-4 mt-3 ml-14">
              <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-semibold">{categories.length} Categorías</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Plus size={20} />
            Nueva Categoría
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderTree className="text-gray-400" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No hay categorías</h3>
          <p className="text-gray-600 mb-6">Comienza agregando tu primera categoría</p>
          <button
            onClick={handleAdd}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Crear Primera Categoría
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <FolderTree className="text-purple-600" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg truncate">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{category.description}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  <Edit size={16} />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
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
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <FolderTree size={28} />
                {selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <p className="text-purple-100 mt-1">
                {selectedCategory ? 'Actualiza la información de la categoría' : 'Completa los datos de la nueva categoría'}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Ej: Equipos Médicos"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  rows="3"
                  placeholder="Descripción opcional de la categoría"
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                >
                  {selectedCategory ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
