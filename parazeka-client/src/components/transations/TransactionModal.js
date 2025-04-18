// src/components/transactions/TransactionModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTransaction, updateTransaction } from '../../store/transactionSlice';
import { fetchCategories } from '../../store/categorySlice';
import { fetchAccounts } from '../../store/accountSlice';

const TransactionModal = ({ isOpen, onClose, transaction = null }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.categories);
  const { accounts } = useSelector(state => state.accounts);
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    transactionDate: new Date().toISOString().substr(0, 10),
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
        transactionDate: new Date(transaction.transactionDate).toISOString().substr(0, 10)
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
      if (transaction) {
        // Güncelleme modu
        await dispatch(updateTransaction({ id: transaction.id, transaction: transactionData }));
      } else {
        // Yeni işlem ekleme modu
        await dispatch(createTransaction(transactionData));
      }
      
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
              {categories
                .filter(c => formData.type === 'Income' ? c.name.includes('Income') : !c.name.includes('Income'))
                .map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))
              }
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Satıcı/Firma</label>
              <input
                type="text"
                name="merchantName"
                className="form-control"
                value={formData.merchantName || ''}
                onChange={handleChange}
                placeholder="Satıcı veya firma adı"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Konum</label>
              <input
                type="text"
                name="location"
                className="form-control"
                value={formData.location || ''}
                onChange={handleChange}
                placeholder="İşlem konumu"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-check">
              <input
                type="checkbox"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleChange}
              />
              <span className="ms-2">Düzenli İşlem</span>
            </label>
          </div>
          
          {formData.isRecurring && (
            <div className="form-group">
              <label className="form-label">Tekrarlama Şekli</label>
              <select
                name="recurrencePattern"
                className="form-control"
                value={formData.recurrencePattern || ''}
                onChange={handleChange}
                required={formData.isRecurring}
              >
                <option value="">Seçin</option>
                <option value="Daily">Günlük</option>
                <option value="Weekly">Haftalık</option>
                <option value="Monthly">Aylık</option>
                <option value="Yearly">Yıllık</option>
              </select>
            </div>
          )}
          
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