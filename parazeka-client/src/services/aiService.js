import axios from 'axios';
import { API_URL } from '../config';
import apiCache from './apiCache';

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

// Geliştirme için örnek veriler
const mockInsights = [
  {
    id: '1',
    title: 'Bütçe Uyarısı',
    description: 'Bu ay gelirinizin %75\'ini harcadınız.',
    type: 'BudgetAlert',
    severity: 'Medium',
    isAIGenerated: true
  },
  {
    id: '2',
    title: 'Tasarruf Önerisi',
    description: 'Market harcamalarınız geçen aya göre %15 arttı.',
    type: 'SavingOpportunity',
    severity: 'Low',
    isAIGenerated: true
  },
  {
    id: '3',
    title: 'Harcama Analizi',
    description: 'Elektrik faturanız ortalama değerlerden %20 daha yüksek.',
    type: 'SpendingPattern',
    severity: 'High',
    isAIGenerated: true
  }
];

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
      // Hata durumunda örnek veri döndürür
      console.log('Örnek finansal öngörüler kullanılıyor...');
      return mockInsights;
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
      // Örnek tahmin verisi
      return 2500 + (monthsAhead * 100);
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
      
      // Soru içeriğine göre örnek yanıtlar
      let answer = 'Bu soruyu şu anda yanıtlayamıyorum. Lütfen daha sonra tekrar deneyin.';
      
      if (question.toLowerCase().includes('tasarruf')) {
        answer = 'Tasarruf yapmak için gelirinizin %20\'sini düzenli olarak bir kenara ayırmayı ve acil durum fonu oluşturmayı düşünebilirsiniz.';
      } else if (question.toLowerCase().includes('bütçe')) {
        answer = '50-30-20 bütçe kuralını uygulayabilirsiniz: Gelirinizin %50\'si zorunlu harcamalara, %30\'u isteklere ve %20\'si tasarrufa ayrılmalıdır.';
      } else if (question.toLowerCase().includes('yatırım')) {
        answer = 'Yatırımlarınızı çeşitlendirmek riski azaltır. Hisse senetleri, tahviller ve düşük maliyetli endeks fonları arasında dağılım yapabilirsiniz.';
      }
      
      return { answer };
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
      
      // İşlem tutarı 1000 TL'den fazlaysa anormal kabul et
      const isAnomaly = transaction.amount > 1000;
      return { isAnomaly };
    }
  }
};

export default aiService;