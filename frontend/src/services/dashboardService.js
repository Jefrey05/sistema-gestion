import api from './api';

export const dashboardService = {
  // Obtener estadísticas del dashboard
  getStats: async (startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await api.get('/dashboard/stats', { params });
    return response.data;
  },

  // Obtener datos del gráfico de ventas
  getSalesChart: async (days = 30, startDate = null, endDate = null) => {
    const params = { days };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get('/dashboard/sales-chart', { params });
    return response.data;
  },

  // Obtener datos del gráfico de ventas con fechas específicas
  getSalesChartWithDates: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    // Agregar un día a endDate para incluir el día completo
    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setDate(endDateObj.getDate() + 1);
      params.end_date = endDateObj.toISOString().split('T')[0];
    }
    const response = await api.get('/dashboard/sales-chart', { params });
    return response.data;
  },

  // Obtener datos del gráfico de alquileres
  getRentalsChart: async (days = 30, startDate = null, endDate = null) => {
    const params = { days };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get('/dashboard/rentals-chart', { params });
    return response.data;
  },

  // Obtener datos del gráfico de alquileres con fechas específicas
  getRentalsChartWithDates: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    // Agregar un día a endDate para incluir el día completo
    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setDate(endDateObj.getDate() + 1);
      params.end_date = endDateObj.toISOString().split('T')[0];
    }
    const response = await api.get('/dashboard/rentals-chart', { params });
    return response.data;
  },

  // Obtener productos más vendidos
  getTopProducts: async (limit = 10) => {
    const response = await api.get('/dashboard/top-products', { params: { limit } });
    return response.data;
  },

  // Obtener mejores clientes
  getTopClients: async (limit = 10) => {
    const response = await api.get('/dashboard/top-clients', { params: { limit } });
    return response.data;
  },

  // Obtener actividades recientes
  getRecentActivities: async (limit = 20) => {
    const response = await api.get('/dashboard/recent-activities', { params: { limit } });
    return response.data;
  },

  // Obtener estadísticas de la organización
  getOrganizationStats: async () => {
    const response = await api.get('/organizations/stats');
    return response.data;
  },

  // Configuraciones del Dashboard
  getDashboardSettings: async () => {
    const response = await api.get('/organizations/me/dashboard-settings');
    return response.data;
  },

  updateDashboardSettings: async (settings) => {
    const response = await api.put('/organizations/me/dashboard-settings', settings);
    return response.data;
  },

  // Resetear todos los datos de la organización
  resetOrganizationData: async () => {
    const response = await api.delete('/organizations/me/reset-data');
    return response.data;
  },

  // Subir logo de la organización
  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/organizations/me/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Eliminar logo de la organización
  deleteLogo: async () => {
    const response = await api.delete('/organizations/me/logo');
    return response.data;
  }
};
