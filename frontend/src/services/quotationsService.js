import api from './api';

export const quotationsService = {
  // Obtener todas las cotizaciones
  getQuotations: async (params = {}) => {
    const response = await api.get('/quotations', { params });
    return response.data;
  },

  // Obtener una cotización por ID
  getQuotation: async (id) => {
    const response = await api.get(`/quotations/${id}`);
    return response.data;
  },

  // Crear una nueva cotización
  createQuotation: async (quotationData) => {
    const response = await api.post('/quotations', quotationData);
    return response.data;
  },

  // Actualizar una cotización
  updateQuotation: async (id, quotationData) => {
    const response = await api.put(`/quotations/${id}`, quotationData);
    return response.data;
  },

  // Cambiar estado de una cotización
  updateQuotationStatus: async (id, status) => {
    const response = await api.put(`/quotations/${id}/status`, null, {
      params: { status: status }
    });
    return response.data;
  },

  // Eliminar una cotización
  deleteQuotation: async (id) => {
    const response = await api.delete(`/quotations/${id}`);
    return response.data;
  },

  // Convertir cotización a venta
  convertToSale: async (id, paymentMethod) => {
    const response = await api.post(`/quotations/${id}/convert-to-sale`, null, {
      params: { payment_method: paymentMethod }
    });
    return response.data;
  },

  // Convertir cotización a alquiler
  convertToRental: async (id, rentalData) => {
    const response = await api.post(`/quotations/${id}/convert-to-rental`, rentalData);
    return response.data;
  },

  // Verificar cotizaciones vencidas
  checkExpired: async () => {
    const response = await api.post('/quotations/check-expired');
    return response.data;
  },

  // Verificar si una cotización puede ser editada
  canEdit: async (id) => {
    const response = await api.get(`/quotations/${id}/can-edit`);
    return response.data;
  }
};
