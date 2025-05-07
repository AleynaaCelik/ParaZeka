// src/services/apiService.js
import axios from 'axios';
import apiCache from './apiCache';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.financetracker.com/api';

// Axios instance oluştur
const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// İstek interceptor - token ekleme
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

// Cevap interceptor - hata yönetimi ve token yenileme
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Token geçersiz (401) ve yenileme denememiş ise
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Token yenileme endpoint'i
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
          withCredentials: true
        });
        
        const newToken = response.data.token;
        
        // Yeni token'ı sakla
        localStorage.setItem('authToken', newToken);
        
        // Orijinal isteği güncelle ve tekrar dene
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        // Token yenileme başarısız, oturum sonlandırma
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
        
        // Kullanıcıyı login sayfasına yönlendir
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Diğer tüm hatalar için
    return Promise.reject(error);
  }
);

// API istekleri
const apiService = {
  // Kullanıcı işlemleri
  auth: {
    login: async (credentials) => {
      const response = await API.post('/auth/login', credentials);
      return response.data;
    },
    
    register: async (userData) => {
      const response = await API.post('/auth/register', userData);
      return response.data;
    },
    
    logout: async () => {
      const response = await API.post('/auth/logout');
      localStorage.removeItem('authToken');
      localStorage.removeItem('isAuthenticated');
      return response.data;
    },
    
    getCurrentUser: async () => {
      const cacheKey = apiCache.generateKey('/auth/me');
      const cachedData = apiCache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      const response = await API.get('/auth/me');
      apiCache.set(cacheKey, response.data, 5 * 60 * 1000); // 5 dakika cache
      
      return response.data;
    }
  },
  
  // İşlem (transaction) işlemleri
  transactions: {
    getAll: async (params = {}) => {
      const queryParams = new URLSearchParams();
      
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber);
      if (params.pageSize) queryParams.append('pageSize', params.pageSize);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params.toDate) queryParams.append('toDate', params.toDate);
      if (params.type) queryParams.append('type', params.type);
      if (params.categoryId) queryParams.append('categoryId', params.categoryId);
      if (params.accountId) queryParams.append('accountId', params.accountId);
      if (params.minAmount) queryParams.append('minAmount', params.minAmount);
      if (params.maxAmount) queryParams.append('maxAmount', params.maxAmount);
      if (params.search) queryParams.append('search', params.search);
      
      const url = `/transactions?${queryParams.toString()}`;
      const cacheKey = apiCache.generateKey(url);
      const cachedData = apiCache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      const response = await API.get(url);
      apiCache.set(cacheKey, response.data, 3 * 60 * 1000); // 3 dakika cache
      
      return response.data;
    },
    
    getById: async (id) => {
      const cacheKey = apiCache.generateKey(`/transactions/${id}`);
      const cachedData = apiCache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      const response = await API.get(`/transactions/${id}`);
      apiCache.set(cacheKey, response.data, 5 * 60 * 1000);
      
      return response.data;
    },
    
    create: async (transactionData) => {
      const response = await API.post('/transactions', transactionData);
      
      // İlgili cache'leri temizle
      apiCache.remove(apiCache.generateKey('/transactions'));
      
      return response.data;
    },
    
    update: async (id, transactionData) => {
      const response = await API.put(`/transactions/${id}`, transactionData);
      
      // İlgili cache'leri temizle
      apiCache.remove(apiCache.generateKey('/transactions'));
      apiCache.remove(apiCache.generateKey(`/transactions/${id}`));
      
      return response.data;
    },
    
    delete: async (id) => {
      const response = await API.delete(`/transactions/${id}`);
      
      // İlgili cache'leri temizle
      apiCache.remove(apiCache.generateKey('/transactions'));
      apiCache.remove(apiCache.generateKey(`/transactions/${id}`));
      
      return response.data;
    },
    
    importCSV: async (formData) => {
      const response = await API.post('/transactions/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Cache'leri temizle
      apiCache.remove(apiCache.generateKey('/transactions'));
      
      return response.data;
    },
    
    exportCSV: async (params = {}) => {
      const queryParams = new URLSearchParams();
      
      if (params.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params.toDate) queryParams.append('toDate', params.toDate);
      if (params.type) queryParams.append('type', params.type);
      if (params.categoryId) queryParams.append('categoryId', params.categoryId);
      
      const url = `/transactions/export?${queryParams.toString()}`;
      
      const response = await API.get(url, {
        responseType: 'blob'
      });
      
      return response.data;
    }
  },
  
  // Hesap (account) işlemleri
  accounts: {
    getAll: async () => {
      const cacheKey = apiCache.generateKey('/accounts');
      const cachedData = apiCache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      const response = await API.get('/accounts');
      apiCache.set(cacheKey, response.data, 5 * 60 * 1000);
      
      return response.data;
    },
    
    getById: async (id) => {
      const cacheKey = apiCache.generateKey(`/accounts/${id}`);
      const cachedData = apiCache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      const response = await API.get(`/accounts/${id}`);
      apiCache.set(cacheKey, response.data, 5 * 60 * 1000);
      
      return response.data;
    },
    
    create: async (accountData) => {
      const response = await API.post('/accounts', accountData);
      
      // Cache'leri temizle
      apiCache.remove(apiCache.generateKey('/accounts'));
      
      return response.data;
    },
    
    update: async (id, accountData) => {
      const response = await API.put(`/accounts/${id}`, accountData);
      
      // Cache'leri temizle
      apiCache.remove(apiCache.generateKey('/accounts'));
      apiCache.remove(apiCache.generateKey(`/accounts/${id}`));
      
      return response.data;
    },
    
    delete: async (id) => {
      const response = await API.delete(`/accounts/${id}`);
      
      // Cache'leri temizle
      apiCache.remove(apiCache.generateKey('/accounts'));
      apiCache.remove(apiCache.generateKey(`/accounts/${id}`));
      
      return response.data;
    }
  },
  
  // Kategori işlemleri
  categories: {
    getAll: async () => {
      const cacheKey = apiCache.generateKey('/categories');
      const cachedData = apiCache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      const response = await API.get('/categories');
      apiCache.set(cacheKey, response.data, 10 * 60 * 1000); // 10 dakika cache
      
      return response.data;
    },
    
    create: async (categoryData) => {
      const response = await API.post('/categories', categoryData);
      
      // Cache'leri temizle
      apiCache.remove(apiCache.generateKey('/categories'));
      
      return response.data;
    },
    
    update: async (id, categoryData) => {
      const response = await API.put(`/categories/${id}`, categoryData);
      
      // Cache'leri temizle
      apiCache.remove(apiCache.generateKey('/categories'));
      
      return response.data;
    },
    
    delete: async (id) => {
      const response = await API.delete(`/categories/${id}`);
      
      // Cache'leri temizle
      apiCache.remove(apiCache.generateKey('/categories'));
      
      return response.data;
    }
  },
  
  // Bütçe işlemleri
  budgets: {
    getAll: async () => {
      const cacheKey = apiCache.generateKey('/budgets');
      const cachedData = apiCache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      const response = await API.get('/budgets');
      apiCache.set(cacheKey, response.data, 5 * 60 * 1000);
      
      return response.data;
    },
    
    getById: async (id) => {
      const cacheKey = apiCache.generateKey(`/budgets/${id}`);
      const cachedData = apiCache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      const response = await API.get(`/budgets/${id}`);
      apiCache.set(cacheKey, response.data, 5 * 60 * 1000);
      
      return response.data;
    },
    
    create: async (budgetData) => {
      const response = await API.post('/budgets', budgetData);
      
      // Cache'leri temizle
      apiCache.remove(apiCache.generateKey('/budgets'));
      
      return response.data;
    },
    
    update: async (id, budgetData) => {
      const response = await API.put(`/budgets/${id}`, budgetData);
      
      // Cache'leri temizle
      apiCache.remove(apiCache.generateKey('/budgets'));
      apiCache.remove(apiCache.generateKey(`/budgets/${id}`));
      
      return response.data;
    },
    
    delete: async (id) => {
      const response = await API.delete(`/budgets/${id}`);
      
      // Cache'leri temizle
      apiCache.remove(apiCache.generateKey('/budgets'));
      apiCache.remove(apiCache.generateKey(`/budgets/${id}`));
      
      return response.data;
    }
  },
  
  // Raporlama işlemleri
  reports: {
    getMonthlyReport: async (year, month) => {
      const cacheKey = apiCache.generateKey(`/reports/monthly/${year}/${month}`);
      const cachedData = apiCache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      const response = await API.get(`/reports/monthly/${year}/${month}`);
      apiCache.set(cacheKey, response.data, 10 * 60 * 1000);
      
      return response.data;
    },
    
    getYearlyReport: async (year) => {
      const cacheKey = apiCache.generateKey(`/reports/yearly/${year}`);
      const cachedData = apiCache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      const response = await API.get(`/reports/yearly/${year}`);
      apiCache.set(cacheKey, response.data, 10 * 60 * 1000);
      
      return response.data;
    },
    
    getCategoryReport: async (params = {}) => {
      const queryParams = new URLSearchParams();
      
      if (params.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params.toDate) queryParams.append('toDate', params.toDate);
      if (params.type) queryParams.append('type', params.type);
      
      const url = `/reports/category?${queryParams.toString()}`;
      const cacheKey = apiCache.generateKey(url);
      const cachedData = apiCache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      const response = await API.get(url);
      apiCache.set(cacheKey, response.data, 10 * 60 * 1000);
      
      return response.data;
    }
  },
  
  // Önbelleği temizleme
  clearCache: () => {
    apiCache.clear();
  }
};

export default apiService;