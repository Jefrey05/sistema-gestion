import api from './api';

export const productsService = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/products', { params });
    return response.data;
  },

  getProducts: async (params = {}) => {
    const response = await api.get('/api/products', { params });
    return response.data;
  },

  getProduct: async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/api/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  },

  // Obtener productos disponibles para alquiler
  getAvailableForRental: async () => {
    const response = await api.get('/api/products', {
      params: { product_type: ['alquiler', 'ambos'], stock_available_gt: 0 }
    });
    return response.data;
  },

  // Obtener productos disponibles para venta
  getAvailableForSale: async () => {
    const response = await api.get('/api/products', {
      params: { product_type: ['venta', 'ambos'], stock_available_gt: 0 }
    });
    return response.data;
  }
};

export default productsService;