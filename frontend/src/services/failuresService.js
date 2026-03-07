import api from './api';

export const failuresService = {
  // Obtener todas las fallas con filtros
  getFailures: async (params = {}) => {
    const response = await api.get('/failures', { params });
    return response.data;
  },

  // Obtener resumen de fallas
  getSummary: async (days = 30) => {
    const response = await api.get('/failures/summary', { params: { days } });
    return response.data;
  },

  // Obtener fallas críticas
  getCriticalFailures: async (limit = 10) => {
    const response = await api.get('/failures/critical', { params: { limit } });
    return response.data;
  },

  // Obtener tendencias de fallas
  getTrends: async (days = 7) => {
    const response = await api.get('/failures/trends', { params: { days } });
    return response.data;
  },

  // Obtener una falla específica
  getFailure: async (id) => {
    const response = await api.get(`/failures/${id}`);
    return response.data;
  },

  // Crear una nueva falla
  createFailure: async (failureData) => {
    const response = await api.post('/failures', failureData);
    return response.data;
  },

  // Actualizar una falla (marcar como resuelta)
  updateFailure: async (id, updateData) => {
    const response = await api.put(`/failures/${id}`, updateData);
    return response.data;
  },

  // Marcar falla como resuelta
  resolveFailure: async (id, resolutionNotes = '') => {
    const response = await api.put(`/failures/${id}`, {
      is_resolved: true,
      resolution_notes: resolutionNotes
    });
    return response.data;
  },

  // Eliminar una falla
  deleteFailure: async (id) => {
    const response = await api.delete(`/failures/${id}`);
    return response.data;
  },

  // Registrar excepción HTTP
  logHttpException: async (errorData) => {
    const response = await api.post('/failures/log/http-exception', errorData);
    return response.data;
  }
};
