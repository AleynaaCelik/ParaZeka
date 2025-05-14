// src/components/Categories/CategoryManager.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, Edit, Trash2, Search, FolderPlus, ArrowUpCircle, 
  ArrowDownCircle, BarChart3, Tag, AlertCircle, RefreshCw 
} from 'lucide-react';
import CategoryForm from './CategoryForm';
import './CategoryManager.css';

const CategoryManager = ({ apiService }) => {
  // Ana state'ler
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // İstatistik state'leri
  const [categoryStats, setCategoryStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Form state'leri
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Filtreleme ve sıralama state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Veri yükleme fonksiyonları
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.categories.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Kategoriler yüklenirken hata:', err);
      setError('Kategoriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  const fetchCategoryStats = useCallback(async () => {
    setStatsLoading(true);
    
    try {
      // Son 6 ay için kategori istatistiklerini al
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      
      const stats = await apiService.reports.getCategoryReport({
        fromDate: sixMonthsAgo.toISOString().split('T')[0],
        toDate: now.toISOString().split('T')[0]
      });
      
      setCategoryStats(stats);
    } catch (err) {
      console.error('Kategori istatistikleri yüklenirken hata:', err);
      // İstatistik yüklenemezse kullanıcı deneyimini bozmamak için sessizce geçiyoruz
    } finally {
      setStatsLoading(false);
    }
  }, [apiService]);

  // İlk yükleme
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCategories(), fetchCategoryStats()]);
    };
    
    loadData();
  }, [fetchCategories, fetchCategoryStats]);

  // Filtrelenmiş ve sıralanmış kategorileri hesapla
  const filteredCategories = useMemo(() => {
    let result = [...categories];
    
    // Arama filtresi
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(category =>
        category.name.toLowerCase().includes(searchTermLower) ||
        (category.description && category.description.toLowerCase().includes(searchTermLower))
      );
    }
    
    // Tür filtresi
    if (selectedType !== 'all') {
      result = result.filter(category => category.type === selectedType);
    }
    
    // Sıralama
    result.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'usage':
          aValue = a.transactionCount || 0;
          bValue = b.transactionCount || 0;
          break;
        case 'amount':
          aValue = a.totalAmount || 0;
          bValue = b.totalAmount || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return result;
  }, [categories, searchTerm, selectedType, sortBy, sortDirection]);

  // İstatistik verileri hesapla
  const stats = useMemo(() => {
    return {
      total: categories.length,
      income: categories.filter(c => c.type === 'Income').length,
      expense: categories.filter(c => c.type === 'Expense').length,
      mostUsed: categories.length > 0 
        ? categories.reduce((prev, current) => 
            (prev.transactionCount || 0) > (current.transactionCount || 0) ? prev : current, 
            categories[0]
          )
        : null,
      activeThisMonth: categories.filter(c => 
        c.lastUsed && new Date(c.lastUsed).getMonth() === new Date().getMonth()
      ).length
    };
  }, [categories]);

  // Event handler'lar
  const handleAddCategory = useCallback(() => {
    setEditingCategory(null);
    setShowForm(true);
  }, []);

  const handleEditCategory = useCallback((category) => {
    setEditingCategory(category);
    setShowForm(true);
  }, []);

  const handleDeleteCategory = useCallback(async (categoryId) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      await apiService.categories.delete(categoryId);
      await fetchCategories();
      await fetchCategoryStats();
    } catch (err) {
      console.error('Kategori silinirken hata:', err);
      alert('Kategori silinemedi. Bu kategoriye ait işlemler olabilir.');
    }
  }, [apiService, fetchCategories, fetchCategoryStats]);

  const handleFormSubmit = useCallback(async (categoryData) => {
    try {
      if (editingCategory) {
        await apiService.categories.update(editingCategory.id, categoryData);
      } else {
        await apiService.categories.create(categoryData);
      }
      
      setShowForm(false);
      await fetchCategories();
      await fetchCategoryStats();
      return true;
    } catch (err) {
      console.error('Kategori kaydedilirken hata:', err);
      throw err;
    }
  }, [apiService, editingCategory, fetchCategories, fetchCategoryStats]);

  const handleToggleSortDirection = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  // Render fonksiyonları
  const renderStatCards = () => (
    <div className="category-stats">
      <div className="stat-card">
        <div className="stat-header">
          <h3>Toplam Kategori</h3>
          <FolderPlus size={20} />
        </div>
        <div className="stat-value">{stats.total}</div>
        <div className="stat-details">
          <span className="income">{stats.income} Gelir</span>
          <span className="expense">{stats.expense} Gider</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-header">
          <h3>En Çok Kullanılan</h3>
          <BarChart3 size={20} />
        </div>
        <div className="stat-value">{stats.mostUsed?.name || 'N/A'}</div>
        <div className="stat-details">
          <span>{stats.mostUsed?.transactionCount || 0} işlem</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-header">
          <h3>Bu Ay Kullanılan</h3>
          <Tag size={20} />
        </div>
        <div className="stat-value">{stats.activeThisMonth}</div>
        <div className="stat-details">
          <span>aktif kategori</span>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="category-filters">
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Kategori ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="filter-group">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="filter-select"
          aria-label="Kategori türüne göre filtrele"
        >
          <option value="all">Tüm Kategoriler</option>
          <option value="Income">Gelir Kategorileri</option>
          <option value="Expense">Gider Kategorileri</option>
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
          aria-label="Sıralama kriteri"
        >
          <option value="name">İsme Göre</option>
          <option value="usage">Kullanıma Göre</option>
          <option value="amount">Tutara Göre</option>
        </select>
        
        <button
          onClick={handleToggleSortDirection}
          className="sort-direction-btn"
          aria-label={`Sıralama yönü: ${sortDirection === 'asc' ? 'Artan' : 'Azalan'}`}
          title={`Sıralama yönü: ${sortDirection === 'asc' ? 'Artan' : 'Azalan'}`}
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>
      </div>
    </div>
  );

  const renderCategoryList = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Kategoriler yükleniyor...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="error-state">
          <AlertCircle size={24} />
          <p>{error}</p>
          <button onClick={fetchCategories} className="retry-button">
            <RefreshCw size={16} />
            <span>Tekrar Dene</span>
          </button>
        </div>
      );
    }
    
    if (filteredCategories.length === 0) {
      return (
        <div className="empty-state">
          <FolderPlus size={48} />
          <h3>Kategori bulunamadı</h3>
          <p>
            {searchTerm || selectedType !== 'all' 
              ? 'Arama kriterlerinize uygun kategori bulunmuyor.' 
              : 'Henüz kategori oluşturmamışsınız. Yeni kategori ekleyerek başlayın.'}
          </p>
          {searchTerm || selectedType !== 'all' ? (
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
              }}
              className="clear-filters-button"
            >
              Filtreleri Temizle
            </button>
          ) : (
            <button 
              onClick={handleAddCategory}
              className="add-category-button"
            >
              <Plus size={16} />
              <span>Yeni Kategori</span>
            </button>
          )}
        </div>
      );
    }
    
    return (
      <div className="category-grid">
        {filteredCategories.map(category => (
          <div key={category.id} className="category-card">
            <div className="category-card-header">
              <div className={`category-icon ${category.type.toLowerCase()}`}>
                {category.type === 'Income' ? 
                  <ArrowUpCircle size={24} /> : 
                  <ArrowDownCircle size={24} />
                }
              </div>
              <div className="category-actions">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="action-btn edit"
                  title="Düzenle"
                  aria-label="Kategori düzenle"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="action-btn delete"
                  title="Sil"
                  aria-label="Kategori sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="category-info">
              <h3>{category.name}</h3>
              {category.description && (
                <p className="category-description">{category.description}</p>
              )}
              
              <div className="category-stats-detail">
                <div className="stat-item">
                  <span className="stat-label">İşlem Sayısı</span>
                  <span className="stat-value">{category.transactionCount || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Toplam Tutar</span>
                  <span className={`stat-value ${category.type.toLowerCase()}`}>
                    ₺{(category.totalAmount || 0).toLocaleString('tr-TR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
              </div>
              
              {category.lastUsed && (
                <div className="last-used">
                  Son kullanım: {new Date(category.lastUsed).toLocaleDateString('tr-TR')}
                </div>
              )}
            </div>
            
            <div className={`category-type-badge ${category.type.toLowerCase()}`}>
              {category.type === 'Income' ? 'Gelir' : 'Gider'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="category-manager">
      <div className="category-manager-header">
        <div>
          <h2>Kategori Yönetimi</h2>
          <p>Gelir ve gider kategorilerinizi buradan yönetebilirsiniz.</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={handleAddCategory}
          aria-label="Yeni kategori ekle"
        >
          <Plus size={16} />
          <span>Yeni Kategori</span>
        </button>
      </div>

      {renderStatCards()}
      {renderFilters()}
      {renderCategoryList()}

      <CategoryForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
        category={editingCategory}
      />
    </div>
  );
};

export default CategoryManager;