// src/components/Categories/CategoryManager.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, FolderPlus, ArrowUpCircle, ArrowDownCircle, DollarSign, BarChart3, Tag, Check, X, AlertCircle } from 'lucide-react';
import CategoryForm from './CategoryForm';
import './CategoryManager.css';

const CategoryManager = ({ apiService }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // all, income, expense
  const [sortBy, setSortBy] = useState('name'); // name, usage, amount
  const [sortDirection, setSortDirection] = useState('asc'); // asc, desc
  
  // Statistics state
  const [categoryStats, setCategoryStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchCategoryStats();
  }, []);

  useEffect(() => {
    filterAndSortCategories();
  }, [searchTerm, selectedType, sortBy, sortDirection]);

  const fetchCategories = async () => {
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
  };

  const fetchCategoryStats = async () => {
    setStatsLoading(true);
    
    try {
      // Son 6 ay için kategori istatistiklerini al
      const now = new Date();
      const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
      
      const stats = await apiService.reports.getCategoryReport({
        fromDate: sixMonthsAgo.toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0]
      });
      
      setCategoryStats(stats);
    } catch (err) {
      console.error('Kategori istatistikleri yüklenirken hata:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const filterAndSortCategories = () => {
    let filteredCategories = [...categories];
    
    // Arama filtresi
    if (searchTerm) {
      filteredCategories = filteredCategories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Tür filtresi
    if (selectedType !== 'all') {
      filteredCategories = filteredCategories.filter(category =>
        category.type === selectedType
      );
    }
    
    // Sıralama
    filteredCategories.sort((a, b) => {
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
    
    return filteredCategories;
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
      try {
        await apiService.categories.delete(categoryId);
        await fetchCategories();
        await fetchCategoryStats();
      } catch (err) {
        console.error('Kategori silinirken hata:', err);
        alert('Kategori silinemedi. Bu kategoriye ait işlemler olabilir.');
      }
    }
  };

  const handleFormSubmit = async (categoryData) => {
    try {
      if (editingCategory) {
        await apiService.categories.update(editingCategory.id, categoryData);
      } else {
        await apiService.categories.create(categoryData);
      }
      
      setShowForm(false);
      await fetchCategories();
      await fetchCategoryStats();
    } catch (err) {
      console.error('Kategori kaydedilirken hata:', err);
      throw err;
    }
  };

  const filteredCategories = filterAndSortCategories();

  // İstatistik kartları için veriler
  const incomeCategories = categories.filter(c => c.type === 'Income').length;
  const expenseCategories = categories.filter(c => c.type === 'Expense').length;
  
  // En çok kullanılan kategoriler
  const mostUsedCategory = categories.reduce((prev, current) => 
    (prev.transactionCount || 0) > (current.transactionCount || 0) ? prev : current
  , {});

  return (
    <div className="category-manager">
      <div className="category-header">
        <div>
          <h2>Kategori Yönetimi</h2>
          <p>Gelir ve gider kategorilerinizi buradan yönetebilirsiniz.</p>
        </div>
        <button className="btn-primary" onClick={handleAddCategory}>
          <Plus size={16} />
          <span>Yeni Kategori</span>
        </button>
      </div>

      {/* İstatistik kartları */}
      <div className="category-stats">
        <div className="stat-card">
          <div className="stat-header">
            <h3>Toplam Kategori</h3>
            <FolderPlus size={20} />
          </div>
          <div className="stat-value">{categories.length}</div>
          <div className="stat-details">
            <span className="income">{incomeCategories} Gelir</span>
            <span className="expense">{expenseCategories} Gider</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>En Çok Kullanılan</h3>
            <BarChart3 size={20} />
          </div>
          <div className="stat-value">{mostUsedCategory.name || 'N/A'}</div>
          <div className="stat-details">
            <span>{mostUsedCategory.transactionCount || 0} işlem</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Bu Ay Kullanılan</h3>
            <Tag size={20} />
          </div>
          <div className="stat-value">
            {categories.filter(c => c.lastUsed && new Date(c.lastUsed).getMonth() === new Date().getMonth()).length}
          </div>
          <div className="stat-details">
            <span>aktif kategori</span>
          </div>
        </div>
      </div>

      {/* Arama ve filtreleme */}
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
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="Income">Gelir Kategorileri</option>
            <option value="Expense">Gider Kategorileri</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="name">İsme Göre</option>
            <option value="usage">Kullanıma Göre</option>
            <option value="amount">Tutara Göre</option>
          </select>
          
          <button
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="sort-direction-btn"
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Kategori listesi */}
      <div className="category-list">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Kategoriler yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <AlertCircle size={24} />
            <p>{error}</p>
            <button onClick={fetchCategories}>Tekrar Dene</button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="empty-state">
            <FolderPlus size={48} />
            <h3>Kategori bulunamadı</h3>
            <p>
              {searchTerm || selectedType !== 'all' 
                ? 'Arama kriterlerinize uygun kategori bulunmuyor.' 
                : 'Henüz kategori oluşturmamışsınız. Yeni kategori ekleyerek başlayın.'}
            </p>
          </div>
        ) : (
          <div className="category-grid">
            {filteredCategories.map(category => (
              <div key={category.id} className="category-card">
                <div className="category-header">
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
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="action-btn delete"
                      title="Sil"
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
                        ₺{(category.totalAmount || 0).toFixed(2)}
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
        )}
      </div>

      {/* Kategori formu */}
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