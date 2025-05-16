// src/components/Transactions/TransactionManager.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, Search, Filter, Calendar, ArrowDownCircle, ArrowUpCircle, 
  Download, Trash2, Edit, RefreshCw, AlertCircle, DollarSign, 
  BarChart3, ArrowUpDown, ChevronDown
} from 'lucide-react';
import TransactionModal from './TransactionModal';
import './TransactionManager.css';

const TransactionManager = ({ apiService }) => {
  // Ana state'ler
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // Ayın başlangıcı
    endDate: new Date().toISOString().split('T')[0] // Bugün
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [transactionType, setTransactionType] = useState('all'); // all, income, expense
  const [sortBy, setSortBy] = useState('date'); // date, amount, category
  const [sortDirection, setSortDirection] = useState('desc'); // asc, desc
  
  // Sayfalama state'leri
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal state'leri
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  // Özet state'leri
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0
  });

  // Veri yükleme fonksiyonları
  const fetchCategories = useCallback(async () => {
    try {
      const data = await apiService.categories.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Kategoriler yüklenirken hata:', err);
    }
  }, [apiService]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Filtreleme parametreleri
      const params = {
        page: currentPage,
        pageSize: pageSize,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        search: searchTerm,
        categories: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
        type: transactionType !== 'all' ? transactionType : undefined,
        sortBy: sortBy,
        sortDirection: sortDirection
      };
      
      const response = await apiService.transactions.getAll(params);
      setTransactions(response.items);
      setTotalCount(response.totalCount);
      
      // Özet bilgileri hesapla
      calculateSummary(response.items);
    } catch (err) {
      console.error('İşlemler yüklenirken hata:', err);
      setError('İşlemler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [
    apiService, currentPage, pageSize, dateRange, 
    searchTerm, selectedCategories, transactionType, 
    sortBy, sortDirection
  ]);

  const calculateSummary = useCallback((transactionData) => {
    const summary = transactionData.reduce((acc, transaction) => {
      if (transaction.type === 'Income') {
        acc.totalIncome += transaction.amount;
      } else {
        acc.totalExpense += transaction.amount;
      }
      return acc;
    }, {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      transactionCount: transactionData.length
    });
    
    summary.balance = summary.totalIncome - summary.totalExpense;
    setSummary(summary);
  }, []);

  // İlk yükleme
  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchTransactions();
    };
    
    loadData();
  }, [fetchCategories, fetchTransactions]);

  // İşlem CRUD işlevleri
  const handleAddTransaction = useCallback(() => {
    setEditingTransaction(null);
    setShowModal(true);
  }, []);

  const handleEditTransaction = useCallback((transaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  }, []);

  const handleDeleteTransaction = useCallback(async (transactionId) => {
    if (!window.confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      await apiService.transactions.delete(transactionId);
      await fetchTransactions();
    } catch (err) {
      console.error('İşlem silinirken hata:', err);
      alert('İşlem silinemedi. Lütfen tekrar deneyin.');
    }
  }, [apiService, fetchTransactions]);

  const handleSaveTransaction = useCallback(async (transactionData) => {
    try {
      if (editingTransaction) {
        await apiService.transactions.update(editingTransaction.id, transactionData);
      } else {
        await apiService.transactions.create(transactionData);
      }
      
      setShowModal(false);
      await fetchTransactions();
      return true;
    } catch (err) {
      console.error('İşlem kaydedilirken hata:', err);
      throw err;
    }
  }, [apiService, editingTransaction, fetchTransactions]);

  // Filtreleme işlevleri
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Aramada sayfa sıfırlama
  }, []);

  const handleDateRangeChange = useCallback((type, value) => {
    setDateRange(prev => ({
      ...prev,
      [type]: value
    }));
    setCurrentPage(1);
  }, []);

  const handleCategoryToggle = useCallback((categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
    setCurrentPage(1);
  }, []);

  const handleTypeChange = useCallback((type) => {
    setTransactionType(type);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((field) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  }, [sortBy]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setDateRange({
      startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
    setSelectedCategories([]);
    setTransactionType('all');
    setSortBy('date');
    setSortDirection('desc');
    setCurrentPage(1);
  }, []);

  // Sayfalama işlevleri
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  }, []);

  // Hesaplanmış değerler
  const pageCount = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);
  
  const paginationRange = useMemo(() => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalCount);
    return { start, end };
  }, [currentPage, pageSize, totalCount]);

  // İşlem verilerini dışa aktarma işlevi
  const handleExportTransactions = useCallback(async () => {
    try {
      // Tüm filtrelemeyi koruyarak ancak sayfalama olmadan tüm verileri al
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        search: searchTerm,
        categories: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
        type: transactionType !== 'all' ? transactionType : undefined,
        sortBy: sortBy,
        sortDirection: sortDirection,
        exportFormat: 'csv'
      };
      
      // CSV verisi al
      const csvData = await apiService.transactions.export(params);
      
      // CSV'yi indirme işlemi
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Dosya adı oluştur: parazeka_islemler_20230101_20230131.csv
      const fileName = `parazeka_islemler_${dateRange.startDate.replace(/-/g, '')}_${dateRange.endDate.replace(/-/g, '')}.csv`;
      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('İşlemler dışa aktarılırken hata:', err);
      alert('İşlemler dışa aktarılamadı. Lütfen tekrar deneyin.');
    }
  }, [
    apiService, dateRange, searchTerm, selectedCategories, 
    transactionType, sortBy, sortDirection
  ]);

  // Render fonksiyonları
  const renderSummaryCards = () => (
    <div className="transaction-summary">
      <div className="summary-card total">
        <div className="summary-icon">
          <BarChart3 size={24} />
        </div>
        <div className="summary-content">
          <h3>Toplam İşlem</h3>
          <div className="summary-value">{summary.transactionCount}</div>
        </div>
      </div>
      
      <div className="summary-card income">
        <div className="summary-icon">
          <ArrowUpCircle size={24} />
        </div>
        <div className="summary-content">
          <h3>Toplam Gelir</h3>
          <div className="summary-value">
            ₺{summary.totalIncome.toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        </div>
      </div>
      
      <div className="summary-card expense">
        <div className="summary-icon">
          <ArrowDownCircle size={24} />
        </div>
        <div className="summary-content">
          <h3>Toplam Gider</h3>
          <div className="summary-value">
            ₺{summary.totalExpense.toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        </div>
      </div>
      
      <div className="summary-card balance">
        <div className="summary-icon">
          <DollarSign size={24} />
        </div>
        <div className="summary-content">
          <h3>Bakiye</h3>
          <div className="summary-value">
            ₺{summary.balance.toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilterSection = () => (
    <div className="transaction-filters">
      <div className="filters-row">
        <div className="search-field">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="İşlem ara..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        
        <div className="date-range">
          <div className="date-field">
            <label htmlFor="startDate">Başlangıç:</label>
            <input
              type="date"
              id="startDate"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              max={dateRange.endDate}
            />
          </div>
          
          <div className="date-field">
            <label htmlFor="endDate">Bitiş:</label>
            <input
              type="date"
              id="endDate"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              min={dateRange.startDate}
            />
          </div>
        </div>
        
        <div className="action-buttons">
          <button 
            className="btn-add" 
            onClick={handleAddTransaction}
            aria-label="Yeni işlem ekle"
          >
            <Plus size={16} />
            <span>Yeni İşlem</span>
          </button>
          
          <button 
            className="btn-export" 
            onClick={handleExportTransactions}
            aria-label="İşlemleri dışa aktar"
          >
            <Download size={16} />
            <span>Dışa Aktar</span>
          </button>
        </div>
      </div>
      
      <div className="filters-row">
        <div className="filter-group">
          <div className="filter-dropdown">
            <button className="filter-dropdown-toggle">
              <Filter size={16} />
              <span>Tür: {transactionType === 'all' ? 'Tümü' : transactionType === 'Income' ? 'Gelir' : 'Gider'}</span>
              <ChevronDown size={14} />
            </button>
            <div className="filter-dropdown-menu">
              <button 
                className={`filter-option ${transactionType === 'all' ? 'active' : ''}`}
                onClick={() => handleTypeChange('all')}
              >
                Tümü
              </button>
              <button 
                className={`filter-option ${transactionType === 'Income' ? 'active' : ''}`}
                onClick={() => handleTypeChange('Income')}
              >
                Gelir
              </button>
              <button 
                className={`filter-option ${transactionType === 'Expense' ? 'active' : ''}`}
                onClick={() => handleTypeChange('Expense')}
              >
                Gider
              </button>
            </div>
          </div>
          
          <div className="filter-dropdown">
            <button className="filter-dropdown-toggle">
              <Tag size={16} />
              <span>Kategoriler {selectedCategories.length > 0 ? `(${selectedCategories.length})` : ''}</span>
              <ChevronDown size={14} />
            </button>
            <div className="filter-dropdown-menu categories-menu">
              {categories.length === 0 ? (
                <div className="empty-categories">Hiç kategori bulunamadı.</div>
              ) : (
                <>
                  {categories.map(category => (
                    <div key={category.id} className="category-option">
                      <label className="category-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                        />
                        <span className="checkbox-custom"></span>
                        <span className="category-name">{category.name}</span>
                      </label>
                      <span className={`category-badge ${category.type.toLowerCase()}`}>
                        {category.type === 'Income' ? 'Gelir' : 'Gider'}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="filter-actions">
          <button 
            className="btn-clear-filters" 
            onClick={handleClearFilters}
            disabled={
              searchTerm === '' && 
              dateRange.startDate === new Date(new Date().setDate(1)).toISOString().split('T')[0] &&
              dateRange.endDate === new Date().toISOString().split('T')[0] &&
              selectedCategories.length === 0 &&
              transactionType === 'all' &&
              sortBy === 'date' &&
              sortDirection === 'desc'
            }
          >
            <RefreshCw size={14} />
            <span>Filtreleri Temizle</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderTransactionTable = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>İşlemler yükleniyor...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="error-state">
          <AlertCircle size={24} />
          <p>{error}</p>
          <button onClick={fetchTransactions} className="retry-button">
            <RefreshCw size={16} />
            <span>Tekrar Dene</span>
          </button>
        </div>
      );
    }
    
    if (transactions.length === 0) {
      return (
        <div className="empty-state">
          <DollarSign size={48} />
          <h3>İşlem bulunamadı</h3>
          <p>
            {searchTerm || selectedCategories.length > 0 || transactionType !== 'all'
              ? 'Arama kriterlerinize uygun işlem bulunmuyor.'
              : 'Henüz işlem oluşturmamışsınız. Yeni işlem ekleyerek başlayın.'}
          </p>
          {searchTerm || selectedCategories.length > 0 || transactionType !== 'all' ? (
            <button 
              onClick={handleClearFilters}
              className="clear-filters-button"
            >
              Filtreleri Temizle
            </button>
          ) : (
            <button 
              onClick={handleAddTransaction}
              className="add-transaction-button"
            >
              <Plus size={16} />
              <span>Yeni İşlem</span>
            </button>
          )}
        </div>
      );
    }
    
    return (
      <div className="transaction-table-container">
        <table className="transaction-table">
          <thead>
            <tr>
              <th className={`sortable ${sortBy === 'date' ? 'active' : ''}`} onClick={() => handleSortChange('date')}>
                <span>Tarih</span>
                {sortBy === 'date' && (
                  <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th>Açıklama</th>
              <th className={`sortable ${sortBy === 'category' ? 'active' : ''}`} onClick={() => handleSortChange('category')}>
                <span>Kategori</span>
                {sortBy === 'category' && (
                  <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className={`sortable amount-column ${sortBy === 'amount' ? 'active' : ''}`} onClick={() => handleSortChange('amount')}>
                <span>Tutar</span>
                {sortBy === 'amount' && (
                  <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="actions-column">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => {
              const category = categories.find(c => c.id === transaction.categoryId);
              
              return (
                <tr key={transaction.id} className={transaction.type.toLowerCase()}>
                  <td className="date-cell">
                    {new Date(transaction.date).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="description-cell">
                    <div className="transaction-description">
                      <span className="description-text">{transaction.description}</span>
                      {transaction.notes && (
                        <span className="transaction-notes" title={transaction.notes}>
                          ℹ️
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="category-cell">
                    {category ? (
                      <span 
                        className="category-label"
                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                      >
                        {category.name}
                      </span>
                    ) : (
                      <span className="category-label category-unknown">
                        Kategori Yok
                      </span>
                    )}
                  </td>
                  <td className={`amount-cell ${transaction.type.toLowerCase()}`}>
                    {transaction.type === 'Income' ? '+' : '-'} ₺{transaction.amount.toLocaleString('tr-TR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleEditTransaction(transaction)}
                      className="action-btn edit"
                      title="Düzenle"
                      aria-label="İşlemi düzenle"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="action-btn delete"
                      title="Sil"
                      aria-label="İşlemi sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPagination = () => {
    if (transactions.length === 0) return null;
    
    return (
      <div className="pagination-container">
        <div className="pagination-info">
          <span>
            Gösterilen: {paginationRange.start}-{paginationRange.end} / {totalCount}
          </span>
          
          <div className="page-size-selector">
            <label htmlFor="pageSize">Sayfa başına:</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="page-size-select"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
        
        <div className="pagination-controls">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="pagination-btn first"
            aria-label="İlk sayfa"
          >
            ««
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn prev"
            aria-label="Önceki sayfa"
          >
            «
          </button>
          
          <div className="pagination-pages">
            {Array.from({ length: Math.min(5, pageCount) }, (_, index) => {
              let pageNum;
              
              if (pageCount <= 5) {
                pageNum = index + 1;
              } else if (currentPage <= 3) {
                pageNum = index + 1;
              } else if (currentPage >= pageCount - 2) {
                pageNum = pageCount - 4 + index;
              } else {
                pageNum = currentPage - 2 + index;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`pagination-page ${currentPage === pageNum ? 'active' : ''}`}
                  aria-label={`Sayfa ${pageNum}`}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pageCount}
            className="pagination-btn next"
            aria-label="Sonraki sayfa"
          >
            »
          </button>
          <button
            onClick={() => handlePageChange(pageCount)}
            disabled={currentPage === pageCount}
            className="pagination-btn last"
            aria-label="Son sayfa"
          >
            »»
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="transaction-manager">
      <div className="transaction-manager-header">
        <div>
          <h2>İşlem Yönetimi</h2>
          <p>Gelir ve gider işlemlerinizi buradan yönetebilirsiniz.</p>
        </div>
      </div>

      {renderSummaryCards()}
      {renderFilterSection()}
      {renderTransactionTable()}
      {renderPagination()}

      {showModal && (
        <TransactionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSaveTransaction}
          transaction={editingTransaction}
          categories={categories}
        />
      )}
    </div>
  );
};

export default TransactionManager;