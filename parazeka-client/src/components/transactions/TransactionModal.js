// src/components/transactions/TransactionModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTransaction } from '../../store/transactionSlice';
import { fetchCategories } from '../../store/categorySlice';
import { fetchAccounts } from '../../store/accountSlice';

const TransactionModal = ({ isOpen, onClose, transaction = null }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.categories);
  const { accounts } = useSelector(state => state.accounts);
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
    type: 'Expense',
    accountId: '',
    categoryId: '',
    isRecurring: false,
    recurrencePattern: null,
    merchantName: '',
    location: ''
  });
  
  useEffect(() => {
    // Kategorileri ve hesapları yükle
    dispatch(fetchCategories());
    dispatch(fetchAccounts());
    
    // Düzenleme modu için, mevcut işlem verilerini yükle
    if (transaction) {
      setFormData({
        ...transaction,
        transactionDate: new Date(transaction.transactionDate).toISOString().split('T')[0]
      });
    }
  }, [dispatch, transaction]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };
    
    try {
      await dispatch(createTransaction(transactionData));
      onClose();
    } catch (error) {
      console.error('İşlem kaydedilemedi:', error);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{transaction ? 'İşlemi Düzenle' : 'Yeni İşlem Ekle'}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">İşlem Türü</label>
              <select 
                name="type"
                className="form-control"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="Expense">Gider</option>
                <option value="Income">Gelir</option>
                <option value="Transfer">Transfer</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Tutar</label>
              <input
                type="number"
                name="amount"
                className="form-control"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Açıklama</label>
            <input
              type="text"
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              placeholder="İşlem açıklaması"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tarih</label>
              <input
                type="date"
                name="transactionDate"
                className="form-control"
                value={formData.transactionDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Hesap</label>
              <select
                name="accountId"
                className="form-control"
                value={formData.accountId}
                onChange={handleChange}
                required
              >
                <option value="">Hesap Seçin</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select
              name="categoryId"
              className="form-control"
              value={formData.categoryId || ''}
              onChange={handleChange}
            >
              <option value="">Kategori Seçin</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>İptal</button>
            <button type="submit" className="btn btn-primary">Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;