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

// Hata interceptor'ü
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.setItem('isAuthenticated', 'false');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * AI ile ilgili servisleri içeren modül
 */
const aiService = {
  /**
   * Kullanıcı için AI tarafından oluşturulan finansal öngörüleri getirir
   * @returns {Promise<Array>} Finansal öngörüler listesi
   */
  getInsights: async () => {
    try {
      const response = await API.get('/ai/insights');
      return response.data;
    } catch (error) {
      console.error('Finansal öngörüler alınırken hata:', error);
      throw error;
    }
  },

  /**
   * Gelecek aylar için harcama tahmini yapar
   * @param {number} monthsAhead Kaç ay sonrası için tahmin yapılacak
   * @returns {Promise<number>} Tahmini harcama tutarı
   */
  getMonthlyForecast: async (monthsAhead = 1) => {
    try {
      const response = await API.get(`/ai/monthly-forecast?monthsAhead=${monthsAhead}`);
      return response.data;
    } catch (error) {
      console.error('Aylık tahmin alınırken hata:', error);
      throw error;
    }
  },

  /**
   * Kullanıcının finansal sorusuna AI tarafından cevap verir
   * @param {string} question Kullanıcının sorusu
   * @returns {Promise<Object>} AI yanıtı
   */
  askFinancialQuestion: async (question) => {
    try {
      const response = await API.post('/ai/ask', { question });
      return response.data;
    } catch (error) {
      console.error('Finansal soru cevaplanırken hata:', error);
      throw error;
    }
  },

  /**
   * İşlemin anormal olup olmadığını AI ile kontrol eder
   * @param {Object} transaction İşlem bilgileri
   * @returns {Promise<Object>} Anomali sonucu
   */
  detectAnomaly: async (transaction) => {
    try {
      const response = await API.post('/ai/detect-anomaly', transaction);
      return response.data;
    } catch (error) {
      console.error('Anomali kontrolü sırasında hata:', error);
      throw error;
    }
  }
};

export default aiService;