import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Filter, Download, RefreshCw, ArrowDown, ArrowUp } from 'lucide-react';
import './SpendingAnalysis.css';

const SpendingAnalysis = ({ transactions }) => {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'quarter', 'year'
  const [sortBy, setSortBy] = useState('amount'); // 'amount', 'alphabetical'
  const [isExporting, setIsExporting] = useState(false);

  // Renk paleti
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7300', '#8dd1e1'];

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      analyzeTransactions();
    } else {
      setLoading(false);
    }
  }, [transactions, dateRange, sortBy]);

  const analyzeTransactions = () => {
    setLoading(true);
    
    // Tarih aralığına göre işlemleri filtrele
    const now = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    
    // Yalnızca gider işlemlerini ve seçilen tarih aralığındakileri filtrele
    const filteredTransactions = transactions.filter(t => 
      t.type === 'Expense' && 
      new Date(t.transactionDate) >= startDate
    );
    
    // Kategoriye göre gruplayıp topla
    const categoryGroups = filteredTransactions.reduce((groups, transaction) => {
      const category = transaction.categoryName || 'Diğer';
      
      if (!groups[category]) {
        groups[category] = {
          name: category,
          value: 0,
          count: 0
        };
      }
      
      groups[category].value += transaction.amount;
      groups[category].count += 1;
      
      return groups;
    }, {});
    
    // Kategori verilerini diziye dönüştür ve sırala
    let categoryArray = Object.values(categoryGroups);
    
    if (sortBy === 'amount') {
      categoryArray.sort((a, b) => b.value - a.value);
    } else if (sortBy === 'alphabetical') {
      categoryArray.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    // Toplam harcamayı hesapla ve yüzdeleri ekle
    const totalSpending = categoryArray.reduce((sum, category) => sum + category.value, 0);
    
    categoryArray = categoryArray.map(category => ({
      ...category,
      percentage: totalSpending > 0 ? ((category.value / totalSpending) * 100).toFixed(1) : 0
    }));
    
    setCategoryData(categoryArray);
    
    // Aylık harcama verilerini oluştur
    const monthlySpendings = {};
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.transactionDate);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = monthNames[date.getMonth()];
      
      if (!monthlySpendings[monthKey]) {
        monthlySpendings[monthKey] = {
          name: monthName,
          amount: 0,
          date: date
        };
      }
      
      monthlySpendings[monthKey].amount += transaction.amount;
    });
    
    // Diziye dönüştür ve tarihe göre sırala
    let monthlyArray = Object.values(monthlySpendings);
    monthlyArray.sort((a, b) => a.date - b.date);
    
    setMonthlyData(monthlyArray);
    setLoading(false);
  };

  const exportData = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      // CSV formatında veriyi oluştur
      const csvData = categoryData.map(category => 
        `${category.name},${category.value.toFixed(2)},${category.percentage}%,${category.count}`
      );
      
      const csvContent = [
        'Kategori,Tutar (₺),Yüzde (%),İşlem Sayısı',
        ...csvData
      ].join('\n');
      
      // CSV dosyasını indir
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `harcama_analizi_${dateRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsExporting(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="spending-analysis loading">
        <RefreshCw size={24} className="loading-icon" />
        <p>Harcama verileri analiz ediliyor...</p>
      </div>
    );
  }

  if (categoryData.length === 0) {
    return (
      <div className="spending-analysis empty">
        <h3>Yeterli harcama verisi bulunamadı</h3>
        <p>Seçili dönemde harcama işlemi bulunmamaktadır. Lütfen farklı bir dönem seçin veya yeni işlemler ekleyin.</p>
      </div>
    );
  }

  // Toplam harcama
  const totalSpending = categoryData.reduce((sum, category) => sum + category.value, 0);

  return (
    <div className="spending-analysis">
      <div className="spending-header">
        <div>
          <h2>Harcama Analizi</h2>
          <p>Harcamalarınızın kategorilere göre dağılımı</p>
        </div>
        
        <div className="spending-controls">
          <div className="date-filter">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="week">Son 7 Gün</option>
              <option value="month">Son 30 Gün</option>
              <option value="quarter">Son 3 Ay</option>
              <option value="year">Son 1 Yıl</option>
            </select>
          </div>
          
          <div className="sort-filter">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="amount">Tutara Göre</option>
              <option value="alphabetical">Alfabetik</option>
            </select>
          </div>
          
          <button 
            className="export-button" 
            onClick={exportData}
            disabled={isExporting}
          >
            <Download size={16} />
            <span>{isExporting ? 'İndiriliyor...' : 'Dışa Aktar'}</span>
          </button>
        </div>
      </div>
      
      <div className="spending-summary">
        <div className="summary-card">
          <h3>Toplam Harcama</h3>
          <p className="summary-amount">₺{totalSpending.toFixed(2)}</p>
          <p className="summary-period">{dateRange === 'week' ? 'Son 7 gün' : dateRange === 'month' ? 'Son 30 gün' : dateRange === 'quarter' ? 'Son 3 ay' : 'Son 1 yıl'}</p>
        </div>
        
        <div className="summary-card">
          <h3>En Büyük Harcama</h3>
          <p className="summary-amount">₺{categoryData[0]?.value.toFixed(2) || '0.00'}</p>
          <p className="summary-category">{categoryData[0]?.name || 'Kategori yok'}</p>
        </div>
        
        <div className="summary-card">
          <h3>Kategori Sayısı</h3>
          <p className="summary-amount">{categoryData.length}</p>
          <p className="summary-category">Farklı harcama kategorisi</p>
        </div>
      </div>
      
      <div className="spending-charts">
        <div className="chart-section pie-section">
          <h3>Kategori Dağılımı</h3>
          
          <div className="pie-chart-container">
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
                  label={({ name, percentage }) => `${name}: %${percentage}`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`₺${value.toFixed(2)}`, 'Tutar']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="chart-section bar-section">
          <h3>Kategori Bazında Harcamalar</h3>
          
          <div className="bar-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₺${value.toFixed(2)}`, 'Tutar']}
                />
                <Bar dataKey="value" name="Harcama Tutarı" fill="#4a86e8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="spending-trends">
        <h3>Aylık Harcama Trendi</h3>
        
        <div className="trend-chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`₺${value.toFixed(2)}`, 'Tutar']}
              />
              <Bar dataKey="amount" name="Aylık Harcama" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="spending-details">
        <h3>Kategori Detayları</h3>
        
        <div className="category-table-container">
          <table className="category-table">
            <thead>
              <tr>
                <th>Kategori</th>
                <th>Tutar (₺)</th>
                <th>Yüzde (%)</th>
                <th>İşlem Sayısı</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((category, index) => (
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
                  <td className="amount-cell">₺{category.value.toFixed(2)}</td>
                  <td className="percent-cell">%{category.percentage}</td>
                  <td className="count-cell">{category.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SpendingAnalysis;