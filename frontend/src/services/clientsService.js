import api from './api';

export const clientsService = {
  // Obtener todos los clientes
  getClients: async (params = {}) => {
    const response = await api.get('/clients', { params });
    return response.data;
  },

  // Obtener un cliente por ID
  getClient: async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  // Obtener estadísticas de un cliente
  getClientStats: async (id) => {
    const response = await api.get(`/clients/${id}/stats`);
    return response.data;
  },

  // Crear un nuevo cliente
  createClient: async (clientData) => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  // Actualizar un cliente
  updateClient: async (id, clientData) => {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },

  // Eliminar un cliente
  deleteClient: async (id) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },

  // Buscar clientes
  searchClients: async (search) => {
    const response = await api.get('/clients', { params: { search } });
    return response.data;
  }
};
