// src/pages/Transactions.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions, setPageNumber, deleteTransaction, createTransaction, updateTransaction } from '../store/transactionSlice';
import { fetchCategories } from '../store/categorySlice';
import { fetchAccounts } from '../store/accountSlice';
import TransactionForm from '../components/Transactions/TransactionForm';
import { Search, Filter, PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import './Transactions.css';

const Transactions = () => {
  const dispatch = useDispatch();
  const { transactions, loading, error, totalCount, pageNumber, pageSize } = useSelector(state => state.transactions);
  const { categories } = useSelector(state => state.categories);
  const { accounts } = useSelector(state => state.accounts);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'income', 'expense'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  useEffect(() => {
    // Gerekli verileri yükle
    dispatch(fetchCategories());
    dispatch(fetchAccounts());
    loadTransactions();
  }, [dispatch, pageNumber]);
  
  const loadTransactions = () => {
    dispatch(fetchTransactions({ 
      pageNumber, 
      pageSize,
      search: searchTerm || undefined,
      type: filter === 'all' ? undefined : filter
    }));
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilter = (filterType) => {
    setFilter(filterType);
    dispatch(setPageNumber(1)); // Reset to first page
    setTimeout(() => {
      loadTransactions();
    }, 100);
  };
  
  const handlePageChange = (newPage) => {
    dispatch(setPageNumber(newPage));
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
      await dispatch(deleteTransaction(id));
      loadTransactions();
    }
  };
  
  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };
  
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };
  
  const handleFormSubmit = async (transactionData) => {
    if (editingTransaction) {
      await dispatch(updateTransaction(transactionData));
    } else {
      await dispatch(createTransaction(transactionData));
    }
    setIsFormOpen(false);
    loadTransactions();
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // Kategori ve hesap adlarını bul
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Kategori bulunamadı';
  };

  const getAccountName = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : 'Hesap bulunamadı';
  };

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1>İşlemler</h1>
          <p>Tüm gelir ve gider işlemlerinizi buradan yönetebilirsiniz.</p>
        </div>
        <button className="btn-primary" onClick={handleAddTransaction}>
          <PlusCircle size={18} />
          <span>Yeni İşlem</span>
        </button>
      </div>
      
      <div className="filters-container">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="İşlem arayın..." 
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={(e) => e.key === 'Enter' && loadTransactions()}
          />
          <button className="search-button" onClick={loadTransactions}>
            Ara
          </button>
        </div>
        
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilter('all')}
          >
            Tümü
          </button>
          <button 
            className={`filter-tab ${filter === 'Income' ? 'active' : ''}`}
            onClick={() => handleFilter('Income')}
          >
            Gelirler
          </button>
          <button 
            className={`filter-tab ${filter === 'Expense' ? 'active' : ''}`}
            onClick={() => handleFilter('Expense')}
          >
            Giderler
          </button>
        </div>
      </div>
      
      <div className="transactions-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>İşlemler yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-message">{error}</div>
            <button onClick={loadTransactions} className="retry-button">
              Tekrar Dene
            </button>
          </div>
        ) : (
          <>
            <div className="transactions-table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Açıklama</th>
                    <th>Kategori</th>
                    <th>Hesap</th>
                    <th>Tutar</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? (
                    transactions.map(transaction => (
                      <tr key={transaction.id}>
                        <td>
                          {new Date(transaction.transactionDate).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="description-cell">
                          <div className="transaction-description">
                            {transaction.description}
                            {transaction.notes && (
                              <div className="transaction-notes">
                                {transaction.notes}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="category-badge">
                            {getCategoryName(transaction.categoryId)}
                          </span>
                        </td>
                        <td>{getAccountName(transaction.accountId)}</td>
                        <td className={`amount ${transaction.type.toLowerCase()}`}>
                          {transaction.type === 'Income' ? '+' : '-'}₺{Math.abs(transaction.amount).toFixed(2)}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-button edit"
                              onClick={() => handleEditTransaction(transaction)}
                              title="Düzenle"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="action-button delete"
                              onClick={() => handleDelete(transaction.id)}
                              title="Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">
                        <div className="empty-state">
                          <Eye size={48} />
                          <h3>İşlem bulunamadı</h3>
                          <p>Arama kriterlerinize uygun işlem bulunmuyor.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-button" 
                  disabled={pageNumber === 1}
                  onClick={() => handlePageChange(pageNumber - 1)}
                >
                  Önceki
                </button>
                
                <div className="pagination-info">
                  <span>Sayfa {pageNumber} / {totalPages}</span>
                  <span className="total-count">({totalCount} işlem)</span>
                </div>
                
                <button 
                  className="pagination-button"
                  disabled={pageNumber === totalPages}
                  onClick={() => handlePageChange(pageNumber + 1)}
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      <TransactionForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingTransaction={editingTransaction}
        categories={categories}
        accounts={accounts}
        loading={loading}
      />
    </div>
  );
};

export default Transactions;