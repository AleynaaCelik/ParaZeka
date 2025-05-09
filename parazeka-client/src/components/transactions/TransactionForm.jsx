import React, { useState, useEffect } from 'react';
import { X, Save, Calculator, Calendar, Tag, CreditCard, DollarSign, ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';
import './TransactionForm.css';

const TransactionForm = ({ isOpen, onClose, onSubmit, editingTransaction, categories, accounts, loading }) => {
  const [formData, setFormData] = useState({
    type: 'Expense',
    amount: '',
    description: '',
    categoryId: '',
    accountId: '',
    transactionDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form açıldığında veya editingTransaction değiştiğinde form verilerini güncelle
  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        type: editingTransaction.type || 'Expense',
        amount: editingTransaction.amount ? Math.abs(editingTransaction.amount).toString() : '',
        description: editingTransaction.description || '',
        categoryId: editingTransaction.categoryId || '',
        accountId: editingTransaction.accountId || '',
        transactionDate: editingTransaction.transactionDate ? 
          new Date(editingTransaction.transactionDate).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0],
        notes: editingTransaction.notes || ''
      });
    } else {
      setFormData({
        type: 'Expense',
        amount: '',
        description: '',
        categoryId: '',
        accountId: '',
        transactionDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
    setErrors({});
  }, [editingTransaction]);

  // Form verisini değiştir
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hata varsa temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Kategori tipine göre kategorileri filtrele
  const getFilteredCategories = () => {
    if (!categories || categories.length === 0) return [];
    return categories.filter(category => category.type === formData.type);
  };

  // Form doğrulama
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'İşlem açıklaması gereklidir';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Geçerli bir tutar giriniz';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Kategori seçimi gereklidir';
    }
    
    if (!formData.accountId) {
      newErrors.accountId = 'Hesap seçimi gereklidir';
    }
    
    if (!formData.transactionDate) {
      newErrors.transactionDate = 'İşlem tarihi gereklidir';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };
    
    if (editingTransaction) {
      transactionData.id = editingTransaction.id;
    }
    
    try {
      await onSubmit(transactionData);
      onClose();
    } catch (error) {
      console.error('İşlem gönderilirken hata:', error);
      setErrors({
        submit: 'İşlem kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal dışına tıklandığında kapat
  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="transaction-form-modal" onClick={handleModalClick}>
      <div className="transaction-form-container">
        <div className="transaction-form-header">
          <h2>
            {editingTransaction ? 'İşlemi Düzenle' : 'Yeni İşlem Ekle'}
          </h2>
          <button 
            className="close-button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="transaction-form">
          {/* İşlem Türü Seçimi */}
          <div className="form-section">
            <div className="transaction-type-selector">
              <button
                type="button"
                className={`type-button expense ${formData.type === 'Expense' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'Expense', categoryId: '' }))}
                disabled={isSubmitting}
              >
                <ArrowDownCircle size={20} />
                <span>Gider</span>
              </button>
              <button
                type="button"
                className={`type-button income ${formData.type === 'Income' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'Income', categoryId: '' }))}
                disabled={isSubmitting}
              >
                <ArrowUpCircle size={20} />
                <span>Gelir</span>
              </button>
            </div>
          </div>
          
          {/* Açıklama */}
          <div className="form-group">
            <label htmlFor="description">
              İşlem Açıklaması
              <span className="required">*</span>
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="ör. Market alışverişi, Maaş ödemesi"
              className={errors.description ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.description && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.description}
              </span>
            )}
          </div>
          
          {/* Tutar */}
          <div className="form-group">
            <label htmlFor="amount">
              Tutar (₺)
              <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <DollarSign size={18} className="input-icon" />
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={errors.amount ? 'error' : ''}
                disabled={isSubmitting}
              />
            </div>
            {errors.amount && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.amount}
              </span>
            )}
          </div>
          
          {/* Kategori */}
          <div className="form-group">
            <label htmlFor="categoryId">
              Kategori
              <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <Tag size={18} className="input-icon" />
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={errors.categoryId ? 'error' : ''}
                disabled={isSubmitting}
              >
                <option value="">Kategori seçin...</option>
                {getFilteredCategories().map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.categoryId && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.categoryId}
              </span>
            )}
          </div>
          
          {/* Hesap */}
          <div className="form-group">
            <label htmlFor="accountId">
              Hesap
              <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <CreditCard size={18} className="input-icon" />
              <select
                id="accountId"
                name="accountId"
                value={formData.accountId}
                onChange={handleChange}
                className={errors.accountId ? 'error' : ''}
                disabled={isSubmitting}
              >
                <option value="">Hesap seçin...</option>
                {accounts && accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} - ₺{account.balance.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            {errors.accountId && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.accountId}
              </span>
            )}
          </div>
          
          {/* İşlem Tarihi */}
          <div className="form-group">
            <label htmlFor="transactionDate">
              İşlem Tarihi
              <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <Calendar size={18} className="input-icon" />
              <input
                type="date"
                id="transactionDate"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleChange}
                className={errors.transactionDate ? 'error' : ''}
                disabled={isSubmitting}
              />
            </div>
            {errors.transactionDate && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.transactionDate}
              </span>
            )}
          </div>
          
          {/* Notlar */}
          <div className="form-group">
            <label htmlFor="notes">
              Notlar
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Ek notlar (isteğe bağlı)"
              rows="3"
              disabled={isSubmitting}
            />
          </div>
          
          {/* Form Hataları */}
          {errors.submit && (
            <div className="form-error">
              <AlertCircle size={16} />
              <span>{errors.submit}</span>
            </div>
          )}
          
          {/* Form Aksiyonları */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner-small"></div>
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{editingTransaction ? 'Güncelle' : 'Kaydet'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;