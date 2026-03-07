import api from './api';

export const organizationsService = {
  // Obtener la organización actual del usuario
  getCurrentOrganization: async () => {
    const response = await api.get('/organizations/current');
    return response.data;
  },

  // Actualizar configuración de módulos
  updateModules: async (modules) => {
    const response = await api.put('/organizations/modules', { modules_enabled: modules });
    return response.data;
  },

  // Actualizar configuración general de la organización
  updateSettings: async (settings) => {
    const response = await api.put('/organizations/settings', settings);
    return response.data;
  },

  // Subir logo de la organización
  uploadLogo: async (logoFile) => {
    const formData = new FormData();
    formData.append('logo', logoFile);
    
    const response = await api.post('/organizations/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Eliminar logo de la organización
  deleteLogo: async () => {
    const response = await api.delete('/organizations/logo');
    return response.data;
  },

  // Obtener estadísticas de la organización
  getStats: async () => {
    const response = await api.get('/organizations/stats');
    return response.data;
  }
};


