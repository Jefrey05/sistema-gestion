import axios from 'axios';

export const authService = {
  async login(username, password) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await axios.post('http://localhost:8000/api/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  async register(userData) {
    const response = await axios.post('http://localhost:8000/api/auth/register', userData);
    return response.data;
  },

  async getCurrentUser(token) {
    const response = await axios.get('http://localhost:8000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('token');
  }
};
