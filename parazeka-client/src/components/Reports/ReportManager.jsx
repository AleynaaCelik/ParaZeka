// src/components/Reports/ReportManager.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  PieChart as PieIcon, BarChart as BarChartIcon, Calendar, Download, 
  Filter, ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, 
  RefreshCw, AlertCircle, DollarSign, Share2, FileText
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer
} from 'recharts';
import DateRangePicker from './DateRangePicker';
import './ReportManager.css';

const ReportManager = ({ apiService }) => {
  // Ana state'ler
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Aktif rapor tipini takip et
  const [activeReport, setActiveReport] = useState('overview'); // overview, income-expense, categories, budgets, goals
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 5)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  // Filtreleme state'leri
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  
  // Verileri çekme fonksiyonu
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        categoryIds: categoryFilter.length > 0 ? categoryFilter.join(',') : undefined
      };
      
      // Kategorileri çek
      const categories = await apiService.categories.getAll();
      setCategoryData(categories);
      
      // Seçilen rapora göre verileri çek
      let data;
      
      switch (activeReport) {
        case 'overview':
          data = await apiService.reports.getOverviewReport(params);
          break;
        case 'income-expense':
          data = await apiService.reports.getIncomeExpenseReport(params);
          break;
        case 'categories':
          data = await apiService.reports.getCategoryReport(params);
          break;
        case 'budgets':
          data = await apiService.reports.getBudgetReport(params);
          break;
        case 'goals':
          data = await apiService.reports.getGoalReport(params);
          break;
        default:
          data = await apiService.reports.getOverviewReport(params);
      }
      
      setReportData(data);
    } catch (err) {
      console.error('Rapor verileri yüklenirken hata:', err);
      setError('Rapor verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [apiService, activeReport, dateRange, categoryFilter]);
  
  // İlk yükleme ve filtre değişikliklerinde verileri yeniden çek
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);
  
  // Rapor tipini değiştir
  const handleReportChange = (reportType) => {
    setActiveReport(reportType);
    // Kategori filtresini yeni rapor türüne göre sıfırla
    setCategoryFilter([]);
  };
  
  // Tarih aralığını değiştir
  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };
  
  // Kategori filtresini değiştir
  const handleCategoryFilterChange = (categoryId) => {
    setCategoryFilter(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };
  
  // Raporları dışa aktar
  const handleExportReport = useCallback(() => {
    if (!reportData) return;
    
    const reportTypeNames = {
      'overview': 'Genel Bakış',
      'income-expense': 'Gelir-Gider',
      'categories': 'Kategori',
      'budgets': 'Bütçe',
      'goals': 'Hedef'
    };
    
    // CSV formatına dönüştür
    let csvContent = '';
    let fileName = '';
    
    if (activeReport === 'overview') {
      // Genel bakış raporu için CSV formatı
      csvContent = 'Metrik,Değer\n';
      csvContent += `Toplam Gelir,${reportData.totalIncome}\n`;
      csvContent += `Toplam Gider,${reportData.totalExpense}\n`;
      csvContent += `Net Bakiye,${reportData.netBalance}\n`;
      csvContent += `Tasarruf Oranı,${reportData.savingsRate}\n`;
      fileName = 'ParaZeka_Genel_Bakış_Raporu.csv';
    } else if (activeReport === 'income-expense') {
      // Gelir-Gider raporu için CSV formatı
      csvContent = 'Tarih,Gelir,Gider,Bakiye\n';
      reportData.timeSeriesData.forEach(item => {
        csvContent += `${item.date},${item.income},${item.expense},${item.balance}\n`;
      });
      fileName = 'ParaZeka_Gelir_Gider_Raporu.csv';
    } else if (activeReport === 'categories') {
      // Kategori raporu için CSV formatı
      csvContent = 'Kategori,Tür,Tutar,Yüzde\n';
      reportData.categoryData.forEach(item => {
        csvContent += `${item.name},${item.type},${item.amount},${item.percentage}\n`;
      });
      fileName = 'ParaZeka_Kategori_Raporu.csv';
    } else {
      // Diğer rapor tipleri için basit format
      csvContent = 'Bu rapor türü için dışa aktarma henüz desteklenmiyor.';
      fileName = `ParaZeka_${reportTypeNames[activeReport]}_Raporu.csv`;
    }
    
    // CSV dosyasını indir
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [reportData, activeReport]);
  
  // Raporları paylaş
  const handleShareReport = useCallback(() => {
    // Şimdilik sadece bir uyarı göster
    alert('Rapor paylaşma özelliği yakında eklenecek!');
    
    // Gerçek uygulamada burada e-posta gönderme veya bağlantı oluşturma işlevi olacak
  }, []);
  
  // Para birimi formatla
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);
  
  // Yüzde formatla
  const formatPercentage = useCallback((value) => {
    return `%${(value * 100).toFixed(1)}`;
  }, []);
  
  // Tarih formatla
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  }, []);
  
  // Render fonksiyonları
  const renderReportMenu = () => (
    <div className="report-menu">
      <button 
        className={`report-menu-item ${activeReport === 'overview' ? 'active' : ''}`}
        onClick={() => handleReportChange('overview')}
      >
        <BarChartIcon size={18} />
        <span>Genel Bakış</span>
      </button>
      
      <button 
        className={`report-menu-item ${activeReport === 'income-expense' ? 'active' : ''}`}
        onClick={() => handleReportChange('income-expense')}
      >
        <TrendingUp size={18} />
        <span>Gelir-Gider</span>
      </button>
      
      <button 
        className={`report-menu-item ${activeReport === 'categories' ? 'active' : ''}`}
        onClick={() => handleReportChange('categories')}
      >
        <PieIcon size={18} />
        <span>Kategoriler</span>
      </button>
      
      <button 
        className={`report-menu-item ${activeReport === 'budgets' ? 'active' : ''}`}
        onClick={() => handleReportChange('budgets')}
      >
        <DollarSign size={18} />
        <span>Bütçeler</span>
      </button>
      
      <button 
        className={`report-menu-item ${activeReport === 'goals' ? 'active' : ''}`}
        onClick={() => handleReportChange('goals')}
      >
        <Target size={18} />
        <span>Hedefler</span>
      </button>
    </div>
  );
  
  const renderFilters = () => (
    <div className="report-filters">
      <div className="date-range-filter">
        <label>Tarih Aralığı</label>
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={handleDateRangeChange}
        />
      </div>
      
      {(activeReport === 'categories' || activeReport === 'income-expense') && (
        <div className="category-filter">
          <label>
            <Filter size={14} />
            <span>Kategori Filtresi</span>
          </label>
          <div className="category-filter-dropdown">
            <button className="filter-button">
              {categoryFilter.length > 0 
                ? `${categoryFilter.length} kategori seçili` 
                : 'Tüm Kategoriler'}
              <span className="dropdown-arrow">▼</span>
            </button>
            
            <div className="dropdown-menu">
              {categoryData.map(category => (
                <label key={category.id} className="category-checkbox">
                  <input
                    type="checkbox"
                    checked={categoryFilter.includes(category.id)}
                    onChange={() => handleCategoryFilterChange(category.id)}
                  />
                  <span className="checkbox-custom"></span>
                  <div className="category-color" style={{ backgroundColor: category.color }}></div>
                  <span className="category-name">{category.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="report-actions">
        <button className="export-button" onClick={handleExportReport}>
          <Download size={16} />
          <span>Dışa Aktar</span>
        </button>
        
        <button className="share-button" onClick={handleShareReport}>
          <Share2 size={16} />
          <span>Paylaş</span>
        </button>
      </div>
    </div>
  );
  
  const renderOverviewReport = () => {
    if (!reportData) return null;
    
    const { 
      totalIncome, totalExpense, netBalance, savingsRate,
      transactionCount, averageExpense, topCategories,
      monthlyTrend
    } = reportData;
    
    return (
      <div className="overview-report">
        <div className="report-summary">
          <div className="summary-card income">
            <div className="summary-icon">
              <ArrowUpCircle size={24} />
            </div>
            <div className="summary-content">
              <h3>Toplam Gelir</h3>
              <div className="summary-value">{formatCurrency(totalIncome)}</div>
              <div className="summary-change">
                {monthlyTrend.incomeChange >= 0 ? (
                  <span className="change-up">
                    <TrendingUp size={14} />
                    {formatPercentage(monthlyTrend.incomeChange)} ↑
                  </span>
                ) : (
                  <span className="change-down">
                    <TrendingDown size={14} />
                    {formatPercentage(Math.abs(monthlyTrend.incomeChange))} ↓
                  </span>
                )}
                <span className="change-period">son aya göre</span>
              </div>
            </div>
          </div>
          
          <div className="summary-card expense">
            <div className="summary-icon">
              <ArrowDownCircle size={24} />
            </div>
            <div className="summary-content">
              <h3>Toplam Gider</h3>
              <div className="summary-value">{formatCurrency(totalExpense)}</div>
              <div className="summary-change">
                {monthlyTrend.expenseChange <= 0 ? (
                  <span className="change-up">
                    <TrendingDown size={14} />
                    {formatPercentage(Math.abs(monthlyTrend.expenseChange))} ↓
                  </span>
                ) : (
                  <span className="change-down">
                    <TrendingUp size={14} />
                    {formatPercentage(monthlyTrend.expenseChange)} ↑
                  </span>
                )}
                <span className="change-period">son aya göre</span>
              </div>
            </div>
          </div>
          
          <div className="summary-card balance">
            <div className="summary-icon">
              <DollarSign size={24} />
            </div>
            <div className="summary-content">
              <h3>Net Bakiye</h3>
              <div className="summary-value">{formatCurrency(netBalance)}</div>
              <div className="saving-rate">
                <span>Tasarruf Oranı:</span>
                <span className="rate-value">{formatPercentage(savingsRate)}</span>
              </div>
            </div>
          </div>
          
          <div className="summary-card metrics">
            <div className="summary-icon">
              <BarChartIcon size={24} />
            </div>
            <div className="summary-content">
              <h3>İşlemler</h3>
              <div className="summary-value">{transactionCount} işlem</div>
              <div className="average-expense">
                <span>Ortalama Harcama:</span>
                <span className="avg-value">{formatCurrency(averageExpense)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="report-details">
          <div className="chart-container">
            <h3 className="chart-title">
              <TrendingUp size={18} />
              Aylık Gelir-Gider Trendi
            </h3>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={monthlyTrend.data}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#27ae60" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#27ae60" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e74c3c" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#e74c3c" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return `${d.getMonth() + 1}/${d.getFullYear().toString().substr(2, 2)}`;
                    }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `₺${value / 1000}K`} 
                  />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    name="Gelir"
                    stroke="#27ae60" 
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expense" 
                    name="Gider"
                    stroke="#e74c3c" 
                    fillOpacity={1} 
                    fill="url(#colorExpense)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="chart-container">
            <h3 className="chart-title">
              <PieIcon size={18} />
              Kategori Dağılımı
            </h3>
            <div className="chart-content with-padding">
              <div className="top-categories">
                <h4>En Yüksek Harcama Kategorileri</h4>
                <div className="categories-list">
                  {topCategories.map((category, index) => (
                    <div key={index} className="category-item">
                      <div className="category-rank">{index + 1}</div>
                      <div className="category-color" style={{ backgroundColor: category.color }}></div>
                      <div className="category-info">
                        <div className="category-name">{category.name}</div>
                        <div className="category-amount">{formatCurrency(category.amount)}</div>
                      </div>
                      <div className="category-percentage">{formatPercentage(category.percentage)}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="category-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={topCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {topCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        
        <div className="report-insights">
          <h3 className="insights-title">
            <FileText size={18} />
            Finansal İçgörüler
          </h3>
          <div className="insights-content">
            {netBalance > 0 ? (
              <div className="insight-item positive">
                <h4>Pozitif Nakit Akışı</h4>
                <p>
                  Bu dönemde {formatCurrency(netBalance)} tutarında pozitif nakit akışı sağladınız. 
                  Bu tutar, gelecek finansal hedeflerinize katkıda bulunabilir veya acil durum fonunuzu güçlendirebilir.
                </p>
              </div>
            ) : (
              <div className="insight-item negative">
                <h4>Negatif Nakit Akışı</h4>
                <p>
                  Bu dönemde {formatCurrency(Math.abs(netBalance))} tutarında negatif nakit akışı oluştu. 
                  Gider azaltma stratejileri veya gelir artırma yöntemleri üzerinde düşünmeniz faydalı olabilir.
                </p>
              </div>
            )}
            
            {savingsRate > 0.2 ? (
              <div className="insight-item positive">
                <h4>Yüksek Tasarruf Oranı</h4>
                <p>
                  {formatPercentage(savingsRate)} tasarruf oranıyla finansal geleceğiniz için güçlü bir temel oluşturuyorsunuz. 
                  Bu oran, finansal uzmanların önerdiği %20 hedefinin üzerinde.
                </p>
              </div>
            ) : (
              <div className="insight-item neutral">
                <h4>Tasarruf Potansiyeli</h4>
                <p>
                  Mevcut {formatPercentage(savingsRate)} tasarruf oranınızı artırmak için fırsatlar olabilir. 
                  Finansal uzmanlar, gelirin en az %20'sinin tasarruf edilmesini önerirler.
                </p>
              </div>
            )}
            
            {topCategories.length > 0 && (
              <div className="insight-item neutral">
                <h4>En Büyük Harcama Kategoriniz</h4>
                <p>
                  En yüksek harcamanız {topCategories[0].name} kategorisinde, toplam giderlerinizin {formatPercentage(topCategories[0].percentage)}'sini oluşturuyor. 
                  Bu alandaki harcamalarınızı gözden geçirmek, tasarruf potansiyelini ortaya çıkarabilir.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const renderIncomeExpenseReport = () => {
    if (!reportData) return null;
    
    const { 
      timeSeriesData, monthlyData, topIncomeCategories, 
      topExpenseCategories, incomeVsExpenseByDay 
    } = reportData;
    
    // Gün adlarını Türkçe olarak tanımla
    const dayNames = ['Pzr', 'Pts', 'Sal', 'Çrş', 'Prş', 'Cum', 'Cmt'];
    
    return (
      <div className="income-expense-report">
        <div className="time-series-chart">
          <h3 className="chart-title">
            <TrendingUp size={18} />
            Gelir-Gider Zaman Serisi
          </h3>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={timeSeriesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getDate()}.${d.getMonth() + 1}`;
                  }}
                />
                <YAxis 
                  yAxisId="left"
                  tickFormatter={(value) => `₺${value / 1000}K`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) => `₺${value / 1000}K`}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(date) => formatDate(date)}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="income" 
                  name="Gelir"
                  stroke="#27ae60" 
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="expense" 
                  name="Gider"
                  stroke="#e74c3c" 
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="balance" 
                  name="Bakiye"
                  stroke="#3498db" 
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="report-details">
          <div className="chart-container">
            <h3 className="chart-title">
              <BarChartIcon size={18} />
              Aylık Karşılaştırma
            </h3>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value) => {
                      const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
                      return months[value - 1];
                    }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `₺${value / 1000}K`}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(value) => {
                      const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                      return months[value - 1];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Gelir" fill="#27ae60" />
                  <Bar dataKey="expense" name="Gider" fill="#e74c3c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="chart-container">
            <h3 className="chart-title">
              <BarChartIcon size={18} />
              Haftanın Günlerine Göre
            </h3>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={incomeVsExpenseByDay}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="day" 
                    tickFormatter={(value) => dayNames[value]}
                  />
                  <YAxis 
                    tickFormatter={(value) => `₺${value / 1000}K`}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(value) => {
                      const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                      return days[value];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Gelir" fill="#27ae60" />
                  <Bar dataKey="expense" name="Gider" fill="#e74c3c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="categories-comparison">
          <div className="top-categories-container">
            <h3 className="categories-title">
              <ArrowUpCircle size={18} />
              Gelir Kategorileri
            </h3>
            <div className="categories-list">
              {topIncomeCategories.map((category, index) => (
                <div key={index} className="category-item">
                  <div className="category-rank">{index + 1}</div>
                  <div className="category-color" style={{ backgroundColor: category.color }}></div>
                  <div className="category-info">
                    <div className="category-name">{category.name}</div>
                    <div className="category-amount">{formatCurrency(category.amount)}</div>
                  </div>
                  <div className="category-percentage">{formatPercentage(category.percentage)}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="top-categories-container">
            <h3 className="categories-title">
              <ArrowDownCircle size={18} />
              Gider Kategorileri
            </h3>
            <div className="categories-list">
              {topExpenseCategories.map((category, index) => (
                <div key={index} className="category-item">
                  <div className="category-rank">{index + 1}</div>
                  <div className="category-color" style={{ backgroundColor: category.color }}></div>
                  <div className="category-info">
                    <div className="category-name">{category.name}</div>
                    <div className="category-amount">{formatCurrency(category.amount)}</div>
                  </div>
                  <div className="category-percentage">{formatPercentage(category.percentage)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderCategoryReport = () => {
    if (!reportData) return null;
    
    const { 
      categoryData, categoryTrends, 
      subCategoryAnalysis, categoryComparison 
    } = reportData;
    
    // Renk paleti
    const COLORS = ['#4a86e8', '#27ae60', '#e74c3c', '#f39c12', '#9b59b6', '#3498db', '#e67e22', '#2ecc71'];
    
    return (
      <div className="category-report">
        <div className="chart-container">
          <h3 className="chart-title">
            <PieIcon size={18} />
            Kategori Dağılımı
          </h3>
          <div className="chart-content with-padding">
            <div className="pie-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend 
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ paddingLeft: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="categories-table">
              <div className="table-header">
                <div className="header-cell">Kategori</div>
                <div className="header-cell">Tür</div>
                <div className="header-cell">Tutar</div>
                <div className="header-cell">Yüzde</div>
              </div>
              <div className="table-body">
                {categoryData.map((category, index) => (
                  <div key={index} className="table-row">
                    <div className="table-cell">
                      <div className="category-color" style={{ backgroundColor: category.color || COLORS[index % COLORS.length] }}></div>
                      <span>{category.name}</span>
                    </div>
                    <div className="table-cell type-cell">
                      <span className={`type-badge ${category.type.toLowerCase()}`}>
                        {category.type === 'Income' ? 'Gelir' : 'Gider'}
                      </span>
                    </div>
                    <div className="table-cell amount-cell">{formatCurrency(category.amount)}</div>
                    <div className="table-cell percentage-cell">{formatPercentage(category.percentage)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="chart-container">
          <h3 className="chart-title">
            <TrendingUp size={18} />
            Kategori Trendleri
          </h3>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={categoryTrends}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getDate()}.${d.getMonth() + 1}`;
                  }}
                />
                <YAxis 
                  tickFormatter={(value) => `₺${value / 1000}K`}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(date) => formatDate(date)}
                />
                <Legend />
                {Object.keys(categoryTrends[0] || {}).filter(key => key !== 'date').map((category, index) => (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    name={category}
                    stroke={COLORS[index % COLORS.length]}
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {subCategoryAnalysis && subCategoryAnalysis.length > 0 && (
          <div className="sub-category-analysis">
            <h3 className="section-title">
              <BarChartIcon size={18} />
              Alt Kategori Analizi
            </h3>
            
            {subCategoryAnalysis.map((category, index) => (
              <div key={index} className="sub-category-container">
                <div className="sub-category-header">
                  <div className="category-color" style={{ backgroundColor: category.color || COLORS[index % COLORS.length] }}></div>
                  <h4 className="category-name">{category.name}</h4>
                  <span className="category-amount">{formatCurrency(category.totalAmount)}</span>
                </div>
                
                <div className="sub-category-chart">
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart
                      data={category.subCategories}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => `₺${value / 1000}K`} />
                      <YAxis type="category" dataKey="name" width={150} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Bar 
                        dataKey="amount" 
                        fill={category.color || COLORS[index % COLORS.length]} 
                        background={{ fill: '#eee' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {categoryComparison && (
          <div className="category-comparison">
            <h3 className="section-title">
              <BarChartIcon size={18} />
              Dönemsel Karşılaştırma
            </h3>
            
            <div className="comparison-chart">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={categoryComparison}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `₺${value / 1000}K`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="currentPeriod" name="Mevcut Dönem" fill="#4a86e8" />
                  <Bar dataKey="previousPeriod" name="Önceki Dönem" fill="#ccc" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderBudgetReport = () => {
    if (!reportData) return null;
    
    const { 
      budgetPerformance, monthlyBudgetTrend,
      categoryBudgetComparison, savingsProjection
    } = reportData;
    
    return (
      <div className="budget-report">
        <div className="budget-performance">
          <h3 className="section-title">
            <BarChartIcon size={18} />
            Bütçe Performansı
          </h3>
          
          <div className="performance-cards">
            {budgetPerformance.map((budget, index) => {
              // İlerleme ve durum hesapla
              const progress = (budget.spent / budget.limit) * 100;
              let statusClass = 'normal';
              
              if (progress >= 100) {
                statusClass = 'danger';
              } else if (progress >= 90) {
                statusClass = 'warning';
              } else if (progress >= 75) {
                statusClass = 'caution';
              }
              
              return (
                <div key={index} className="budget-card">
                  <div className="budget-card-header">
                    <h4 className="budget-name">{budget.name}</h4>
                    <span className="budget-period">{budget.period}</span>
                  </div>
                  
                  <div className="budget-progress">
                    <div className="progress-labels">
                      <span className="budget-amount">{formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}</span>
                      <span className="budget-percentage">{Math.round(progress)}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div 
                        className={`progress-bar ${statusClass}`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="budget-categories">
                    {budget.topCategories.map((category, catIndex) => (
                      <div key={catIndex} className="mini-category">
                        <div 
                          className="category-color" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="category-name">{category.name}</span>
                        <span className="category-amount">{formatCurrency(category.amount)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="budget-footer">
                    <div className={`budget-status ${statusClass}`}>
                      {progress >= 100 ? (
                        'Aşıldı'
                      ) : progress >= 90 ? (
                        'Kritik'
                      ) : progress >= 75 ? (
                        'Dikkat'
                      ) : (
                        'İyi Durumda'
                      )}
                    </div>
                    
                    <div className="budget-remaining">
                      {progress < 100 ? (
                        <span>Kalan: {formatCurrency(budget.limit - budget.spent)}</span>
                      ) : (
                        <span>Aşım: {formatCurrency(budget.spent - budget.limit)}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="chart-container">
          <h3 className="chart-title">
            <TrendingUp size={18} />
            Aylık Bütçe Trendi
          </h3>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={monthlyBudgetTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(month) => {
                    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
                    return months[month - 1];
                  }}
                />
                <YAxis 
                  tickFormatter={(value) => `₺${value / 1000}K`}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(month) => {
                    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                    return months[month - 1];
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="budget" 
                  name="Bütçe"
                  stroke="#4a86e8" 
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  name="Gerçekleşen"
                  stroke="#e74c3c" 
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="budget-category-comparison">
          <h3 className="section-title">
            <BarChartIcon size={18} />
            Kategori Bazlı Bütçe Karşılaştırması
          </h3>
          
          <div className="comparison-chart">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={categoryBudgetComparison}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `₺${value / 1000}K`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="budget" name="Bütçe" fill="#4a86e8" />
                <Bar dataKey="actual" name="Gerçekleşen" fill="#e74c3c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {savingsProjection && (
          <div className="savings-projection">
            <h3 className="section-title">
              <TrendingUp size={18} />
              Tasarruf Projeksiyonu
            </h3>
            
            <div className="projection-chart">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={savingsProjection}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorProjection" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4a86e8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4a86e8" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(month) => {
                      const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
                      const date = new Date();
                      date.setMonth(date.getMonth() + month);
                      return `${months[date.getMonth()]} ${date.getFullYear()}`;
                    }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `₺${value / 1000}K`}
                  />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(month) => {
                      const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                      const date = new Date();
                      date.setMonth(date.getMonth() + month);
                      return `${months[date.getMonth()]} ${date.getFullYear()}`;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="projection" 
                    name="Tasarruf Projeksiyonu"
                    stroke="#4a86e8" 
                    fillOpacity={1} 
                    fill="url(#colorProjection)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="projection-info">
              <div className="info-item">
                <h4>1 Yıllık Tahmini Tasarruf</h4>
                <span className="info-value">{formatCurrency(savingsProjection[11].projection)}</span>
              </div>
              
              <div className="info-item">
                <h4>Aylık Ortalama Tasarruf</h4>
                <span className="info-value">{formatCurrency(savingsProjection[1].projection)}</span>
              </div>
              
              <div className="info-item">
                <h4>Tasarruf Büyüme Oranı</h4>
                <span className="info-value">
                  {((savingsProjection[11].projection / savingsProjection[0].projection - 1) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderGoalReport = () => {
    if (!reportData) return null;
    
    const { 
      activeGoals, completedGoals, 
      goalProgress, savingsRate, 
      projections
    } = reportData;
    
    return (
      <div className="goal-report">
        <div className="goal-summary">
          <div className="summary-card">
            <div className="summary-icon">
              <Target size={24} />
            </div>
            <div className="summary-content">
              <h3>Aktif Hedefler</h3>
              <div className="summary-value">{activeGoals.length}</div>
              <div className="summary-details">
                <span>Toplam Hedef Tutarı:</span>
                <span className="details-value">
                  {formatCurrency(activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0))}
                </span>
              </div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">
              <CheckCircle size={24} />
            </div>
            <div className="summary-content">
              <h3>Tamamlanan Hedefler</h3>
              <div className="summary-value">{completedGoals.length}</div>
              <div className="summary-details">
                <span>Toplam Tamamlanan:</span>
                <span className="details-value">
                  {formatCurrency(completedGoals.reduce((sum, goal) => sum + goal.targetAmount, 0))}
                </span>
              </div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">
              <ArrowUpCircle size={24} />
            </div>
            <div className="summary-content">
              <h3>Ortalama İlerleme</h3>
              <div className="summary-value">
                {activeGoals.length > 0 
                  ? `%${(activeGoals.reduce((sum, goal) => sum + ((goal.currentAmount / goal.targetAmount) * 100), 0) / activeGoals.length).toFixed(1)}`
                  : '%0'}
              </div>
              <div className="summary-details">
                <span>Tasarruf Oranı:</span>
                <span className="details-value">{formatPercentage(savingsRate)}</span>
              </div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">
              <Calendar size={24} />
            </div>
            <div className="summary-content">
              <h3>En Yakın Hedef</h3>
              <div className="summary-value">
                {activeGoals.length > 0 ? (
                  activeGoals.sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))[0].name
                ) : (
                  'Yok'
                )}
              </div>
              <div className="summary-details">
                <span>Kalan Süre:</span>
                <span className="details-value">
                  {activeGoals.length > 0 ? (
                    `${Math.ceil((new Date(activeGoals.sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))[0].targetDate) - new Date()) / (1000 * 60 * 60 * 24))} gün`
                  ) : (
                    'Yok'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="goals-progress">
          <h3 className="section-title">
            <BarChartIcon size={18} />
            Hedef İlerlemeleri
          </h3>
          
          <div className="progress-list">
            {goalProgress.map((goal, index) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
              
              let statusClass = 'on-track';
              if (daysLeft < 0) statusClass = 'overdue';
              else if (progress >= 100) statusClass = 'completed';
              else if (progress < 25 && daysLeft < 30) statusClass = 'at-risk';
              
              return (
                <div key={index} className={`goal-progress-item ${statusClass}`}>
                  <div className="goal-info">
                    <h4 className="goal-name">{goal.name}</h4>
                    <div className="goal-type">{goal.type}</div>
                    <div className="goal-dates">
                      <span className="target-date">Hedef: {formatDate(goal.targetDate)}</span>
                      {daysLeft > 0 ? (
                        <span className="days-left">{daysLeft} gün kaldı</span>
                      ) : (
                        <span className="days-overdue">{Math.abs(daysLeft)} gün geçti</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="goal-amounts">
                    <div className="current-amount">
                      {formatCurrency(goal.currentAmount)}
                      <span className="amount-label">Mevcut</span>
                    </div>
                    <div className="target-amount">
                      {formatCurrency(goal.targetAmount)}
                      <span className="amount-label">Hedef</span>
                    </div>
                  </div>
                  
                  <div className="goal-progress-bar">
                    <div className="progress-info">
                      <span className="progress-percentage">{Math.round(progress)}%</span>
                      <span className="remaining-amount">
                        {formatCurrency(goal.targetAmount - goal.currentAmount)} kaldı
                      </span>
                    </div>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="chart-container">
          <h3 className="chart-title">
            <TrendingUp size={18} />
            Hedef Trend Analizi
          </h3>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  type="category"
                  allowDuplicatedCategory={false}
                />
                <YAxis 
                  tickFormatter={(value) => `%${value}`}
                />
                <Tooltip />
                <Legend />
                {projections.map((projection, index) => (
                  <Line
                    key={index}
                    data={projection.data}
                    type="monotone"
                    dataKey="progress"
                    name={projection.name}
                    stroke={projection.color}
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="goal-completion-forecast">
          <h3 className="section-title">
            <Calendar size={18} />
            Hedef Tamamlanma Tahminleri
          </h3>
          
          <div className="forecast-table">
            <div className="table-header">
              <div className="header-cell">Hedef</div>
              <div className="header-cell">Mevcut İlerleme</div>
              <div className="header-cell">Hedef Tarih</div>
              <div className="header-cell">Tahmini Tamamlanma</div>
              <div className="header-cell">Durum</div>
            </div>
            <div className="table-body">
              {activeGoals.map((goal, index) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const targetDate = new Date(goal.targetDate);
                const estimatedDate = new Date(goal.estimatedCompletionDate);
                
                let statusClass = 'on-track';
                if (estimatedDate > targetDate) statusClass = 'delayed';
                if (progress >= 90) statusClass = 'nearly-complete';
                
                return (
                  <div key={index} className="table-row">
                    <div className="table-cell">{goal.name}</div>
                    <div className="table-cell progress-cell">
                      <div className="mini-progress">
                        <div className="mini-percentage">{Math.round(progress)}%</div>
                        <div className="mini-bar-container">
                          <div 
                            className="mini-bar"
                            style={{ width: `${Math.min(100, progress)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="table-cell date-cell">{formatDate(goal.targetDate)}</div>
                    <div className="table-cell date-cell">{formatDate(goal.estimatedCompletionDate)}</div>
                    <div className="table-cell status-cell">
                      <span className={`status-badge ${statusClass}`}>
                        {statusClass === 'on-track' ? 'Zamanında' : 
                         statusClass === 'delayed' ? 'Gecikmeli' : 'Tamamlanmak Üzere'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Aktif rapora göre içerik render et
  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Rapor verileri yükleniyor...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="error-state">
          <AlertCircle size={24} />
          <p>{error}</p>
          <button onClick={fetchReportData} className="retry-button">
            <RefreshCw size={16} />
            <span>Tekrar Dene</span>
          </button>
        </div>
      );
    }
    
    if (!reportData) {
      return (
        <div className="empty-state">
          <FileText size={48} />
          <h3>Rapor verisi bulunamadı</h3>
          <p>Seçilen tarih aralığında veri bulunmuyor.</p>
        </div>
      );
    }
    
    switch (activeReport) {
      case 'overview':
        return renderOverviewReport();
      case 'income-expense':
        return renderIncomeExpenseReport();
      case 'categories':
        return renderCategoryReport();
      case 'budgets':
        return renderBudgetReport();
      case 'goals':
        return renderGoalReport();
      default:
        return renderOverviewReport();
    }
  };
  
  // Ana render fonksiyonu
  return (
    <div className="report-manager">
      <div className="report-manager-header">
        <div>
          <h2>Finansal Raporlar</h2>
          <p>Finansal verilerinizi analiz edin ve görselleştirin.</p>
        </div>
      </div>
      
      {renderReportMenu()}
      {renderFilters()}
      
      <div className="report-content">
        {renderReportContent()}
      </div>
    </div>
  );
};

export default ReportManager;