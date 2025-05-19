// src/components/Goals/GoalManager.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, Edit, Trash2, Search, Filter, Target, Calendar, 
  TrendingUp, DollarSign, AlertCircle, RefreshCw, Clock,
  ChevronRight, CheckCircle, ArrowUpCircle, Sliders, BarChart
} from 'lucide-react';
import { 
  LineChart, Line, CartesianGrid, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import GoalForm from './GoalForm';
import './GoalManager.css';

const GoalManager = ({ apiService }) => {
  // Ana state'ler
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state'leri
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  
  // Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, completed
  const [typeFilter, setTypeFilter] = useState('all'); // all, savings, debt, purchase, other
  const [expandedGoalId, setExpandedGoalId] = useState(null);
  
  // İstatistik state'leri
  const [goalStats, setGoalStats] = useState(null);
  
  // Veri yükleme fonksiyonları
  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Hedef verilerini çek
      const goalsData = await apiService.goals.getAll();
      setGoals(goalsData);
      
      // İstatistik verilerini çek
      const statsData = await apiService.goals.getStats();
      setGoalStats(statsData);
      
    } catch (err) {
      console.error('Hedef verileri yüklenirken hata:', err);
      setError('Hedef verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [apiService]);
  
  // İlk yükleme
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);
  
  // Filtrelenmiş hedefleri hesapla
  const filteredGoals = useMemo(() => {
    let result = [...goals];
    
    // Arama filtresi
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(goal => 
        goal.name.toLowerCase().includes(searchTermLower) ||
        goal.description?.toLowerCase().includes(searchTermLower)
      );
    }
    
    // Durum filtresi
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        result = result.filter(goal => !goal.isCompleted);
      } else if (statusFilter === 'completed') {
        result = result.filter(goal => goal.isCompleted);
      }
    }
    
    // Tür filtresi
    if (typeFilter !== 'all') {
      result = result.filter(goal => goal.type === typeFilter);
    }
    
    // Tarihe göre sırala (yakın tarihli hedefler önce)
    result.sort((a, b) => {
      // Önce tamamlanmış hedefleri sırala
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      
      // Sonra bitiş tarihine göre sırala
      return new Date(a.targetDate) - new Date(b.targetDate);
    });
    
    return result;
  }, [goals, searchTerm, statusFilter, typeFilter]);
  
  // İşlem fonksiyonları
  const handleAddGoal = useCallback(() => {
    setEditingGoal(null);
    setShowForm(true);
  }, []);
  
  const handleEditGoal = useCallback((goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  }, []);
  
  const handleDeleteGoal = useCallback(async (goalId) => {
    if (!window.confirm('Bu hedefi silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      await apiService.goals.delete(goalId);
      await fetchGoals();
    } catch (err) {
      console.error('Hedef silinirken hata:', err);
      alert('Hedef silinemedi. Lütfen tekrar deneyin.');
    }
  }, [apiService, fetchGoals]);
  
  const handleFormSubmit = useCallback(async (goalData) => {
    try {
      if (editingGoal) {
        await apiService.goals.update(editingGoal.id, goalData);
      } else {
        await apiService.goals.create(goalData);
      }
      
      setShowForm(false);
      await fetchGoals();
      return true;
    } catch (err) {
      console.error('Hedef kaydedilirken hata:', err);
      throw err;
    }
  }, [apiService, editingGoal, fetchGoals]);
  
  const handleToggleExpand = useCallback((goalId) => {
    setExpandedGoalId(prev => prev === goalId ? null : goalId);
  }, []);
  
  const handleToggleComplete = useCallback(async (goal) => {
    try {
      const updatedGoal = { ...goal, isCompleted: !goal.isCompleted };
      await apiService.goals.update(goal.id, updatedGoal);
      await fetchGoals();
    } catch (err) {
      console.error('Hedef durumu güncellenirken hata:', err);
      alert('Hedef durumu güncellenemedi. Lütfen tekrar deneyin.');
    }
  }, [apiService, fetchGoals]);
  
  const handleContribute = useCallback(async (goal, amount) => {
    try {
      const updatedGoal = { 
        ...goal, 
        currentAmount: goal.currentAmount + amount 
      };
      
      // Hedef tutara ulaşıldıysa hedefi tamamla
      if (updatedGoal.currentAmount >= goal.targetAmount) {
        updatedGoal.isCompleted = true;
      }
      
      await apiService.goals.update(goal.id, updatedGoal);
      await fetchGoals();
    } catch (err) {
      console.error('Hedef katkısı eklenirken hata:', err);
      alert('Katkı eklenemedi. Lütfen tekrar deneyin.');
    }
  }, [apiService, fetchGoals]);
  
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);
  
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  }, []);
  
  // Hedef ilerleme yüzdesini hesapla
  const calculateProgress = useCallback((goal) => {
    if (goal.targetAmount <= 0) return 0;
    return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  }, []);
  
  // Hedef durumuna göre sınıf belirle
  const getStatusClass = useCallback((goal) => {
    if (goal.isCompleted) return 'completed';
    
    const progress = calculateProgress(goal);
    const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return 'overdue';
    if (progress >= 90) return 'nearly-complete';
    if (progress >= 50) return 'on-track';
    if (daysLeft < 30) return 'urgent';
    
    return 'in-progress';
  }, [calculateProgress]);
  
  // Hedef tipi adını formatla
  const formatGoalType = useCallback((type) => {
    switch (type) {
      case 'savings':
        return 'Tasarruf';
      case 'debt':
        return 'Borç Ödeme';
      case 'purchase':
        return 'Alım';
      case 'other':
        return 'Diğer';
      default:
        return type;
    }
  }, []);
  
  // Hedef durumunu formatla
  const formatGoalStatus = useCallback((goal) => {
    if (goal.isCompleted) return 'Tamamlandı';
    
    const progress = calculateProgress(goal);
    const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return 'Süresi Geçti';
    if (progress >= 90) return 'Neredeyse Tamamlandı';
    if (progress >= 50) return 'İyi Gidiyor';
    if (daysLeft < 30) return 'Acil';
    
    return 'Devam Ediyor';
  }, [calculateProgress]);
  
  // Hedefe kalan günü hesapla
  const getDaysLeft = useCallback((targetDate) => {
    const daysLeft = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  }, []);
  
  // Günlük katkı miktarını hesapla
  const calculateDailyContribution = useCallback((goal) => {
    const daysLeft = getDaysLeft(goal.targetDate);
    if (daysLeft <= 0) return 0;
    
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    return remainingAmount / daysLeft;
  }, [getDaysLeft]);
  
  // Render fonksiyonları
  const renderGoalStats = () => {
    if (!goalStats) return null;
    
    const { 
      activeGoals, completedGoals, totalSaved, 
      nearestGoal, highestPriorityGoal 
    } = goalStats;
    
    return (
      <div className="goal-stats">
        <div className="stats-card">
          <div className="stats-header">
            <h3>Aktif Hedefler</h3>
            <Target size={20} />
          </div>
          <div className="stats-value">{activeGoals}</div>
          <div className="stats-footer">
            <span>{completedGoals} hedef tamamlandı</span>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-header">
            <h3>Toplam Biriktirilen</h3>
            <ArrowUpCircle size={20} />
          </div>
          <div className="stats-value">{formatCurrency(totalSaved)}</div>
          <div className="stats-footer">
            <span>Tüm hedeflerinizde</span>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-header">
            <h3>En Yakın Hedef</h3>
            <Calendar size={20} />
          </div>
          <div className="stats-value">
            {nearestGoal ? (
              nearestGoal.name
            ) : (
              'Yok'
            )}
          </div>
          <div className="stats-footer">
            {nearestGoal ? (
              <span>{getDaysLeft(nearestGoal.targetDate)} gün kaldı</span>
            ) : (
              <span>Aktif hedef bulunmuyor</span>
            )}
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-header">
            <h3>En Yüksek Öncelik</h3>
            <TrendingUp size={20} />
          </div>
          <div className="stats-value">
            {highestPriorityGoal ? (
              highestPriorityGoal.name
            ) : (
              'Yok'
            )}
          </div>
          <div className="stats-footer">
            {highestPriorityGoal ? (
              <span>%{calculateProgress(highestPriorityGoal)} tamamlandı</span>
            ) : (
              <span>Yüksek öncelikli hedef yok</span>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const renderFilters = () => (
    <div className="goal-filters">
      <div className="search-field">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Hedef ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="filter-container">
        <div className="filter-group">
          <div className="filter-label">
            <Filter size={16} />
            <span>Durum:</span>
          </div>
          <div className="filter-options">
            <button
              className={`filter-option ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              Tümü
            </button>
            <button
              className={`filter-option ${statusFilter === 'active' ? 'active' : ''}`}
              onClick={() => setStatusFilter('active')}
            >
              Aktif
            </button>
            <button
              className={`filter-option ${statusFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('completed')}
            >
              Tamamlanan
            </button>
          </div>
        </div>
        
        <div className="filter-group">
          <div className="filter-label">
            <Filter size={16} />
            <span>Tür:</span>
          </div>
          <div className="filter-options">
            <button
              className={`filter-option ${typeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTypeFilter('all')}
            >
              Tümü
            </button>
            <button
              className={`filter-option ${typeFilter === 'savings' ? 'active' : ''}`}
              onClick={() => setTypeFilter('savings')}
            >
              Tasarruf
            </button>
            <button
              className={`filter-option ${typeFilter === 'debt' ? 'active' : ''}`}
              onClick={() => setTypeFilter('debt')}
            >
              Borç Ödeme
            </button>
            <button
              className={`filter-option ${typeFilter === 'purchase' ? 'active' : ''}`}
              onClick={() => setTypeFilter('purchase')}
            >
              Alım
            </button>
            <button
              className={`filter-option ${typeFilter === 'other' ? 'active' : ''}`}
              onClick={() => setTypeFilter('other')}
            >
              Diğer
            </button>
          </div>
        </div>
      </div>
      
      <button
        className="btn-add-goal"
        onClick={handleAddGoal}
      >
        <Plus size={16} />
        <span>Yeni Hedef</span>
      </button>
    </div>
  );
  
  const renderGoalList = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Hedefler yükleniyor...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="error-state">
          <AlertCircle size={24} />
          <p>{error}</p>
          <button onClick={fetchGoals} className="retry-button">
            <RefreshCw size={16} />
            <span>Tekrar Dene</span>
          </button>
        </div>
      );
    }
    
    if (filteredGoals.length === 0) {
      return (
        <div className="empty-state">
          <Target size={48} />
          <h3>Hedef bulunamadı</h3>
          <p>
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
              ? 'Arama kriterlerinize uygun hedef bulunmuyor.' 
              : 'Henüz hedef oluşturmamışsınız. Yeni hedef ekleyerek başlayın.'}
          </p>
          {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? (
            <button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
              className="clear-filters-button"
            >
              Filtreleri Temizle
            </button>
          ) : (
            <button 
              onClick={handleAddGoal}
              className="add-goal-button"
            >
              <Plus size={16} />
              <span>Yeni Hedef</span>
            </button>
          )}
        </div>
      );
    }
    
    return (
      <div className="goal-list">
        {filteredGoals.map(goal => {
          const progress = calculateProgress(goal);
          const statusClass = getStatusClass(goal);
          const daysLeft = getDaysLeft(goal.targetDate);
          
          return (
            <div key={goal.id} className={`goal-card ${statusClass}`}>
              <div className="goal-header">
                <div className="goal-title-area">
                  <div className="goal-name-container">
                    <button
                      className={`goal-complete-checkbox ${goal.isCompleted ? 'checked' : ''}`}
                      onClick={() => handleToggleComplete(goal)}
                      title={goal.isCompleted ? 'Hedefi tamamlanmadı olarak işaretle' : 'Hedefi tamamlandı olarak işaretle'}
                    >
                      {goal.isCompleted && <CheckCircle size={16} />}
                    </button>
                    
                    <h3 className="goal-name">
                      {goal.name}
                    </h3>
                    
                    <span className={`goal-type-badge ${goal.type}`}>
                      {formatGoalType(goal.type)}
                    </span>
                  </div>
                  
                  <div className="goal-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEditGoal(goal)}
                      title="Düzenle"
                      aria-label="Hedefi düzenle"
                      disabled={goal.isCompleted}
                    >
                      <Edit size={16} />
                    </button>
                    
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteGoal(goal.id)}
                      title="Sil"
                      aria-label="Hedefi sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {goal.description && (
                  <p className="goal-description">{goal.description}</p>
                )}
                
                <div className="goal-progress-container">
                  <div className="progress-stats">
                    <div className="progress-amount">
                      <span className="current-amount">{formatCurrency(goal.currentAmount)}</span>
                      <span className="amount-separator">/</span>
                      <span className="target-amount">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className="progress-percentage">{progress}%</div>
                  </div>
                  
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="goal-meta">
                  <div className="goal-deadline">
                    <Clock size={14} />
                    <span>
                      {goal.isCompleted ? (
                        'Tamamlandı'
                      ) : daysLeft < 0 ? (
                        `Süresi ${Math.abs(daysLeft)} gün geçti`
                      ) : (
                        `${daysLeft} gün kaldı (${formatDate(goal.targetDate)})`
                      )}
                    </span>
                  </div>
                  
                  <span className={`goal-status ${statusClass}`}>
                    {formatGoalStatus(goal)}
                  </span>
                </div>
              </div>
              
              <div className="goal-footer">
                {!goal.isCompleted && (
                  <div className="goal-contribution">
                    <label htmlFor={`contribute-${goal.id}`}>Katkı Ekle:</label>
                    <div className="contribution-controls">
                      <div className="contribution-input-group">
                        <DollarSign size={16} className="currency-icon" />
                        <input
                          type="number"
                          id={`contribute-${goal.id}`}
                          min="0"
                          step="100"
                          placeholder="Miktar"
                          className="contribution-input"
                        />
                      </div>
                      <button
                        className="contribution-btn"
                        onClick={() => {
                          const input = document.getElementById(`contribute-${goal.id}`);
                          const amount = parseFloat(input.value);
                          if (amount > 0) {
                            handleContribute(goal, amount);
                            input.value = '';
                          }
                        }}
                      >
                        <Plus size={14} />
                        <span>Ekle</span>
                      </button>
                    </div>
                  </div>
                )}
                
                <button
                  className="toggle-details-btn"
                  onClick={() => handleToggleExpand(goal.id)}
                  aria-expanded={expandedGoalId === goal.id}
                  aria-controls={`goal-details-${goal.id}`}
                >
                  {expandedGoalId === goal.id ? 'Detayları Gizle' : 'Detayları Göster'}
                  <ChevronRight 
                    size={16} 
                    className={expandedGoalId === goal.id ? 'rotate-90' : ''} 
                  />
                </button>
              </div>
              
              {expandedGoalId === goal.id && (
                <div id={`goal-details-${goal.id}`} className="goal-details">
                  <div className="goal-details-grid">
                    <div className="goal-detail-card">
                      <h4>Hedef Özeti</h4>
                      <div className="detail-row">
                        <span className="detail-label">Oluşturulma:</span>
                        <span className="detail-value">{formatDate(goal.createdAt)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Son Güncelleme:</span>
                        <span className="detail-value">{formatDate(goal.updatedAt)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Öncelik:</span>
                        <span className="detail-value priority-badge">
                          {['Düşük', 'Orta', 'Yüksek'][goal.priority - 1]}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Kalan Tutar:</span>
                        <span className="detail-value">{formatCurrency(goal.targetAmount - goal.currentAmount)}</span>
                      </div>
                      {!goal.isCompleted && daysLeft > 0 && (
                        <div className="detail-row">
                          <span className="detail-label">Günlük Katkı:</span>
                          <span className="detail-value">{formatCurrency(calculateDailyContribution(goal))}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="goal-detail-card">
                      <h4>İlerleme Grafiği</h4>
                      <div className="goal-chart">
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart
                            data={goal.progressHistory || []}
                            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                          >
                            <Line 
                              type="monotone" 
                              dataKey="amount" 
                              stroke="#4a86e8" 
                              strokeWidth={2} 
                            />
                            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={date => {
                                const d = new Date(date);
                                return `${d.getDate()}.${d.getMonth() + 1}`;
                              }}
                            />
                            <YAxis 
                              tickFormatter={value => `₺${value}`}
                            />
                            <Tooltip 
                              formatter={value => [`₺${value}`, 'Tutar']}
                              labelFormatter={date => new Date(date).toLocaleDateString('tr-TR')}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="goal-detail-card full-width">
                      <h4>Tahmini Tamamlanma</h4>
                      <div className="projection-info">
                        {goal.isCompleted ? (
                          <p>Bu hedef başarıyla tamamlandı.</p>
                        ) : goal.progressHistory && goal.progressHistory.length >= 2 ? (
                          <>
                            <div className="projection-stats">
                              <div className="projection-stat">
                                <span className="stat-label">Tahmini Tamamlanma:</span>
                                <span className="stat-value">{formatDate(goal.estimatedCompletionDate)}</span>
                              </div>
                              <div className="projection-stat">
                                <span className="stat-label">Ortalama Katkı (Aylık):</span>
                                <span className="stat-value">{formatCurrency(goal.averageMonthlyContribution)}</span>
                              </div>
                              <div className="projection-stat">
                                <span className="stat-label">Hedef vs. Gerçekleşen:</span>
                                <span className="stat-value">
                                  {goal.onTrack === true ? (
                                    <span className="on-track">Planlandığı Gibi</span>
                                  ) : goal.onTrack === false ? (
                                    <span className="off-track">Gecikmeli</span>
                                  ) : (
                                    'Yeterli veri yok'
                                  )}
                                </span>
                              </div>
                            </div>
                            
                            <div className="projection-chart">
                              <ResponsiveContainer width="100%" height={200}>
                                <BarChart
                                  data={[
                                    { name: 'Gereken', value: goal.targetAmount },
                                    { name: 'Mevcut', value: goal.currentAmount },
                                    { name: 'Tahmini', value: Math.min(goal.targetAmount, goal.projectedAmount || 0) }
                                  ]}
                                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis tickFormatter={value => `₺${value}`} />
                                  <Tooltip formatter={value => [`₺${value}`, '']} />
                                  <Bar dataKey="value" fill="#4a86e8" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </>
                        ) : (
                          <p>Tahmin için yeterli veri bulunmuyor. Düzenli katkılar eklendikçe tahminler gösterilecektir.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  // Ana render fonksiyonu
  return (
    <div className="goal-manager">
      <div className="goal-manager-header">
        <div>
          <h2>Finansal Hedefler</h2>
          <p>Finansal hedeflerinizi belirleyin ve ilerlemenizi takip edin.</p>
        </div>
        
        <div className="header-actions">
          <a href="/reports/goals" className="view-reports-link">
            <BarChart size={16} />
            <span>Hedef Raporları</span>
          </a>
          <a href="/ai/goal-recommendations" className="ai-recommendations-link">
            <Sliders size={16} />
            <span>Hedef Önerileri</span>
          </a>
        </div>
      </div>
      
      {renderGoalStats()}
      {renderFilters()}
      {renderGoalList()}
      
      {showForm && (
        <GoalForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
          goal={editingGoal}
        />
      )}
    </div>
  );
};

export default GoalManager;