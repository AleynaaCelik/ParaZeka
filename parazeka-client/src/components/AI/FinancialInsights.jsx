import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Lightbulb, BarChart, ArrowRight } from 'lucide-react';
import aiService from '../../services/aiService';
import './FinancialInsights.css';

const FinancialInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const data = await aiService.getInsights();
      setInsights(data);
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
        <h2>Finansal Öngörüler</h2>
        <p>AI tabanlı finansal analizler ve öneriler</p>
      </div>

      <div className="financial-insights-list">
        {insights.map((insight) => {
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
        })}
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