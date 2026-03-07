import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set) => ({
  user: null,
  token: authService.getToken(),
  isAuthenticated: !!authService.getToken(),
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(username, password);
      const user = await authService.getCurrentUser(data.access_token);
      set({ 
        user, 
        token: data.access_token, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Error al iniciar sesión', 
        isLoading: false 
      });
      return false;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(userData);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Error al registrarse', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = authService.getToken();
    if (token) {
      try {
        const user = await authService.getCurrentUser(token);
        set({ user, isAuthenticated: true });
      } catch (error) {
        authService.logout();
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  }
}));
