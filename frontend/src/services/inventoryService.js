import api from './api';

export const inventoryService = {
  // Products
  async getProducts(search = '') {
    const params = search ? { search } : {};
    const response = await api.get('/products', { params });
    return response.data;
  },

  async getProduct(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async createProduct(productData) {
    const response = await api.post('/products', productData);
    return response.data;
  },

  async updateProduct(id, productData) {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  async getLowStockProducts() {
    const response = await api.get('/products/low-stock');
    return response.data;
  },

  // Categories
  async getCategories() {
    const response = await api.get('/categories');
    return response.data;
  },

  async createCategory(categoryData) {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  async updateCategory(id, categoryData) {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  async deleteCategory(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Suppliers
  async getSuppliers() {
    const response = await api.get('/suppliers');
    return response.data;
  },

  async createSupplier(supplierData) {
    const response = await api.post('/suppliers', supplierData);
    return response.data;
  },

  async updateSupplier(id, supplierData) {
    const response = await api.put(`/suppliers/${id}`, supplierData);
    return response.data;
  },

  async deleteSupplier(id) {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  },

  // Inventory Movements
  async getMovements(productId = null) {
    const params = productId ? { product_id: productId } : {};
    const response = await api.get('/inventory/movements', { params });
    return response.data;
  },

  async createMovement(movementData) {
    const response = await api.post('/inventory/movements', movementData);
    return response.data;
  },

  // Dashboard
  async getDashboardStats() {
    const response = await api.get('/inventory/dashboard');
    return response.data;
  }
};
