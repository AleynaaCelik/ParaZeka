// src/services/authService.js
import axios from 'axios';
import { API_URL } from '../config';

// API istekleri için yardımcı fonksiyon
const API = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// İstek interceptor'ü - token ekleme
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth servis fonksiyonları
const authService = {
  login: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
      
      // Başarılı yanıt, token'ı saklayın
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('isAuthenticated', 'true');
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.setItem('isAuthenticated', 'false');
  },
  
  getCurrentUser: async () => {
    try {
      const response = await API.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
  
  // Geliştirme ortamında kullanılabilecek mock login fonksiyonu
  mockLogin: (credentials) => {
    if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
      localStorage.setItem('authToken', 'mock-jwt-token');
      localStorage.setItem('isAuthenticated', 'true');
      return { success: true, user: { name: 'Demo User', email: 'demo@example.com' } };
    } else {
      throw new Error('Invalid credentials');
    }
  }
};

export default authService;