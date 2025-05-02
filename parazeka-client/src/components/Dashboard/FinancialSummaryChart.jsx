import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowDown, ArrowUp, RefreshCw, TrendingUp, PieChart as PieChartIcon, BarChart2 } from 'lucide-react';
import aiService from '../../services/aiService';
import './FinancialSummaryChart.css';

const FinancialSummaryChart = () => {
  const [activeChart, setActiveChart] = useState('spending');
  const [period, setPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [forecastData, setForecastData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [error, setError] = useState(null);

  const chartTypes = [
    { id: 'spending', icon: <BarChart2 size={18} />, label: 'Harcama Dağılımı' },
    { id: 'trend', icon: <TrendingUp size={18} />, label: 'Zaman Trendi' },
    { id: 'category', icon: <PieChartIcon size={18} />, label: 'Kategori Analizi' }
  ];

  const periodTypes = [
    { id: 'month', label: 'Bu Ay' },
    { id: 'quarter', label: 'Son 3 Ay' },
    { id: 'year', label: 'Yıllık' }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7300', '#8dd1e1'];

  useEffect(() => {
    fetchChartData();
  }, [activeChart, period]);

  const fetchChartData = async () => {
    setIsLoading(true);
    try {
      // Harcama tahmini verisi
      const forecastMonths = period === 'month' ? 1 : period === 'quarter' ? 3 : 12;
      const forecastPromises = [];
      
      for (let i = 1; i <= forecastMonths; i++) {
        forecastPromises.push(aiService.getMonthlyForecast(i));
      }
      
      const forecastResults = await Promise.all(forecastPromises);
      
      // Gelecek ay tahminlerini düzenle
      const forecastFormatted = forecastResults.map((amount, index) => {
        const today = new Date();
        const futureDate = new Date(today.getFullYear(), today.getMonth() + index + 1, 1);
        const monthName = futureDate.toLocaleString('tr-TR', { month: 'short' });
        
        return {
          name: monthName,
          amount: amount,
          projected: true
        };
      });
      
      setForecastData(forecastFormatted);
      
      // Mock veri oluştur (gerçek API verileri kullanılabilir)
      // Kategori verisi
      setCategoryData([
        { name: 'Market', value: 1250, percentage: 25 },
        { name: 'Kira', value: 2000, percentage: 40 },
        { name: 'Ulaşım', value: 500, percentage: 10 },
        { name: 'Faturalar', value: 750, percentage: 15 },
        { name: 'Eğlence', value: 300, percentage: 6 },
        { name: 'Diğer', value: 200, percentage: 4 }
      ]);
      
      // Trend verisi
      const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      const currentMonth = new Date().getMonth();
      
      let trendMonths = [];
      if (period === 'month') {
        // Son 4 hafta
        trendMonths = ['1. Hafta', '2. Hafta', '3. Hafta', '4. Hafta'];
      } else if (period === 'quarter') {
        // Son 3 ay
        trendMonths = Array(3).fill().map((_, i) => {
          const monthIndex = (currentMonth - i) >= 0 ? (currentMonth - i) : (12 + (currentMonth - i));
          return months[monthIndex];
        }).reverse();
      } else {
        // Son 12 ay
        trendMonths = Array(12).fill().map((_, i) => {
          const monthIndex = (currentMonth - i) >= 0 ? (currentMonth - i) : (12 + (currentMonth - i));
          return months[monthIndex];
        }).reverse();
      }
      
      const trendDataFormatted = trendMonths.map((month, index) => {
        const baseAmount = 5000;
        const randomVariation = Math.random() * 1000 - 500; // -500 ile +500 arası rastgele değer
        
        return {
          name: month,
          gelir: baseAmount + (index * 100) + (Math.random() * 200),
          gider: baseAmount - (index * 50) + randomVariation
        };
      });
      
      setTrendData(trendDataFormatted);
      setError(null);
    } catch (err) {
      console.error('Grafik verileri alınırken hata:', err);
      setError('Grafik verileri yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="chart-loading">
          <RefreshCw size={24} className="loading-icon" />
          <p>Veriler yükleniyor...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="chart-error">
          <p>{error}</p>
          <button onClick={fetchChartData}>Tekrar Dene</button>
        </div>
      );
    }
    
    switch (activeChart) {
      case 'spending':
        return renderSpendingChart();
      case 'trend':
        return renderTrendChart();
      case 'category':
        return renderCategoryChart();
      default:
        return null;
    }
  };

  const renderSpendingChart = () => {
    return (
      <div className="chart-container">
        <h3>Harcama Dağılımı</h3>
        <div className="chart-description">
          <p>Son dönem harcamalarınızın kategorilere göre dağılımı</p>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`₺${value}`, 'Tutar']}
              labelFormatter={(label) => `Kategori: ${label}`}
            />
            <Legend />
            <Bar dataKey="value" name="Harcama Tutarı" fill="#4a86e8" />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="chart-insights">
          <div className="insight-item">
            <div className="insight-icon">
              <ArrowUp size={16} color="#e74c3c" />
            </div>
            <div className="insight-text">
              <span>En Yüksek Harcama</span>
              <strong>₺{Math.max(...categoryData.map(item => item.value))} (Kira)</strong>
            </div>
          </div>
          
          <div className="insight-item">
            <div className="insight-icon">
              <ArrowDown size={16} color="#2ecc71" />
            </div>
            <div className="insight-text">
              <span>En Düşük Harcama</span>
              <strong>₺{Math.min(...categoryData.map(item => item.value))} (Diğer)</strong>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTrendChart = () => {
    return (
      <div className="chart-container">
        <h3>Gelir ve Gider Trendi</h3>
        <div className="chart-description">
          <p>Zamana göre gelir ve giderlerinizin değişimi</p>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`₺${value}`, '']}
            />
            <Legend />
            <Line type="monotone" dataKey="gelir" name="Gelir" stroke="#2ecc71" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="gider" name="Gider" stroke="#e74c3c" />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="chart-insights">
          <div className="insight-item">
            <div className="insight-icon">
              <TrendingUp size={16} color="#2ecc71" />
            </div>
            <div className="insight-text">
              <span>Gelir Trendi</span>
              <strong>%{((trendData[trendData.length - 1]?.gelir / trendData[0]?.gelir) * 100 - 100).toFixed(1)} Artış</strong>
            </div>
          </div>
          
          <div className="insight-item">
            <div className="insight-icon">
              <TrendingUp size={16} color={trendData[trendData.length - 1]?.gider > trendData[0]?.gider ? "#e74c3c" : "#2ecc71"} />
            </div>
            <div className="insight-text">
              <span>Gider Trendi</span>
              <strong>%{((trendData[trendData.length - 1]?.gider / trendData[0]?.gider) * 100 - 100).toFixed(1)} {trendData[trendData.length - 1]?.gider > trendData[0]?.gider ? "Artış" : "Azalış"}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryChart = () => {
    return (
      <div className="chart-container">
        <h3>Kategori Analizi</h3>
        <div className="chart-description">
          <p>Harcamalarınızın kategorilere göre dağılımı</p>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`₺${value}`, 'Tutar']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="chart-insights">
          <div className="insight-item">
            <div className="insight-icon">
              <PieChartIcon size={16} color="#4a86e8" />
            </div>
            <div className="insight-text">
              <span>En Büyük Kategori</span>
              <strong>Kira (%{categoryData.sort((a, b) => b.percentage - a.percentage)[0]?.percentage})</strong>
            </div>
          </div>
          
          <div className="insight-item">
            <div className="insight-icon">
              <BarChart2 size={16} color="#4a86e8" />
            </div>
            <div className="insight-text">
              <span>Toplam Harcama</span>
              <strong>₺{categoryData.reduce((sum, item) => sum + item.value, 0)}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="financial-summary-chart">
      <div className="chart-controls">
        <div className="chart-type-selector">
          {chartTypes.map((type) => (
            <button
              key={type.id}
              className={`chart-type-button ${activeChart === type.id ? 'active' : ''}`}
              onClick={() => setActiveChart(type.id)}
            >
              {type.icon}
              <span>{type.label}</span>
            </button>
          ))}
        </div>
        
        <div className="chart-period-selector">
          {periodTypes.map((type) => (
            <button
              key={type.id}
              className={`chart-period-button ${period === type.id ? 'active' : ''}`}
              onClick={() => setPeriod(type.id)}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="chart-content">
        {renderChart()}
      </div>
      
      {forecastData && activeChart === 'trend' && (
        <div className="forecast-section">
          <h3>AI Harcama Tahmini</h3>
          <div className="forecast-description">
            <p>AI tabanlı harcama tahminleri</p>
          </div>
          
          <div className="forecast-cards">
            {forecastData.map((item, index) => (
              <div key={index} className="forecast-card">
                <h4>{item.name}</h4>
                <p className="forecast-amount">₺{item.amount.toFixed(2)}</p>
                <div className="forecast-trend">
                  {index > 0 && (
                    <>
                      {item.amount > forecastData[index - 1].amount ? (
                        <div className="trend-up">
                          <ArrowUp size={14} />
                          <span>%{((item.amount / forecastData[index - 1].amount) * 100 - 100).toFixed(1)} Artış</span>
                        </div>
                      ) : (
                        <div className="trend-down">
                          <ArrowDown size={14} />
                          <span>%{((forecastData[index - 1].amount / item.amount) * 100 - 100).toFixed(1)} Azalış</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialSummaryChart;