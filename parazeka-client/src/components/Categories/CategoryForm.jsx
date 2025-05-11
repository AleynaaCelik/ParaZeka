// src/components/Categories/CategoryForm.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Tag, FileText, ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';
import './CategoryForm.css';

const CategoryForm = ({ isOpen, onClose, onSubmit, category }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Expense',
    color: '#3498db'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Renk seçenekleri
  const colorOptions = [
    { name: 'Mavi', value: '#3498db' },
    { name: 'Yeşil', value: '#27ae60' },
    { name: 'Kırmızı', value: '#e74c3c' },
    { name: 'Turuncu', value: '#f39c12' },
    { name: 'Mor', value: '#9b59b6' },
    { name: 'Pembe', value: '#e91e63' },
    { name: 'Kahverengi', value: '#795548' },
    { name: 'Gri', value: '#607d8b' }
  ];

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        type: category.type || 'Expense',
        color: category.color || '#3498db'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'Expense',
        color: '#3498db'
      });
    }
    setErrors({});
  }, [category]);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Kategori adı gereklidir';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Kategori adı en az 2 karakter olmalıdır';
    }
    
    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Açıklama en fazla 200 karakter olabilir';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Kategori kaydedilirken hata:', error);
      setErrors({
        submit: 'Kategori kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="category-form-modal" onClick={handleModalClick}>
      <div className="category-form-container">
        <div className="form-header">
          <h2>
            {category ? 'Kategori Düzenle' : 'Yeni Kategori'}
          </h2>
          <button 
            className="close-button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="category-form">
          {/* Kategori Türü */}
          <div className="form-section">
            <label>Kategori Türü</label>
            <div className="type-selector">
              <button
                type="button"
                className={`type-button ${formData.type === 'Income' ? 'active income' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'Income' }))}
                disabled={isSubmitting}
              >
                <ArrowUpCircle size={20} />
                <span>Gelir</span>
              </button>
              <button
                type="button"
                className={`type-button ${formData.type === 'Expense' ? 'active expense' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'Expense' }))}
                disabled={isSubmitting}
              >
                <ArrowDownCircle size={20} />
                <span>Gider</span>
              </button>
            </div>
          </div>
          
          {/* Kategori Adı */}
          <div className="form-group">
            <label htmlFor="name">
              Kategori Adı
              <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <Tag size={18} className="input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="ör. Market Alışverişi, Maaş"
                className={errors.name ? 'error' : ''}
                disabled={isSubmitting}
              />
            </div>
            {errors.name && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.name}
              </span>
            )}
          </div>
          
          {/* Açıklama */}
          <div className="form-group">
            <label htmlFor="description">
              Açıklama
              <span className="optional">(İsteğe bağlı)</span>
            </label>
            <div className="input-with-icon">
              <FileText size={18} className="input-icon" />
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Kategori hakkında ek bilgi..."
                className={errors.description ? 'error' : ''}
                disabled={isSubmitting}
                rows="3"
              />
            </div>
            {errors.description && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.description}
              </span>
            )}
            <span className="character-count">
              {formData.description.length}/200
            </span>
          </div>
          
          {/* Renk Seçimi */}
          <div className="form-group">
            <label>Kategori Rengi</label>
            <div className="color-selector">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  type="button"
                  className={`color-option ${formData.color === color.value ? 'selected' : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  disabled={isSubmitting}
                  title={color.name}
                >
                  {formData.color === color.value && <span className="checkmark">✓</span>}
                </button>
              ))}
            </div>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner-small"></div>
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{category ? 'Güncelle' : 'Kaydet'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;