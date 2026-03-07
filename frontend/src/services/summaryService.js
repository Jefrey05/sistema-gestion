import api from './api';

const summaryService = {
  // Obtener resumen completo del negocio
  async getBusinessOverview(startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await api.get('/summary/business-overview', { params });
    return response.data;
  }
};

export { summaryService };
export default summaryService;