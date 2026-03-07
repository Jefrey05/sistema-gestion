import api from './api';

export const salesService = {
  // Obtener todas las ventas
  getSales: async (params = {}) => {
    const response = await api.get('/sales', { params });
    return response.data;
  },

  // Obtener una venta por ID
  getSale: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  // Crear una nueva venta
  createSale: async (saleData) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },

  // Actualizar una venta
  updateSale: async (id, saleData) => {
    const response = await api.put(`/sales/${id}`, saleData);
    return response.data;
  },

  // Registrar un pago
  createPayment: async (paymentData) => {
    const response = await api.post('/sales/payments', paymentData);
    return response.data;
  },

  // Obtener reporte de ventas
  getSalesReport: async (startDate, endDate) => {
    const response = await api.get('/sales/reports/summary', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  // Actualizar estado de una venta
  updateSaleStatus: async (saleId, status, paidAmount = null) => {
    const response = await api.patch(`/sales/${saleId}/status`, {
      status,
      paid_amount: paidAmount
    });
    return response.data;
  }
};
