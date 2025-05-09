// src/components/Forecasting/CashFlowForecast.jsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, BarChart } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, DollarSign, Plus, Minus, Settings, ChevronDown, AlertTriangle, CheckCircle } from 'lucide-react';
import './CashFlowForecast.css';

const CashFlowForecast = ({ apiService }) => {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Forecast ayarları
  const [forecastPeriod, setForecastPeriod] = useState('6months'); // 3months, 6months, 1year
  const [includeRecurring, setIncludeRecurring] = useState(true);
  const [includeVariables, setIncludeVariables] = useState(true);
  const [growthRate, setGrowthRate] = useState(0); // Yüzde olarak büyüme oranı
  
  // Expandable sections için state
  const [showSettings, setShowSettings] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Forecast senaryoları
  const [selectedScenario, setSelectedScenario] = useState('realistic');
  const scenarios = [
    { id: 'pessimistic', label: 'Kötümsü', icon: <TrendingDown size={16} />, color: '#e74c3c' },
    { id: 'realistic', label: 'Gerçekçi', icon: <TrendingUp size={16} />, color: '#3498db' },
    { id: 'optimistic', label: 'İyimser', icon: <CheckCircle size={16} />, color: '#27ae60' }
  ];

  useEffect(() => {
    fetchForecastData();
  }, [forecastPeriod, includeRecurring, includeVariables, growthRate, selectedScenario]);

  const fetchForecastData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Forecast parametrelerini hazırla
      const params = {
        period: forecastPeriod,
        includeRecurring,
        includeVariables,
        growthRate,
        scenario: selectedScenario
      };

      // API'den forecast verisini al
      const data = await apiService.forecasting.getForecast(params);
      setForecastData(data);
    } catch (err) {
      console.error('Forecast verileri alınırken hata:', err);
      setError('Nakit akışı tahminleri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Özet istatistikler
  const getSummaryStats = () => {
    if (!forecastData) return null;

    const endingBalance = forecastData.forecastData[forecastData.forecastData.length - 1]?.cumulativeBalance || 0;
    const startingBalance = forecastData.currentBalance || 0;
    const netChange = endingBalance - startingBalance;
    const avgMonthlyIncome = forecastData.forecastData.reduce((sum, item) => sum + (item.income || 0), 0) / forecastData.forecastData.length;
    const avgMonthlyExpense = forecastData.forecastData.reduce((sum, item) => sum + (item.expense || 0), 0) / forecastData.forecastData.length;
    const avgMonthlyNet = avgMonthlyIncome - avgMonthlyExpense;

    return {
      endingBalance,
      netChange,
      avgMonthlyIncome,
      avgMonthlyExpense,
      avgMonthlyNet,
      startingBalance
    };
  };

  const stats = getSummaryStats();

  // Dönemi açıklayıcı metin
  const getPeriodLabel = () => {
    switch (forecastPeriod) {
      case '3months': return '3 Ay';
      case '6months': return '6 Ay';
      case '1year': return '1 Yıl';
      default: return forecastPeriod;
    }
  };

  // Nakit akışı durumu belirleme
  const getCashFlowStatus = () => {
    if (!stats) return null;

    if (stats.avgMonthlyNet > 0) {
      return { status: 'positive', label: 'Pozitif Nakit Akışı', color: '#27ae60' };
    } else if (stats.avgMonthlyNet === 0) {
      return { status: 'neutral', label: 'Dengeli Nakit Akışı', color: '#3498db' };
    } else {
      return { status: 'negative', label: 'Negatif Nakit Akışı', color: '#e74c3c' };
    }
  };

  const cashFlowStatus = getCashFlowStatus();

  // Tooltip'ler için özelleştirilmiş format
  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'income' ? 'Gelir' :
               entry.dataKey === 'expense' ? 'Gider' :
               entry.dataKey === 'cumulativeBalance' ? 'Toplam Bakiye' :
               entry.dataKey === 'net' ? 'Net' : entry.dataKey}
              : ₺{Math.abs(entry.value).toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="cash-flow-forecast loading">
        <div className="loading-spinner"></div>
        <p>Nakit akışı tahminleri yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cash-flow-forecast error">
        <AlertTriangle size={24} />
        <p>{error}</p>
        <button onClick={fetchForecastData}>Tekrar Dene</button>
      </div>
    );
  }

  if (!forecastData) {
    return null;
  }

  return (
    <div className="cash-flow-forecast">
      <div className="forecast-header">
        <div className="forecast-title">
          <h2>Nakit Akışı Tahmini</h2>
          <p>{getPeriodLabel()} için {selectedScenario === 'realistic' ? 'gerçekçi' : selectedScenario === 'optimistic' ? 'iyimser' : 'kötümsü'} senaryo</p>
        </div>
        
        <div className="forecast-controls">
          {/* Senaryo seçimi */}
          <div className="scenario-selector">
            {scenarios.map(scenario => (
              <button
                key={scenario.id}
                className={`scenario-button ${selectedScenario === scenario.id ? 'active' : ''}`}
                onClick={() => setSelectedScenario(scenario.id)}
                style={{ '--scenario-color': scenario.color }}
              >
                {scenario.icon}
                <span>{scenario.label}</span>
              </button>
            ))}
          </div>
          
          {/* Settings toggle */}
          <button 
            className="settings-toggle"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={16} />
            <span>Ayarlar</span>
            <ChevronDown size={12} className={showSettings ? 'rotated' : ''} />
          </button>
        </div>
      </div>

      {/* Expandable settings */}
      {showSettings && (
        <div className="forecast-settings">
          <div className="settings-group">
            <label>Tahmin Dönemi</label>
            <select
              value={forecastPeriod}
              onChange={(e) => setForecastPeriod(e.target.value)}
            >
              <option value="3months">3 Ay</option>
              <option value="6months">6 Ay</option>
              <option value="1year">1 Yıl</option>
            </select>
          </div>
          
          <div className="settings-group">
            <label>
              <input
                type="checkbox"
                checked={includeRecurring}
                onChange={(e) => setIncludeRecurring(e.target.checked)}
              />
              Tekrarlayan işlemleri dahil et
            </label>
          </div>
          
          <div className="settings-group">
            <label>
              <input
                type="checkbox"
                checked={includeVariables}
                onChange={(e) => setIncludeVariables(e.target.checked)}
              />
              Değişken giderleri dahil et
            </label>
          </div>
          
          <div className="settings-group">
            <label>Büyüme Oranı (%)</label>
            <input
              type="number"
              value={growthRate}
              onChange={(e) => setGrowthRate(parseFloat(e.target.value) || 0)}
              step="0.1"
              min="-10"
              max="10"
            />
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {stats && (
        <div className="forecast-summary">
          <div className="summary-card">
            <div className="card-header">
              <h3>Mevcut Bakiye</h3>
              <DollarSign size={20} />
            </div>
            <div className="card-value">₺{stats.startingBalance.toFixed(2)}</div>
          </div>
          
          <div className="summary-card">
            <div className="card-header">
              <h3>Tahmini Son Bakiye</h3>
              <TrendingUp size={20} />
            </div>
            <div className="card-value">₺{stats.endingBalance.toFixed(2)}</div>
            <div className={`card-change ${stats.netChange >= 0 ? 'positive' : 'negative'}`}>
              {stats.netChange >= 0 ? '+' : ''}₺{stats.netChange.toFixed(2)}
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-header">
              <h3>Ortalama Aylık Net</h3>
              {stats.avgMonthlyNet >= 0 ? <Plus size={20} /> : <Minus size={20} />}
            </div>
            <div className={`card-value ${stats.avgMonthlyNet >= 0 ? 'positive' : 'negative'}`}>
              {stats.avgMonthlyNet >= 0 ? '+' : ''}₺{stats.avgMonthlyNet.toFixed(2)}
            </div>
          </div>
          
          <div className="summary-card status-card">
            <div className="card-header">
              <h3>Nakit Akışı Durumu</h3>
              {cashFlowStatus?.status === 'positive' ? <CheckCircle size={20} style={{ color: cashFlowStatus.color }} /> :
               cashFlowStatus?.status === 'negative' ? <AlertTriangle size={20} style={{ color: cashFlowStatus.color }} /> :
               <TrendingUp size={20} style={{ color: cashFlowStatus.color }} />}
            </div>
            <div className="card-value" style={{ color: cashFlowStatus?.color }}>
              {cashFlowStatus?.label}
            </div>
          </div>
        </div>
      )}

      {/* Main Chart */}
      <div className="forecast-charts">
        <div className="chart-container">
          <h3>Nakit Akışı Projeksiyonu</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={forecastData.forecastData}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#27ae60" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#27ae60" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e74c3c" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#e74c3c" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3498db" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3498db" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₺${value}`} />
              <Tooltip content={customTooltip} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="income" 
                stackId="1"
                name="Gelir"
                stroke="#27ae60" 
                fillOpacity={1}
                fill="url(#incomeGradient)"
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                stackId="2"
                name="Gider"
                stroke="#e74c3c" 
                fillOpacity={1}
                fill="url(#expenseGradient)"
              />
              <Line 
                type="monotone" 
                dataKey="cumulativeBalance" 
                name="Toplam Bakiye"
                stroke="#3498db" 
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-container">
          <h3>Aylık Net Nakit Akışı</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={forecastData.forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₺${value}`} />
              <Tooltip content={customTooltip} />
              <Bar 
                dataKey="net" 
                name="Net Nakit Akışı"
                fill={(data) => data.net >= 0 ? '#27ae60' : '#e74c3c'}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed breakdown */}
      <div className="forecast-details">
        <button 
          className="details-toggle"
          onClick={() => setShowDetails(!showDetails)}
        >
          <span>Detaylı Tahmin</span>
          <ChevronDown size={12} className={showDetails ? 'rotated' : ''} />
        </button>
        
        {showDetails && (
          <div className="details-table">
            <table>
              <thead>
                <tr>
                  <th>Ay</th>
                  <th>Başlangıç Bakiye</th>
                  <th>Gelir</th>
                  <th>Gider</th>
                  <th>Net Nakit Akışı</th>
                  <th>Bitiş Bakiye</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.forecastData.map((month, index) => (
                  <tr key={index}>
                    <td>{month.month}</td>
                    <td>₺{month.startingBalance.toFixed(2)}</td>
                    <td className="income">₺{month.income.toFixed(2)}</td>
                    <td className="expense">₺{month.expense.toFixed(2)}</td>
                    <td className={month.net >= 0 ? 'income' : 'expense'}>
                      {month.net >= 0 ? '+' : ''}₺{month.net.toFixed(2)}
                    </td>
                    <td>₺{month.cumulativeBalance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assumptions and Notes */}
      <div className="forecast-assumptions">
        <h3>Tahmin Varsayımları</h3>
        <ul>
          <li>Geçmiş 3 ay verilerine dayalı ortalama değerler kullanılmıştır</li>
          <li>Tekrarlayan işlemler belirtilen sıklıkta devam edecektir</li>
          <li>Büyüme oranı tüm kategorilere eşit oranda uygulanmıştır</li>
          <li>Mevsimsel etkiler göz önünde bulundurulmamıştır</li>
          <li>Bu tahminler yalnızca planlama amaçlıdır, garanti değildir</li>
        </ul>
      </div>
    </div>
  );
};

export default CashFlowForecast;