// src/components/AI/AiRecommendations.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Brain, Lightbulb, TrendingUp, TrendingDown, AlertTriangle, 
  CheckCircle, Target, DollarSign, PieChart, Calendar,
  ArrowRight, Zap, Star, RefreshCw, Settings, Filter,
  ThumbsUp, ThumbsDown, BookOpen, MessageCircle
} from 'lucide-react';
import './AiRecommendations.css';

const AiRecommendations = ({ apiService }) => {
  // Ana state'ler
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtre state'leri
  const [categoryFilter, setCategoryFilter] = useState('all'); // all, spending, saving, budgeting, investing
  const [priorityFilter, setPriorityFilter] = useState('all'); // all, high, medium, low
  const [statusFilter, setStatusFilter] = useState('all'); // all, new, viewed, applied, dismissed
  
  // AI model state'leri
  const [aiInsights, setAiInsights] = useState(null);
  const [personalizedTips, setPersonalizedTips] = useState([]);
  const [predictiveAnalysis, setPredictiveAnalysis] = useState(null);
  
  // User interaction state'leri
  const [expandedRecommendation, setExpandedRecommendation] = useState(null);
  const [userFeedback, setUserFeedback] = useState({});
  
  // Veri yükleme fonksiyonları
  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // AI önerilerini çek
      const aiRecommendations = await apiService.ai.getRecommendations({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      
      setRecommendations(aiRecommendations);
      
      // AI içgörülerini çek
      const insights = await apiService.ai.getInsights();
      setAiInsights(insights);
      
      // Kişiselleştirilmiş ipuçlarını çek
      const tips = await apiService.ai.getPersonalizedTips();
      setPersonalizedTips(tips);
      
      // Tahmine dayalı analizi çek
      const prediction = await apiService.ai.getPredictiveAnalysis();
      setPredictiveAnalysis(prediction);
      
    } catch (err) {
      console.error('AI önerileri yüklenirken hata:', err);
      setError('AI önerileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [apiService, categoryFilter, priorityFilter, statusFilter]);
  
  // İlk yükleme ve filtre değişikliklerinde verileri yeniden çek
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);
  
  // Kullanıcı etkileşim fonksiyonları
  const handleRecommendationAction = useCallback(async (recommendationId, action, data = {}) => {
    try {
      await apiService.ai.handleRecommendationAction(recommendationId, action, data);
      
      // Önerileri güncelle
      setRecommendations(prev => prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, status: action, lastActionDate: new Date().toISOString() }
          : rec
      ));
      
    } catch (err) {
      console.error('Öneri işlemi gerçekleştirilirken hata:', err);
      alert('İşlem gerçekleştirilemedi. Lütfen tekrar deneyin.');
    }
  }, [apiService]);
  
  const handleFeedback = useCallback(async (recommendationId, isHelpful) => {
    try {
      await apiService.ai.provideFeedback(recommendationId, isHelpful);
      
      setUserFeedback(prev => ({
        ...prev,
        [recommendationId]: isHelpful
      }));
      
    } catch (err) {
      console.error('Geri bildirim gönderilirken hata:', err);
    }
  }, [apiService]);
  
  const toggleExpanded = useCallback((recommendationId) => {
    setExpandedRecommendation(prev => 
      prev === recommendationId ? null : recommendationId
    );
  }, []);
  
  // Filtrelenmiş öneriler
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      if (categoryFilter !== 'all' && rec.category !== categoryFilter) return false;
      if (priorityFilter !== 'all' && rec.priority !== priorityFilter) return false;
      if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
      return true;
    });
  }, [recommendations, categoryFilter, priorityFilter, statusFilter]);
  
  // Önerileri önceliğe göre grupla
  const groupedRecommendations = useMemo(() => {
    const groups = {
      high: [],
      medium: [],
      low: []
    };
    
    filteredRecommendations.forEach(rec => {
      groups[rec.priority].push(rec);
    });
    
    return groups;
  }, [filteredRecommendations]);
  
  // Para birimi formatla
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);
  
  // Tarih formatla
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  }, []);
  
  // Kategori ikonunu al
  const getCategoryIcon = useCallback((category) => {
    switch (category) {
      case 'spending':
        return TrendingDown;
      case 'saving':
        return TrendingUp;
      case 'budgeting':
        return PieChart;
      case 'investing':
        return Target;
      default:
        return Lightbulb;
    }
  }, []);
  
  // Öncelik rengini al
  const getPriorityColor = useCallback((priority) => {
    switch (priority) {
      case 'high':
        return '#e74c3c';
      case 'medium':
        return '#f39c12';
      case 'low':
        return '#3498db';
      default:
        return '#7f8c8d';
    }
  }, []);
  
  // Render fonksiyonları
  const renderFilters = () => (
    <div className="ai-filters">
      <div className="filter-group">
        <label>
          <Filter size={16} />
          <span>Kategori:</span>
        </label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tümü</option>
          <option value="spending">Harcama</option>
          <option value="saving">Tasarruf</option>
          <option value="budgeting">Bütçeleme</option>
          <option value="investing">Yatırım</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>
          <Star size={16} />
          <span>Öncelik:</span>
        </label>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tümü</option>
          <option value="high">Yüksek</option>
          <option value="medium">Orta</option>
          <option value="low">Düşük</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>
          <CheckCircle size={16} />
          <span>Durum:</span>
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tümü</option>
          <option value="new">Yeni</option>
          <option value="viewed">Görüntülenen</option>
          <option value="applied">Uygulanan</option>
          <option value="dismissed">Reddedilen</option>
        </select>
      </div>
      
      <button 
        className="refresh-button"
        onClick={fetchRecommendations}
        disabled={loading}
      >
        <RefreshCw size={16} className={loading ? 'spinning' : ''} />
        <span>Yenile</span>
      </button>
    </div>
  );
  
  const renderAiInsights = () => {
    if (!aiInsights) return null;
    
    return (
      <div className="ai-insights-summary">
        <div className="insights-header">
          <Brain size={24} />
          <h3>AI Finansal Analiz</h3>
        </div>
        
        <div className="insights-grid">
          <div className="insight-card financial-health">
            <div className="insight-icon">
              <CheckCircle size={20} />
            </div>
            <div className="insight-content">
              <h4>Finansal Sağlık Skoru</h4>
              <div className="score-value">{aiInsights.healthScore}/100</div>
              <div className="score-trend">
                {aiInsights.healthTrend > 0 ? (
                  <span className="trend-up">
                    <TrendingUp size={14} />
                    +{aiInsights.healthTrend} puan
                  </span>
                ) : (
                  <span className="trend-down">
                    <TrendingDown size={14} />
                    {aiInsights.healthTrend} puan
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="insight-card spending-pattern">
            <div className="insight-icon">
              <TrendingDown size={20} />
            </div>
            <div className="insight-content">
              <h4>Harcama Modeli</h4>
              <div className="pattern-description">{aiInsights.spendingPattern}</div>
              <div className="pattern-confidence">
                Güven: %{aiInsights.patternConfidence}
              </div>
            </div>
          </div>
          
          <div className="insight-card saving-potential">
            <div className="insight-icon">
              <DollarSign size={20} />
            </div>
            <div className="insight-content">
              <h4>Tasarruf Potansiyeli</h4>
              <div className="potential-amount">
                {formatCurrency(aiInsights.savingPotential)}
              </div>
              <div className="potential-period">aylık</div>
            </div>
          </div>
          
          <div className="insight-card next-goal">
            <div className="insight-icon">
              <Target size={20} />
            </div>
            <div className="insight-content">
              <h4>Önerilen Sonraki Hedef</h4>
              <div className="goal-name">{aiInsights.suggestedGoal?.name}</div>
              <div className="goal-amount">
                {aiInsights.suggestedGoal && formatCurrency(aiInsights.suggestedGoal.amount)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderPredictiveAnalysis = () => {
    if (!predictiveAnalysis) return null;
    
    return (
      <div className="predictive-analysis">
        <div className="analysis-header">
          <Zap size={20} />
          <h3>Tahmine Dayalı Analiz</h3>
        </div>
        
        <div className="predictions-grid">
          <div className="prediction-card">
            <h4>Gelecek Ay Tahmini</h4>
            <div className="prediction-items">
              <div className="prediction-item">
                <span className="prediction-label">Beklenen Gelir:</span>
                <span className="prediction-value income">
                  {formatCurrency(predictiveAnalysis.nextMonth.expectedIncome)}
                </span>
              </div>
              <div className="prediction-item">
                <span className="prediction-label">Tahmini Gider:</span>
                <span className="prediction-value expense">
                  {formatCurrency(predictiveAnalysis.nextMonth.expectedExpense)}
                </span>
              </div>
              <div className="prediction-item">
                <span className="prediction-label">Net Bakiye:</span>
                <span className={`prediction-value ${predictiveAnalysis.nextMonth.netBalance >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(predictiveAnalysis.nextMonth.netBalance)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="prediction-card">
            <h4>Risk Analizi</h4>
            <div className="risk-items">
              {predictiveAnalysis.risks.map((risk, index) => (
                <div key={index} className={`risk-item ${risk.level}`}>
                  <AlertTriangle size={16} />
                  <div className="risk-content">
                    <div className="risk-title">{risk.title}</div>
                    <div className="risk-description">{risk.description}</div>
                    <div className="risk-probability">Olasılık: %{risk.probability}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="prediction-card">
            <h4>Fırsatlar</h4>
            <div className="opportunity-items">
              {predictiveAnalysis.opportunities.map((opportunity, index) => (
                <div key={index} className="opportunity-item">
                  <TrendingUp size={16} />
                  <div className="opportunity-content">
                    <div className="opportunity-title">{opportunity.title}</div>
                    <div className="opportunity-description">{opportunity.description}</div>
                    <div className="opportunity-potential">
                      Potansiyel: {formatCurrency(opportunity.potentialSaving)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderPersonalizedTips = () => {
    if (!personalizedTips.length) return null;
    
    return (
      <div className="personalized-tips">
        <div className="tips-header">
          <Lightbulb size={20} />
          <h3>Kişiselleştirilmiş İpuçları</h3>
        </div>
        
        <div className="tips-list">
          {personalizedTips.map((tip, index) => (
            <div key={index} className={`tip-item ${tip.category}`}>
              <div className="tip-icon">
                <Lightbulb size={16} />
              </div>
              <div className="tip-content">
                <h4>{tip.title}</h4>
                <p>{tip.description}</p>
                {tip.expectedImpact && (
                  <div className="tip-impact">
                    Beklenen Etki: {formatCurrency(tip.expectedImpact)} tasarruf
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderRecommendationCard = (recommendation) => {
    const CategoryIcon = getCategoryIcon(recommendation.category);
    const isExpanded = expandedRecommendation === recommendation.id;
    const priorityColor = getPriorityColor(recommendation.priority);
    
    return (
      <div 
        key={recommendation.id} 
        className={`recommendation-card ${recommendation.priority} ${recommendation.status}`}
      >
        <div className="recommendation-header">
          <div className="recommendation-icon">
            <CategoryIcon size={20} />
          </div>
          
          <div className="recommendation-title-area">
            <h4 className="recommendation-title">{recommendation.title}</h4>
            <div className="recommendation-meta">
              <span 
                className="priority-badge"
                style={{ backgroundColor: priorityColor }}
              >
                {recommendation.priority === 'high' ? 'Yüksek' : 
                 recommendation.priority === 'medium' ? 'Orta' : 'Düşük'} Öncelik
              </span>
              <span className="category-badge">{recommendation.categoryLabel}</span>
              <span className="date-badge">
                {formatDate(recommendation.createdAt)}
              </span>
            </div>
          </div>
          
          <div className="recommendation-actions">
            <button
              className="expand-button"
              onClick={() => toggleExpanded(recommendation.id)}
            >
              {isExpanded ? 'Gizle' : 'Detay'}
              <ArrowRight size={14} className={isExpanded ? 'rotated' : ''} />
            </button>
          </div>
        </div>
        
        <div className="recommendation-summary">
          <p>{recommendation.summary}</p>
          
          {recommendation.expectedImpact && (
            <div className="expected-impact">
              <DollarSign size={16} />
              <span>Beklenen Etki: {formatCurrency(recommendation.expectedImpact.amount)}</span>
              <span className="impact-period">({recommendation.expectedImpact.period})</span>
            </div>
          )}
        </div>
        
        {isExpanded && (
          <div className="recommendation-details">
            <div className="details-content">
              <h5>Detaylı Açıklama</h5>
              <p>{recommendation.detailedDescription}</p>
              
              {recommendation.steps && recommendation.steps.length > 0 && (
                <div className="action-steps">
                  <h5>Önerilen Adımlar</h5>
                  <ol className="steps-list">
                    {recommendation.steps.map((step, index) => (
                      <li key={index} className="step-item">
                        <span className="step-text">{step.description}</span>
                        {step.estimatedTime && (
                          <span className="step-time">
                            <Calendar size={12} />
                            {step.estimatedTime}
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              
              {recommendation.risks && recommendation.risks.length > 0 && (
                <div className="recommendation-risks">
                  <h5>Dikkat Edilmesi Gerekenler</h5>
                  <ul className="risks-list">
                    {recommendation.risks.map((risk, index) => (
                      <li key={index} className="risk-item">
                        <AlertTriangle size={14} />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {recommendation.relatedResources && recommendation.relatedResources.length > 0 && (
                <div className="related-resources">
                  <h5>İlgili Kaynaklar</h5>
                  <div className="resources-list">
                    {recommendation.relatedResources.map((resource, index) => (
                      <a 
                        key={index}
                        href={resource.url}
                        className="resource-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <BookOpen size={14} />
                        <span>{resource.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="recommendation-footer">
              <div className="action-buttons">
                <button
                  className="action-btn primary"
                  onClick={() => handleRecommendationAction(recommendation.id, 'applied')}
                  disabled={recommendation.status === 'applied'}
                >
                  <CheckCircle size={16} />
                  <span>Uygula</span>
                </button>
                
                <button
                  className="action-btn secondary"
                  onClick={() => handleRecommendationAction(recommendation.id, 'dismissed')}
                  disabled={recommendation.status === 'dismissed'}
                >
                  <span>Reddet</span>
                </button>
                
                <button
                  className="action-btn tertiary"
                  onClick={() => handleRecommendationAction(recommendation.id, 'remind_later')}
                >
                  <Calendar size={16} />
                  <span>Sonra Hatırlat</span>
                </button>
              </div>
              
              <div className="feedback-section">
                <span className="feedback-label">Bu öneri faydalı mı?</span>
                <div className="feedback-buttons">
                  <button
                    className={`feedback-btn ${userFeedback[recommendation.id] === true ? 'active' : ''}`}
                    onClick={() => handleFeedback(recommendation.id, true)}
                  >
                    <ThumbsUp size={14} />
                  </button>
                  <button
                    className={`feedback-btn ${userFeedback[recommendation.id] === false ? 'active' : ''}`}
                    onClick={() => handleFeedback(recommendation.id, false)}
                  >
                    <ThumbsDown size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderRecommendations = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>AI önerileri yükleniyor...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="error-state">
          <AlertTriangle size={24} />
          <p>{error}</p>
          <button onClick={fetchRecommendations} className="retry-button">
            <RefreshCw size={16} />
            <span>Tekrar Dene</span>
          </button>
        </div>
      );
    }
    
    if (filteredRecommendations.length === 0) {
      return (
        <div className="empty-state">
          <Brain size={48} />
          <h3>Öneri bulunamadı</h3>
          <p>
            Mevcut filtrelerinize uygun AI önerisi bulunmuyor. 
            Filtreleri değiştirerek tekrar deneyin.
          </p>
        </div>
      );
    }
    
    return (
      <div className="recommendations-list">
        {Object.entries(groupedRecommendations).map(([priority, recs]) => {
          if (recs.length === 0) return null;
          
          return (
            <div key={priority} className="priority-group">
              <div className="priority-header">
                <h3>
                  {priority === 'high' ? 'Yüksek Öncelikli' : 
                   priority === 'medium' ? 'Orta Öncelikli' : 'Düşük Öncelikli'} Öneriler
                </h3>
                <span className="recommendation-count">{recs.length} öneri</span>
              </div>
              
              <div className="recommendations-grid">
                {recs.map(renderRecommendationCard)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="ai-recommendations">
      <div className="ai-recommendations-header">
        <div className="header-content">
          <div className="header-icon">
            <Brain size={28} />
          </div>
          <div className="header-text">
            <h2>AI Finansal Asistan</h2>
            <p>Yapay zeka destekli kişiselleştirilmiş finansal öneriler ve analizler.</p>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="settings-button">
            <Settings size={16} />
            <span>AI Ayarları</span>
          </button>
          
          <button className="chat-button">
            <MessageCircle size={16} />
            <span>AI Chat</span>
          </button>
        </div>
      </div>
      
      {renderFilters()}
      {renderAiInsights()}
      {renderPredictiveAnalysis()}
      {renderPersonalizedTips()}
      {renderRecommendations()}
    </div>
  );
};

export default AiRecommendations;