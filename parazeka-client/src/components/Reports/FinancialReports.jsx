import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Download, RefreshCw, Filter, FileText, BarChart2, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import './FinancialReports.css';

const FinancialReports = ({ apiService }) => {
  const [reportType, setReportType] = useState('monthly');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedPeriod, setSelectedPeriod] = useState('3months'); // 3months, 6months, 1year
  const [categoryType, setCategoryType] = useState('expense'); // expense, income
  const [isExporting, setIsExporting] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7300', '#8dd1e1', '#f7347a', '#5843be', '#fac858', '#ee6666'];
  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  // Rapor seçenekleri
  const reportTypes = [
    { id: 'monthly', icon: <Calendar size={18} />, label: 'Aylık Rapor' },
    { id: 'yearly', icon: <BarChart2 size={18} />, label: 'Yıllık Rapor' },
    { id: 'category', icon: <PieChartIcon size={18} />, label: 'Kategori Raporu' },
    { id: 'trends', icon: <TrendingUp size={18} />, label: 'Trend Analizi' }
  ];

  // Rapor verisini yükle
  useEffect(() => {
    fetchReportData();
  }, [reportType, selectedYear, selectedMonth, selectedPeriod, categoryType]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);

    try {
      let data;

      switch (reportType) {
        case 'monthly':
          data = await apiService.reports.getMonthlyReport(selectedYear, selectedMonth);
          break;
          
        case 'yearly':
          data = await apiService.reports.getYearlyReport(selectedYear);
          break;
          
        case 'category':
          // Tarih aralığını belirle
          const now = new Date();
          let fromDate = new Date();
          
          if (selectedPeriod === '3months') {
            fromDate.setMonth(now.getMonth() - 3);
          } else if (selectedPeriod === '6months') {
            fromDate.setMonth(now.getMonth() - 6);
          } else {
            fromDate.setFullYear(now.getFullYear() - 1);
          }
          
          data = await apiService.reports.getCategoryReport({
            fromDate: fromDate.toISOString().split('T')[0],
            toDate: now.toISOString().split('T')[0],
            type: categoryType === 'expense' ? 'Expense' : 'Income'
          });
          break;
          
        case 'trends':
          // 12 aylık trend verisi
          const trendFromDate = new Date();
          trendFromDate.setFullYear(trendFromDate.getFullYear() - 1);
          
          data = await apiService.reports.getTrendReport({
            fromDate: trendFromDate.toISOString().split('T')[0],
            toDate: new Date().toISOString().split('T')[0]
          });
          break;
          
        default:
          break;
      }

      setReportData(data);
    } catch (err) {
      console.error('Rapor verileri alınırken hata:', err);
      setError('Rapor verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Raporu dışa aktar
  const exportReport = async () => {
    setIsExporting(true);

    try {
      let exportData;
      const reportTitle = getReportTitle();
      let csvContent;

      // Farklı rapor türleri için farklı dışa aktarma işlemleri
      switch (reportType) {
        case 'monthly':
          csvContent = 'Kategori,Gelir,Gider\n';
          reportData.categories.forEach(cat => {
            csvContent += `${cat.name},${cat.income || 0},${cat.expense || 0}\n`;
          });
          break;
          
        case 'yearly':
          csvContent = 'Ay,Gelir,Gider,Net\n';
          reportData.monthlyData.forEach(month => {
            csvContent += `${month.name},${month.income || 0},${month.expense || 0},${month.net || 0}\n`;
          });
          break;
          
        case 'category':
          csvContent = 'Kategori,Tutar,Yüzde\n';
          reportData.forEach(cat => {
            csvContent += `${cat.name},${cat.value || 0},${cat.percentage || 0}%\n`;
          });
          break;
          
        case 'trends':
          csvContent = 'Tarih,Gelir,Gider,Net\n';
          reportData.forEach(item => {
            csvContent += `${item.date},${item.income || 0},${item.expense || 0},${item.net || 0}\n`;
          });
          break;
          
        default:
          break;
      }

      // CSV dosyasını indir
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportTitle.replace(/\s+/g, '_').toLowerCase()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Rapor dışa aktarılırken hata:', err);
      alert('Rapor dışa aktarılamadı.');
    } finally {
      setIsExporting(false);
    }
  };

  // Rapor başlığı oluşturma
  const getReportTitle = () => {
    switch (reportType) {
      case 'monthly':
        return `${monthNames[selectedMonth - 1]} ${selectedYear} Raporu`;
        
      case 'yearly':
        return `${selectedYear} Yılı Raporu`;
        
      case 'category':
        return `${selectedPeriod === '3months' ? 'Son 3 Ay' : selectedPeriod === '6months' ? 'Son 6 Ay' : 'Son 1 Yıl'} ${categoryType === 'expense' ? 'Gider' : 'Gelir'} Kategori Raporu`;
        
      case 'trends':
        return 'Son 12 Ay Finansal Trend Raporu';
        
      default:
        return 'Finansal Rapor';
    }
  };

  // Yıl seçenekleri oluşturma
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let year = currentYear - 5; year <= currentYear; year++) {
      years.push(year);
    }
    
    return years;
  };

  // Ay seçenekleri oluşturma
  const getMonthOptions = () => {
    return monthNames.map((name, index) => ({
      value: index + 1,
      label: name
    }));
  };

  // Rapor içeriğini render etme
  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="report-loading">
          <RefreshCw size={24} className="loading-icon" />
          <p>Rapor verileri yükleniyor...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="report-error">
          <p>{error}</p>
          <button onClick={fetchReportData}>Tekrar Dene</button>
        </div>
      );
    }
    
    if (!reportData) {
      return (
        <div className="report-empty">
          <FileText size={48} />
          <h3>Rapor verileri bulunamadı</h3>
          <p>Seçili döneme ait işlem kaydı bulunmamaktadır.</p>
        </div>
      );
    }
    
    switch (reportType) {
      case 'monthly':
        return renderMonthlyReport();
        
      case 'yearly':
        return renderYearlyReport();
        
      case 'category':
        return renderCategoryReport();
        
      case 'trends':
        return renderTrendsReport();
        
      default:
        return null;
    }
  };

  // Aylık rapor gösterimi
  const renderMonthlyReport = () => {
    const { totalIncome, totalExpense, netAmount, categories } = reportData;
    
    return (
      <div className="monthly-report">
        <div className="report-summary">
          <div className="summary-item income">
            <h3>Toplam Gelir</h3>
            <p>₺{totalIncome.toFixed(2)}</p>
          </div>
          
          <div className="summary-item expense">
            <h3>Toplam Gider</h3>
            <p>₺{totalExpense.toFixed(2)}</p>
          </div>
          
          <div className="summary-item net">
            <h3>Net Tutar</h3>
            <p className={netAmount >= 0 ? 'income' : 'expense'}>₺{netAmount.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="report-charts">
          <div className="chart-container">
            <h3>Gelir ve Gider Dağılımı</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₺${value}`, '']}
                />
                <Legend />
                <Bar dataKey="income" name="Gelir" fill="#27ae60" />
                <Bar dataKey="expense" name="Gider" fill="#e74c3c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h3>Kategori Bazında Giderler</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categories.filter(cat => cat.expense > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="expense"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: %${(percent * 100).toFixed(0)}`}
                >
                  {categories.filter(cat => cat.expense > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`₺${value}`, 'Gider']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="report-table">
          <h3>Kategori Detayları</h3>
          <table>
            <thead>
              <tr>
                <th>Kategori</th>
                <th>Gelir</th>
                <th>Gider</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={index}>
                  <td>{category.name}</td>
                  <td className="income">₺{category.income.toFixed(2)}</td>
                  <td className="expense">₺{category.expense.toFixed(2)}</td>
                  <td className={category.income - category.expense >= 0 ? 'income' : 'expense'}>
                    ₺{(category.income - category.expense).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th>Toplam</th>
                <th className="income">₺{totalIncome.toFixed(2)}</th>
                <th className="expense">₺{totalExpense.toFixed(2)}</th>
                <th className={netAmount >= 0 ? 'income' : 'expense'}>₺{netAmount.toFixed(2)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  // Yıllık rapor gösterimi
  const renderYearlyReport = () => {
    const { totalIncome, totalExpense, netAmount, monthlyData } = reportData;
    
    return (
      <div className="yearly-report">
        <div className="report-summary">
          <div className="summary-item income">
            <h3>Yıllık Gelir</h3>
            <p>₺{totalIncome.toFixed(2)}</p>
          </div>
          
          <div className="summary-item expense">
            <h3>Yıllık Gider</h3>
            <p>₺{totalExpense.toFixed(2)}</p>
          </div>
          
          <div className="summary-item net">
            <h3>Net Tutar</h3>
            <p className={netAmount >= 0 ? 'income' : 'expense'}>₺{netAmount.toFixed(2)}</p>
          </div>
          
          <div className="summary-item ratio">
            <h3>Gider/Gelir Oranı</h3>
            <p>{totalIncome > 0 ? `%${((totalExpense / totalIncome) * 100).toFixed(1)}` : 'N/A'}</p>
          </div>
        </div>
        
        <div className="report-charts">
          <div className="chart-container">
            <h3>Aylık Gelir ve Gider Trendi</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₺${value}`, '']}
                />
                <Legend />
                <Line type="monotone" dataKey="income" name="Gelir" stroke="#27ae60" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" name="Gider" stroke="#e74c3c" strokeWidth={2} />
                <Line type="monotone" dataKey="net" name="Net" stroke="#3498db" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h3>Aylık Gelir/Gider Karşılaştırması</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₺${value}`, '']}
                />
                <Legend />
                <Bar dataKey="income" name="Gelir" fill="#27ae60" />
                <Bar dataKey="expense" name="Gider" fill="#e74c3c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="report-table">
          <h3>Aylara Göre Gelir/Gider</h3>
          <table>
            <thead>
              <tr>
                <th>Ay</th>
                <th>Gelir</th>
                <th>Gider</th>
                <th>Net</th>
                <th>Tasarruf Oranı</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((month, index) => (
                <tr key={index}>
                  <td>{month.name}</td>
                  <td className="income">₺{month.income.toFixed(2)}</td>
                  <td className="expense">₺{month.expense.toFixed(2)}</td>
                  <td className={month.net >= 0 ? 'income' : 'expense'}>
                    ₺{month.net.toFixed(2)}
                  </td>
                  <td>{month.income > 0 ? `%${(((month.income - month.expense) / month.income) * 100).toFixed(1)}` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th>Toplam</th>
                <th className="income">₺{totalIncome.toFixed(2)}</th>
                <th className="expense">₺{totalExpense.toFixed(2)}</th>
                <th className={netAmount >= 0 ? 'income' : 'expense'}>₺{netAmount.toFixed(2)}</th>
                <th>{totalIncome > 0 ? `%${(((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)}` : 'N/A'}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  // Kategori raporu gösterimi
  const renderCategoryReport = () => {
    return (
      <div className="category-report">
        <div className="report-summary">
          <div className="summary-item">
            <h3>Toplam {categoryType === 'expense' ? 'Gider' : 'Gelir'}</h3>
            <p>₺{reportData.reduce((sum, item) => sum + item.value, 0).toFixed(2)}</p>
          </div>
          
          <div className="summary-item">
            <h3>En Büyük Kategori</h3>
            <p>{reportData.length > 0 ? reportData[0].name : 'N/A'}</p>
          </div>
          
          <div className="summary-item">
            <h3>Toplam Kategori</h3>
            <p>{reportData.length}</p>
          </div>
        </div>
        
        <div className="report-charts">
          <div className="chart-container">
            <h3>Kategori Dağılımı</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: %${(percent * 100).toFixed(0)}`}
                >
                  {reportData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`₺${value}`, categoryType === 'expense' ? 'Gider' : 'Gelir']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h3>Kategori Karşılaştırması</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₺${value}`, categoryType === 'expense' ? 'Gider' : 'Gelir']}
                />
                <Bar dataKey="value" name={categoryType === 'expense' ? 'Gider' : 'Gelir'} fill={categoryType === 'expense' ? '#e74c3c' : '#27ae60'} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="report-table">
          <h3>Kategori Detayları</h3>
          <table>
            <thead>
              <tr>
                <th>Kategori</th>
                <th>Tutar</th>
                <th>Yüzde</th>
                <th>İşlem Sayısı</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((category, index) => (
                <tr key={index}>
                  <td>
                    <div className="category-name">
                      <span 
                        className="category-color" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></span>
                      {category.name}
                    </div>
                  </td>
                  <td>₺{category.value.toFixed(2)}</td>
                  <td>{category.percentage}%</td>
                  <td>{category.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Trend raporu gösterimi
  const renderTrendsReport = () => {
    return (
      <div className="trends-report">
        <div className="report-summary">
          <div className="summary-item income">
            <h3>Toplam Gelir</h3>
            <p>₺{reportData.reduce((sum, item) => sum + item.income, 0).toFixed(2)}</p>
          </div>
          
          <div className="summary-item expense">
            <h3>Toplam Gider</h3>
            <p>₺{reportData.reduce((sum, item) => sum + item.expense, 0).toFixed(2)}</p>
          </div>
          
          <div className="summary-item net">
            <h3>Net Tutar</h3>
            <p className={reportData.reduce((sum, item) => sum + item.net, 0) >= 0 ? 'income' : 'expense'}>
              ₺{reportData.reduce((sum, item) => sum + item.net, 0).toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="report-charts">
          <div className="chart-container">
            <h3>Gelir/Gider Trendleri</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₺${value}`, '']}
                />
                <Legend />
                <Line type="monotone" dataKey="income" name="Gelir" stroke="#27ae60" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" name="Gider" stroke="#e74c3c" strokeWidth={2} />
                <Line type="monotone" dataKey="net" name="Net" stroke="#3498db" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h3>Aylık Net Durum</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₺${value}`, 'Net']}
                />
                <Bar dataKey="net" name="Net" fill="#3498db">
                  {reportData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.net >= 0 ? '#27ae60' : '#e74c3c'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="report-table">
          <h3>Aylık Finansal Veriler</h3>
          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Gelir</th>
                <th>Gider</th>
                <th>Net</th>
                <th>Tasarruf Oranı</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td className="income">₺{item.income.toFixed(2)}</td>
                  <td className="expense">₺{item.expense.toFixed(2)}</td>
                  <td className={item.net >= 0 ? 'income' : 'expense'}>₺{item.net.toFixed(2)}</td>
                  <td>{item.income > 0 ? `%${(((item.income - item.expense) / item.income) * 100).toFixed(1)}` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="financial-reports">
      <div className="reports-header">
        <div>
          <h2>Finansal Raporlar</h2>
          <p>Detaylı finansal analizler ve raporlar</p>
        </div>
        
        <div className="reports-actions">
          <button 
            className="export-button"
            onClick={exportReport}
            disabled={isExporting || loading || !reportData}
          >
            <Download size={16} />
            <span>{isExporting ? 'İndiriliyor...' : 'Dışa Aktar'}</span>
          </button>
        </div>
      </div>
      
      <div className="report-types">
        {reportTypes.map(type => (
          <button
            key={type.id}
            className={`report-type-button ${reportType === type.id ? 'active' : ''}`}
            onClick={() => setReportType(type.id)}
          >
            {type.icon}
            <span>{type.label}</span>
          </button>
        ))}
      </div>
      
      <div className="report-filters">
        {reportType === 'monthly' && (
          <>
            <div className="filter-group">
              <label>Yıl</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {getYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Ay</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {getMonthOptions().map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
          </>
        )}
        
        {reportType === 'yearly' && (
          <div className="filter-group">
            <label>Yıl</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {getYearOptions().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}
        
        {reportType === 'category' && (
          <>
            <div className="filter-group">
              <label>İşlem Türü</label>
              <div className="toggle-buttons">
                <button
                  className={categoryType === 'expense' ? 'active' : ''}
                  onClick={() => setCategoryType('expense')}
                >
                  Gider
                </button>
                <button
                  className={categoryType === 'income' ? 'active' : ''}
                  onClick={() => setCategoryType('income')}
                >
                  Gelir
                </button>
              </div>
            </div>
            
            <div className="filter-group">
              <label>Dönem</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="3months">Son 3 Ay</option>
                <option value="6months">Son 6 Ay</option>
                <option value="1year">Son 1 Yıl</option>
              </select>
            </div>
          </>
        )}
        
        <button 
          className="refresh-button"
          onClick={fetchReportData}
        >
          <RefreshCw size={16} />
          <span>Yenile</span>
        </button>
      </div>
      
      <div className="report-title">
        <h3>{getReportTitle()}</h3>
      </div>
      
      <div className="report-content">
        {renderReportContent()}
      </div>
    </div>
  );
};

export default FinancialReports;