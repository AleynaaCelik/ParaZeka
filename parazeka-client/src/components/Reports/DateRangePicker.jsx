// src/components/Reports/DateRangePicker.jsx
import React, { useState, useCallback } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import './DateRangePicker.css';

const DateRangePicker = ({ startDate, endDate, onChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Hızlı seçim seçenekleri
  const quickOptions = [
    {
      label: 'Son 7 Gün',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Son 30 Gün',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Son 3 Ay',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setMonth(end.getMonth() - 3);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Son 6 Ay',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setMonth(end.getMonth() - 6);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Bu Yıl',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Geçen Yıl',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear() - 1, 0, 1);
        const end = new Date(now.getFullYear() - 1, 11, 31);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        };
      }
    }
  ];
  
  // Tarih formatla
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  }, []);
  
  // Seçilen tarih aralığının etiketini al
  const getSelectedLabel = useCallback(() => {
    // Hızlı seçeneklerden birini kontrol et
    for (const option of quickOptions) {
      const range = option.getValue();
      if (range.startDate === startDate && range.endDate === endDate) {
        return option.label;
      }
    }
    
    // Özel tarih aralığı
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }, [startDate, endDate, formatDate, quickOptions]);
  
  // Hızlı seçim
  const handleQuickSelect = useCallback((option) => {
    const range = option.getValue();
    onChange(range);
    setShowDropdown(false);
  }, [onChange]);
  
  // Manuel tarih değişikliği
  const handleDateChange = useCallback((field, value) => {
    const newRange = {
      startDate: field === 'startDate' ? value : startDate,
      endDate: field === 'endDate' ? value : endDate
    };
    
    // Başlangıç tarihi bitiş tarihinden sonra olamaz
    if (field === 'startDate' && value > endDate) {
      newRange.endDate = value;
    }
    
    // Bitiş tarihi başlangıç tarihinden önce olamaz
    if (field === 'endDate' && value < startDate) {
      newRange.startDate = value;
    }
    
    onChange(newRange);
  }, [startDate, endDate, onChange]);
  
  // Dropdown'u kapat
  const handleClickOutside = useCallback((e) => {
    if (!e.target.closest('.date-range-picker')) {
      setShowDropdown(false);
    }
  }, []);
  
  // Dropdown durumunu toggle'la
  const toggleDropdown = useCallback(() => {
    setShowDropdown(prev => !prev);
    
    // Dropdown açılırken body'ye click listener ekle
    if (!showDropdown) {
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown, handleClickOutside]);
  
  // Component unmount olduğunda listener'ı temizle
  React.useEffect(() => {
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);
  
  return (
    <div className="date-range-picker">
      <button 
        className="date-range-button"
        onClick={toggleDropdown}
        type="button"
      >
        <Calendar size={16} />
        <span>{getSelectedLabel()}</span>
        <ChevronDown 
          size={14} 
          className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}
        />
      </button>
      
      {showDropdown && (
        <div className="date-range-dropdown">
          <div className="dropdown-section">
            <h4 className="section-title">Hızlı Seçim</h4>
            <div className="quick-options">
              {quickOptions.map((option, index) => (
                <button
                  key={index}
                  className="quick-option"
                  onClick={() => handleQuickSelect(option)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="dropdown-section">
            <h4 className="section-title">Özel Tarih Aralığı</h4>
            <div className="custom-date-inputs">
              <div className="date-input-group">
                <label htmlFor="start-date">Başlangıç:</label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  max={endDate}
                />
              </div>
              
              <div className="date-input-group">
                <label htmlFor="end-date">Bitiş:</label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
          
          <div className="dropdown-footer">
            <button
              className="apply-button"
              onClick={() => setShowDropdown(false)}
              type="button"
            >
              Uygula
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;