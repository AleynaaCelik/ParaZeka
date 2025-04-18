// src/pages/Transactions.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions, setPageNumber, deleteTransaction } from '../store/transactionSlice';
import TransactionModal from '../components/transactions/TransactionModal';

const Transactions = () => {
  const dispatch = useDispatch();
  const { transactions, loading, error, totalCount, pageNumber, pageSize } = useSelector(state => state.transactions);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'income', 'expense'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  useEffect(() => {
    loadTransactions();
  }, [dispatch, pageNumber]);
  
  const loadTransactions = () => {
    dispatch(fetchTransactions({ 
      pageNumber, 
      pageSize,
      searchTerm: searchTerm || undefined,
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
    setSelectedTransaction(null); // Yeni işlem için
    setIsModalOpen(true);
  };
  
  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    loadTransactions(); // Modalı kapatınca işlemleri yenile
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="transactions-page">
      <h1>İşlemler</h1>
      
      <div className="filters card">
        <div className="search-filter">
          <input 
            type="text" 
            className="form-control" 
            placeholder="İşlem arayın..." 
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={(e) => e.key === 'Enter' && loadTransactions()}
          />
          <button className="btn btn-primary" onClick={loadTransactions}>Ara</button>
        </div>
        <div className="filter-buttons">
          <button 
            className={`btn-outline ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilter('all')}
          >
            Tümü
          </button>
          <button 
            className={`btn-outline ${filter === 'Income' ? 'active' : ''}`}
            onClick={() => handleFilter('Income')}
          >
            Gelirler
          </button>
          <button 
            className={`btn-outline ${filter === 'Expense' ? 'active' : ''}`}
            onClick={() => handleFilter('Expense')}
          >
            Giderler
          </button>
        </div>
      </div>
      
      <div className="transactions-list card">
        <div className="transactions-header">
          <div className="actions">
            <button className="btn btn-primary" onClick={handleAddTransaction}>+ Yeni İşlem</button>
          </div>
        </div>
        
        {loading ? (
          <div>Yükleniyor...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
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
                      <td>{new Date(transaction.transactionDate).toLocaleDateString('tr-TR')}</td>
                      <td>{transaction.description}</td>
                      <td><span className="category-badge">{transaction.categoryName}</span></td>
                      <td>{transaction.accountName}</td>
                      <td className={`amount ${transaction.type === 'Income' ? 'income' : 'expense'}`}>
                        {transaction.type === 'Income' ? '+' : '-'}₺{transaction.amount.toFixed(2)}
                      </td>
                      <td>
                        <button className="btn-icon" onClick={() => handleEditTransaction(transaction)}>✏️</button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleDelete(transaction.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">İşlem bulunamadı.</td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="btn-pagination" 
                  disabled={pageNumber === 1}
                  onClick={() => handlePageChange(pageNumber - 1)}
                >
                  ◀
                </button>
                <span className="pagination-info">Sayfa {pageNumber} / {totalPages}</span>
                <button 
                  className="btn-pagination"
                  disabled={pageNumber === totalPages}
                  onClick={() => handlePageChange(pageNumber + 1)}
                >
                  ▶
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        transaction={selectedTransaction} 
      />
    </div>
  );
};

export default Transactions;