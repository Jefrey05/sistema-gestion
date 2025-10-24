import api from './api';

export const notificationsService = {
  // Obtener todas las notificaciones
  async getNotifications(skip = 0, limit = 100) {
    const response = await api.get(`/notifications?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Obtener el número de notificaciones no leídas
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Obtener una notificación específica
  async getNotification(notificationId) {
    const response = await api.get(`/notifications/${notificationId}`);
    return response.data;
  },

  // Crear una nueva notificación
  async createNotification(notification) {
    const response = await api.post('/notifications', notification);
    return response.data;
  },

  // Actualizar una notificación
  async updateNotification(notificationId, updates) {
    const response = await api.put(`/notifications/${notificationId}`, updates);
    return response.data;
  },

  // Marcar una notificación como leída
  async markAsRead(notificationId) {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Marcar todas las notificaciones como leídas
  async markAllAsRead() {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },

  // Eliminar una notificación
  async deleteNotification(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Generar notificaciones de prueba
  async generateTestNotifications() {
    const response = await api.post('/notifications/generate-test');
    return response.data;
  }
};

export default notificationsService;
