import api from './api';

export const rentalsService = {
  // Obtener todos los alquileres
  getRentals: async (params = {}) => {
    const response = await api.get('/rentals', { params });
    return response.data;
  },

  // Obtener un alquiler por ID
  getRental: async (id) => {
    const response = await api.get(`/rentals/${id}`);
    return response.data;
  },

  // Crear un nuevo alquiler
  createRental: async (rentalData) => {
    const response = await api.post('/rentals/', rentalData);
    return response.data;
  },

  // Actualizar un alquiler
  updateRental: async (id, rentalData) => {
    const response = await api.put(`/rentals/${id}`, rentalData);
    return response.data;
  },

  // Obtener historial de alquileres de un producto
  getProductHistory: async (productId) => {
    const response = await api.get(`/rentals/product/${productId}/history`);
    return response.data;
  },

  // Obtener historial de alquileres de un cliente
  getClientHistory: async (clientId) => {
    const response = await api.get(`/rentals/client/${clientId}/history`);
    return response.data;
  },

  // Verificar alquileres vencidos
  checkOverdue: async () => {
    const response = await api.post('/rentals/check-overdue');
    return response.data;
  },

  // Obtener reporte de alquileres activos
  getActiveReport: async () => {
    const response = await api.get('/rentals/reports/active');
    return response.data;
  },

  // Agregar pago a un alquiler
  addPayment: async (rentalId, paymentData) => {
    const response = await api.post(`/rentals/${rentalId}/payments`, paymentData);
    return response.data;
  },

  // Actualizar estado de alquileres vencidos
  updateRentalStatuses: async () => {
    const response = await api.post('/rentals/update-status');
    return response.data;
  },

  // Cancelar un alquiler
  cancelRental: async (rentalId) => {
    const response = await api.post(`/rentals/${rentalId}/cancel`);
    return response.data;
  }
};
