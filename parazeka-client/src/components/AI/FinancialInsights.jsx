import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Lightbulb, BarChart, ArrowRight, Filter } from 'lucide-react';
import aiService from '../../services/aiService';
import './FinancialInsights.css';

const FinancialInsights = () => {
  const [insights, setInsights] = useState([]);
  const [filteredInsights, setFilteredInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    severityHigh: true,
    severityMedium: true,
    severityLow: true,
    typeBudgetAlert: true,
    typeSpendingPattern: true,
    typeSavingOpportunity: true,
    typeAnomaly: true
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  useEffect(() => {
    // Filtreleme mantığı
    if (insights.length > 0) {
      const filtered = insights.filter(insight => {
        // Önem derecesi filtresi
        const severityMatch = (
          (insight.severity === 'High' && filters.severityHigh) ||
          (insight.severity === 'Medium' && filters.severityMedium) ||
          (insight.severity === 'Low' && filters.severityLow)
        );
        
        // Tip filtresi
        const typeMatch = (
          (insight.type === 'BudgetAlert' && filters.typeBudgetAlert) ||
          (insight.type === 'SpendingPattern' && filters.typeSpendingPattern) ||
          (insight.type === 'SavingOpportunity' && filters.typeSavingOpportunity) ||
          (insight.type === 'Anomaly' && filters.typeAnomaly) ||
          (insight.type === 'UnusualActivity' && filters.typeAnomaly)
        );
        
        return severityMatch && typeMatch;
      });
      
      setFilteredInsights(filtered);
    }
  }, [insights, filters]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const data = await aiService.getInsights();
      setInsights(data);
      setFilteredInsights(data);
      setError(null);
    } catch (err) {
      console.error('Öngörüler yüklenirken hata:', err);
      setError('Finansal öngörüler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // İçgörü tipi için simge seçimi
  const getIconForType = (type) => {
    switch (type) {
      case 'BudgetAlert':
        return <AlertTriangle size={20} />;
      case 'SpendingPattern':
        return <BarChart size={20} />;
      case 'SavingOpportunity':
        return <Lightbulb size={20} />;
      case 'Anomaly':
      case 'UnusualActivity':
        return <TrendingUp size={20} />;
      default:
        return <Lightbulb size={20} />;
    }
  };

  // Önem derecesine göre renk ve etiket belirleme
  const getSeverityDetails = (severity) => {
    switch (severity) {
      case 'High':
        return { color: 'var(--color-danger)', label: 'Yüksek' };
      case 'Medium':
        return { color: 'var(--color-warning)', label: 'Orta' };
      case 'Low':
        return { color: 'var(--color-success)', label: 'Düşük' };
      default:
        return { color: 'var(--color-info)', label: 'Bilgi' };
    }
  };

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const toggleFilterPanel = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  if (loading) {
    return (
      <div className="financial-insights-container loading">
        <div className="loader"></div>
        <p>Finansal öngörüler yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="financial-insights-container error">
        <AlertTriangle size={24} />
        <p>{error}</p>
        <button onClick={fetchInsights}>Tekrar Dene</button>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="financial-insights-container empty">
        <Lightbulb size={32} />
        <h3>Henüz öngörü bulunamadı</h3>
        <p>Daha fazla işlem yaptıkça, kişiselleştirilmiş finansal öngörüler burada görünecek.</p>
      </div>
    );
  }

  return (
    <div className="financial-insights-container">
      <div className="financial-insights-header">
        <div>
          <h2>Finansal Öngörüler</h2>
          <p>AI tabanlı finansal analizler ve öneriler</p>
        </div>
        <button className="filter-toggle-button" onClick={toggleFilterPanel}>
          <Filter size={18} />
          <span>Filtrele</span>
        </button>
      </div>

      {isFilterOpen && (
        <div className="insights-filter-panel">
          <div className="filter-section">
            <h4>Önem Derecesi</h4>
            <div className="filter-options">
              <label>
                <input 
                  type="checkbox" 
                  name="severityHigh" 
                  checked={filters.severityHigh} 
                  onChange={handleFilterChange}
                />
                <span className="severity-badge" style={{ backgroundColor: 'var(--color-danger)20', color: 'var(--color-danger)' }}>
                  Yüksek
                </span>
              </label>
              <label>
                <input 
                  type="checkbox" 
                  name="severityMedium" 
                  checked={filters.severityMedium} 
                  onChange={handleFilterChange}
                />
                <span className="severity-badge" style={{ backgroundColor: 'var(--color-warning)20', color: 'var(--color-warning)' }}>
                  Orta
                </span>
              </label>
              <label>
                <input 
                  type="checkbox" 
                  name="severityLow" 
                  checked={filters.severityLow} 
                  onChange={handleFilterChange}
                />
                <span className="severity-badge" style={{ backgroundColor: 'var(--color-success)20', color: 'var(--color-success)' }}>
                  Düşük
                </span>
              </label>
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Öngörü Tipi</h4>
            <div className="filter-options">
              <label>
                <input 
                  type="checkbox" 
                  name="typeBudgetAlert" 
                  checked={filters.typeBudgetAlert} 
                  onChange={handleFilterChange}
                />
                Bütçe Uyarıları
              </label>
              <label>
                <input 
                  type="checkbox" 
                  name="typeSpendingPattern" 
                  checked={filters.typeSpendingPattern} 
                  onChange={handleFilterChange}
                />
                Harcama Desenleri
              </label>
              <label>
                <input 
                  type="checkbox" 
                  name="typeSavingOpportunity" 
                  checked={filters.typeSavingOpportunity} 
                  onChange={handleFilterChange}
                />
                Tasarruf Fırsatları
              </label>
              <label>
                <input 
                  type="checkbox" 
                  name="typeAnomaly" 
                  checked={filters.typeAnomaly} 
                  onChange={handleFilterChange}
                />
                Anormal İşlemler
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="financial-insights-list">
        {filteredInsights.length > 0 ? (
          filteredInsights.map((insight) => {
            const severityDetails = getSeverityDetails(insight.severity);
            
            return (
              <div 
                key={insight.id} 
                className="financial-insight-card"
                style={{ borderLeftColor: severityDetails.color }}
              >
                <div className="insight-icon-container" style={{ backgroundColor: `${severityDetails.color}20` }}>
                  <div className="insight-icon" style={{ color: severityDetails.color }}>
                    {getIconForType(insight.type)}
                  </div>
                </div>
                
                <div className="insight-content">
                  <div className="insight-header">
                    <h3>{insight.title}</h3>
                    <span 
                      className="insight-severity-badge"
                      style={{ 
                        backgroundColor: `${severityDetails.color}20`,
                        color: severityDetails.color 
                      }}
                    >
                      {severityDetails.label}
                    </span>
                  </div>
                  <p>{insight.description}</p>
                  
                  {insight.isAIGenerated && (
                    <span className="ai-generated-badge">AI Tarafından Oluşturuldu</span>
                  )}
                </div>
                
                <button className="insight-action">
                  <span>Detaylar</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            );
          })
        ) : (
          <div className="empty-filtered-insights">
            <p>Seçili filtrelere uygun öngörü bulunamadı.</p>
            <button onClick={() => setFilters({
              severityHigh: true,
              severityMedium: true,
              severityLow: true,
              typeBudgetAlert: true,
              typeSpendingPattern: true,
              typeSavingOpportunity: true,
              typeAnomaly: true
            })}>Filtreleri Sıfırla</button>
          </div>
        )}
      </div>
      
      <div className="refresh-button-container">
        <button onClick={fetchInsights} className="refresh-button">
          Öngörüleri Yenile
        </button>
      </div>
    </div>
  );
};

export default FinancialInsights;