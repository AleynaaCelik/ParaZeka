// src/services/apiCache.js
class ApiCache {
    constructor() {
      this.cache = new Map();
      this.defaultTTL = 5 * 60 * 1000; // 5 dakika
    }
  
    set(key, value, ttl = this.defaultTTL) {
      const now = Date.now();
      const expiry = now + ttl;
      
      this.cache.set(key, {
        value,
        expiry
      });
    }
  
    get(key) {
      const item = this.cache.get(key);
      
      if (!item) {
        return null;
      }
      
      const now = Date.now();
      
      if (now > item.expiry) {
        this.cache.delete(key);
        return null;
      }
      
      return item.value;
    }
  
    clear() {
      this.cache.clear();
    }
  
    remove(key) {
      this.cache.delete(key);
    }
  
    // Önbellek anahtarı oluşturucu
    generateKey(endpoint, params = {}) {
      const baseKey = endpoint;
      const paramsString = Object.keys(params)
        .sort()
        .map(key => `${key}=${JSON.stringify(params[key])}`)
        .join('&');
      
      return paramsString ? `${baseKey}?${paramsString}` : baseKey;
    }
  }
  
  // Singleton instance
  const apiCache = new ApiCache();
  export default apiCache;