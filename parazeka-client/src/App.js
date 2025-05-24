// src/App.jsx
import React, { useState, useEffect } from 'react';
import AppLayout from './components/Layout/AppLayout';
import './App.css';

// Mock API Service - Gerçek uygulamada bu ayrı bir dosyada olacak
const createApiService = () => {
  // Base URL'i environment'a göre belirle
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  // Mock data - Gerçek uygulamada API'den gelecek
  const generateMockData = () => {
    const categories = [
      { id: '1', name: 'Market Alışverişi', type: 'Expense', color: '#e74c3c', transactionCount: 15, totalAmount: 2500 },
      { id: '2', name: 'Maaş', type: 'Income', color: '#27ae60', transactionCount: 1, totalAmount: 15000 },
      { id: '3', name: 'Ulaşım', type: 'Expense', color: '#3498db', transactionCount: 8, totalAmount: 800 },
      { id: '4', name: 'Eğlence', type: 'Expense', color: '#9b59b6', transactionCount: 5, totalAmount: 1200 },
      { id: '5', name: 'Faturalar', type: 'Expense', color: '#f39c12', transactionCount: 4, totalAmount: 1800 }
    ];
    
    const transactions = [];
    const now = new Date();
    
    // Son 30 gün için mock işlemler oluştur
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Günde 1-3 işlem
      const transactionCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < transactionCount; j++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const isIncome = category.type === 'Income';
        
        transactions.push({
          id: `tx-${i}-${j}`,
          description: isIncome ? 'Maaş Ödemesi' : `${category.name} - İşlem ${j + 1}`,
          amount: isIncome ? 15000 : Math.floor(Math.random() * 500) + 50,
          type: category.type,
          categoryId: category.id,
          date: date.toISOString(),
          notes: i % 5 === 0 ? 'Otomatik ödeme' : null,
          createdAt: date.toISOString(),
          updatedAt: date.toISOString()
        });
      }
    }
    
    const budgets = [
      {
        id: '1',
        name: 'Aylık Harcama Bütçesi',
        description: 'Temel ihtiyaçlar için bütçe',
        year: 2024,
        month: 12,
        categories: [
          { categoryId: '1', limit: 3000, spent: 2500 },
          { categoryId: '3', limit: 1000, spent: 800 },
          { categoryId: '4', limit: 1500, spent: 1200 },
          { categoryId: '5', limit: 2000, spent: 1800 }
        ]
      }
    ];
    
    const goals = [
      {
        id: '1',
        name: 'Tatil Fonu',
        description: 'Yaz tatili için biriktirme',
        type: 'savings',
        targetAmount: 10000,
        currentAmount: 3500,
        targetDate: '2024-06-01',
        priority: 2,
        isCompleted: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-05-23T00:00:00Z',
        progressHistory: [
          { date: '2024-01-01', amount: 0 },
          { date: '2024-02-01', amount: 1000 },
          { date: '2024-03-01', amount: 2000 },
          { date: '2024-04-01', amount: 2800 },
          { date: '2024-05-01', amount: 3200 },
          { date: '2024-05-23', amount: 3500 }
        ],
        estimatedCompletionDate: '2024-08-15',
        averageMonthlyContribution: 700,
        onTrack: false
      },
      {
        id: '2',
        name: 'Araba Alımı',
        description: 'İkinci el araba için birikim',
        type: 'purchase',
        targetAmount: 50000,
        currentAmount: 12000,
        targetDate: '2024-12-31',
        priority: 3,
        isCompleted: false,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-05-23T00:00:00Z'
      }
    ];
    
    return { categories, transactions, budgets, goals };
  };
  
  const mockData = generateMockData();
  
  // API metodları - Gerçek uygulamada bunlar HTTP çağrıları olacak
  const apiMethods = {
    categories: {
      getAll: async () => {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulated loading
        return mockData.categories;
      },
      
      create: async (categoryData) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newCategory = {
          id: Date.now().toString(),
          ...categoryData,
          transactionCount: 0,
          totalAmount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        mockData.categories.push(newCategory);
        return newCategory;
      },
      
      update: async (id, categoryData) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const index = mockData.categories.findIndex(c => c.id === id);
        if (index !== -1) {
          mockData.categories[index] = {
            ...mockData.categories[index],
            ...categoryData,
            updatedAt: new Date().toISOString()
          };
          return mockData.categories[index];
        }
        throw new Error('Category not found');
      },
      
      delete: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const index = mockData.categories.findIndex(c => c.id === id);
        if (index !== -1) {
          mockData.categories.splice(index, 1);
          return true;
        }
        throw new Error('Category not found');
      }
    },
    
    transactions: {
      getAll: async (params = {}) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        let filteredTransactions = [...mockData.transactions];
        
        // Date filtering
        if (params.startDate) {
          filteredTransactions = filteredTransactions.filter(t => 
            new Date(t.date) >= new Date(params.startDate)
          );
        }
        if (params.endDate) {
          filteredTransactions = filteredTransactions.filter(t => 
            new Date(t.date) <= new Date(params.endDate)
          );
        }
        
        // Type filtering
        if (params.type) {
          filteredTransactions = filteredTransactions.filter(t => t.type === params.type);
        }
        
        // Search filtering
        if (params.search) {
          filteredTransactions = filteredTransactions.filter(t => 
            t.description.toLowerCase().includes(params.search.toLowerCase())
          );
        }
        
        // Sorting
        filteredTransactions.sort((a, b) => {
          const direction = params.sortDirection === 'asc' ? 1 : -1;
          if (params.sortBy === 'date') {
            return direction * (new Date(a.date) - new Date(b.date));
          } else if (params.sortBy === 'amount') {
            return direction * (a.amount - b.amount);
          }
          return direction * a.description.localeCompare(b.description);
        });
        
        // Pagination
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        
        return {
          items: filteredTransactions.slice(startIndex, endIndex),
          totalCount: filteredTransactions.length,
          page: page,
          pageSize: pageSize,
          totalPages: Math.ceil(filteredTransactions.length / pageSize)
        };
      },
      
      create: async (transactionData) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newTransaction = {
          id: Date.now().toString(),
          ...transactionData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        mockData.transactions.unshift(newTransaction);
        return newTransaction;
      },
      
      update: async (id, transactionData) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const index = mockData.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
          mockData.transactions[index] = {
            ...mockData.transactions[index],
            ...transactionData,
            updatedAt: new Date().toISOString()
          };
          return mockData.transactions[index];
        }
        throw new Error('Transaction not found');
      },
      
      delete: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const index = mockData.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
          mockData.transactions.splice(index, 1);
          return true;
        }
        throw new Error('Transaction not found');
      },
      
      export: async (params) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { items } = await apiMethods.transactions.getAll(params);
        
        let csvContent = 'Tarih,Açıklama,Kategori,Tür,Tutar\n';
        items.forEach(transaction => {
          const category = mockData.categories.find(c => c.id === transaction.categoryId);
          csvContent += `${new Date(transaction.date).toLocaleDateString('tr-TR')},`;
          csvContent += `"${transaction.description}",`;
          csvContent += `"${category?.name || 'Bilinmeyen'}",`;
          csvContent += `${transaction.type === 'Income' ? 'Gelir' : 'Gider'},`;
          csvContent += `${transaction.amount}\n`;
        });
        
        return csvContent;
      }
    },
    
    budgets: {
      getAll: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockData.budgets;
      },
      
      create: async (budgetData) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newBudget = {
          id: Date.now().toString(),
          ...budgetData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        mockData.budgets.push(newBudget);
        return newBudget;
      },
      
      update: async (id, budgetData) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const index = mockData.budgets.findIndex(b => b.id === id);
        if (index !== -1) {
          mockData.budgets[index] = {
            ...mockData.budgets[index],
            ...budgetData,
            updatedAt: new Date().toISOString()
          };
          return mockData.budgets[index];
        }
        throw new Error('Budget not found');
      },
      
      delete: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const index = mockData.budgets.findIndex(b => b.id === id);
        if (index !== -1) {
          mockData.budgets.splice(index, 1);
          return true;
        }
        throw new Error('Budget not found');
      },
      
      getPerformanceStats: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
          budgetAdherence: 0.85,
          savingsRate: 0.23,
          mostOverspentCategory: {
            name: 'Eğlence',
            spent: 1200,
            limit: 1000
          },
          averageBudgetUtilization: 0.78
        };
      }
    },
    
    goals: {
      getAll: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockData.goals;
      },
      
      create: async (goalData) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newGoal = {
          id: Date.now().toString(),
          ...goalData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          progressHistory: [
            { date: new Date().toISOString(), amount: goalData.currentAmount }
          ]
        };
        mockData.goals.push(newGoal);
        return newGoal;
      },
      
      update: async (id, goalData) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const index = mockData.goals.findIndex(g => g.id === id);
        if (index !== -1) {
          mockData.goals[index] = {
            ...mockData.goals[index],
            ...goalData,
            updatedAt: new Date().toISOString()
          };
          return mockData.goals[index];
        }
        throw new Error('Goal not found');
      },
      
      delete: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const index = mockData.goals.findIndex(g => g.id === id);
        if (index !== -1) {
          mockData.goals.splice(index, 1);
          return true;
        }
        throw new Error('Goal not found');
      },
      
      getStats: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const activeGoals = mockData.goals.filter(g => !g.isCompleted);
        const completedGoals = mockData.goals.filter(g => g.isCompleted);
        
        return {
          activeGoals: activeGoals.length,
          completedGoals: completedGoals.length,
          totalSaved: mockData.goals.reduce((sum, g) => sum + g.currentAmount, 0),
          nearestGoal: activeGoals.length > 0 ? 
            activeGoals.sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))[0] : null,
          highestPriorityGoal: activeGoals.length > 0 ?
            activeGoals.sort((a, b) => b.priority - a.priority)[0] : null
        };
      }
    },
    
    reports: {
      getOverviewReport: async (params) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const { items: transactions } = await apiMethods.transactions.getAll({
          startDate: params.startDate,
          endDate: params.endDate
        });
        
        const totalIncome = transactions
          .filter(t => t.type === 'Income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpense = transactions
          .filter(t => t.type === 'Expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const netBalance = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) : 0;
        
        // Generate monthly trend data
        const monthlyTrend = {
          data: generateMonthlyTrendData(transactions),
          incomeChange: 0.15,
          expenseChange: 0.08
        };
        
        // Top categories
        const categoryTotals = {};
        transactions.forEach(t => {
          if (t.type === 'Expense') {
            const category = mockData.categories.find(c => c.id === t.categoryId);
            if (category) {
              if (!categoryTotals[category.id]) {
                categoryTotals[category.id] = {
                  name: category.name,
                  color: category.color,
                  amount: 0
                };
              }
              categoryTotals[category.id].amount += t.amount;
            }
          }
        });
        
        const topCategories = Object.values(categoryTotals)
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5)
          .map(cat => ({
            ...cat,
            percentage: totalExpense > 0 ? cat.amount / totalExpense : 0
          }));
        
        return {
          totalIncome,
          totalExpense,
          netBalance,
          savingsRate,
          transactionCount: transactions.length,
          averageExpense: transactions.filter(t => t.type === 'Expense').length > 0 ?
            totalExpense / transactions.filter(t => t.type === 'Expense').length : 0,
          topCategories,
          monthlyTrend
        };
      },
      
      getIncomeExpenseReport: async (params) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const { items: transactions } = await apiMethods.transactions.getAll(params);
        
        return {
          timeSeriesData: generateTimeSeriesData(transactions),
          monthlyData: generateMonthlyData(transactions),
          topIncomeCategories: getTopCategoriesByType(transactions, 'Income'),
          topExpenseCategories: getTopCategoriesByType(transactions, 'Expense'),
          incomeVsExpenseByDay: generateDayOfWeekData(transactions)
        };
      },
      
      getCategoryReport: async (params) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const { items: transactions } = await apiMethods.transactions.getAll(params);
        
        const categoryData = generateCategoryBreakdown(transactions);
        
        return {
          categoryData,
          categoryTrends: generateCategoryTrends(transactions),
          subCategoryAnalysis: [],
          categoryComparison: generateCategoryComparison(categoryData)
        };
      },
      
      getBudgetReport: async (params) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return {
          budgetPerformance: mockData.budgets,
          monthlyBudgetTrend: generateMonthlyBudgetTrend(),
          categoryBudgetComparison: generateCategoryBudgetComparison(),
          savingsProjection: generateSavingsProjection()
        };
      },
      
      getGoalReport: async (params) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return {
          activeGoals: mockData.goals.filter(g => !g.isCompleted),
          completedGoals: mockData.goals.filter(g => g.isCompleted),
          goalProgress: mockData.goals,
          savingsRate: 0.23,
          projections: mockData.goals.map(goal => ({
            name: goal.name,
            color: getGoalColor(goal.type),
            data: goal.progressHistory || []
          }))
        };
      }
    },
    
    dashboard: {
      getSummary: async (params) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return await apiMethods.reports.getOverviewReport(params);
      }
    }
  };
  
  // Helper functions for mock data generation
  function generateMonthlyTrendData(transactions) {
    const monthlyData = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { date: monthKey + '-01', income: 0, expense: 0 };
      }
      
      if (t.type === 'Income') {
        monthlyData[monthKey].income += t.amount;
      } else {
        monthlyData[monthKey].expense += t.amount;
      }
    });
    
    return Object.values(monthlyData).sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  
  function generateTimeSeriesData(transactions) {
    const dailyData = {};
    
    transactions.forEach(t => {
      const dateKey = new Date(t.date).toISOString().split('T')[0];
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { date: dateKey, income: 0, expense: 0, balance: 0 };
      }
      
      if (t.type === 'Income') {
        dailyData[dateKey].income += t.amount;
      } else {
        dailyData[dateKey].expense += t.amount;
      }
    });
    
    const sortedData = Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate running balance
    let runningBalance = 0;
    sortedData.forEach(day => {
      runningBalance += day.income - day.expense;
      day.balance = runningBalance;
    });
    
    return sortedData;
  }
  
  function generateMonthlyData(transactions) {
    const monthlyData = {};
    
    transactions.forEach(t => {
      const month = new Date(t.date).getMonth() + 1;
      
      if (!monthlyData[month]) {
        monthlyData[month] = { month, income: 0, expense: 0 };
      }
      
      if (t.type === 'Income') {
        monthlyData[month].income += t.amount;
      } else {
        monthlyData[month].expense += t.amount;
      }
    });
    
    return Object.values(monthlyData).sort((a, b) => a.month - b.month);
  }
  
  function getTopCategoriesByType(transactions, type) {
    const categoryTotals = {};
    
    transactions
      .filter(t => t.type === type)
      .forEach(t => {
        const category = mockData.categories.find(c => c.id === t.categoryId);
        if (category) {
          if (!categoryTotals[category.id]) {
            categoryTotals[category.id] = {
              name: category.name,
              color: category.color,
              amount: 0
            };
          }
          categoryTotals[category.id].amount += t.amount;
        }
      });
    
    const total = Object.values(categoryTotals).reduce((sum, c) => sum + c.amount, 0);
    
    return Object.values(categoryTotals)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(cat => ({
        ...cat,
        percentage: total > 0 ? cat.amount / total : 0
      }));
  }
  
  function generateDayOfWeekData(transactions) {
    const dayData = Array(7).fill(0).map((_, index) => ({
      day: index,
      income: 0,
      expense: 0
    }));
    
    transactions.forEach(t => {
      const dayOfWeek = new Date(t.date).getDay();
      if (t.type === 'Income') {
        dayData[dayOfWeek].income += t.amount;
      } else {
        dayData[dayOfWeek].expense += t.amount;
      }
    });
    
    return dayData;
  }
  
  function generateCategoryBreakdown(transactions) {
    const categoryTotals = {};
    
    transactions.forEach(t => {
      const category = mockData.categories.find(c => c.id === t.categoryId);
      if (category) {
        if (!categoryTotals[category.id]) {
          categoryTotals[category.id] = {
            name: category.name,
            type: category.type,
            color: category.color,
            amount: 0
          };
        }
        categoryTotals[category.id].amount += t.amount;
      }
    });
    
    const total = Object.values(categoryTotals).reduce((sum, c) => sum + c.amount, 0);
    
    return Object.values(categoryTotals).map(cat => ({
      ...cat,
      percentage: total > 0 ? cat.amount / total : 0
    }));
  }
  
  function generateCategoryTrends(transactions) {
    // Simplified - returns empty array for now
    return [];
  }
  
  function generateCategoryComparison(categoryData) {
    return categoryData.map(cat => ({
      name: cat.name,
      currentPeriod: cat.amount,
      previousPeriod: cat.amount * (0.8 + Math.random() * 0.4) // Random previous period data
    }));
  }
  
  function generateMonthlyBudgetTrend() {
    return Array(12).fill(0).map((_, index) => ({
      month: index + 1,
      budget: 8000 + Math.random() * 2000,
      actual: 7000 + Math.random() * 3000
    }));
  }
  
  function generateCategoryBudgetComparison() {
    return mockData.categories
      .filter(c => c.type === 'Expense')
      .map(cat => ({
        name: cat.name,
        budget: 1000 + Math.random() * 2000,
        actual: 800 + Math.random() * 1500
      }));
  }
  
  function generateSavingsProjection() {
    return Array(12).fill(0).map((_, index) => ({
      month: index,
      projection: 1000 + (index * 800) + Math.random() * 500
    }));
  }
  
  function getGoalColor(type) {
    const colors = {
      savings: '#4a86e8',
      debt: '#e74c3c',
      purchase: '#9b59b6',
      other: '#7f8c8d'
    };
    return colors[type] || colors.other;
  }
  
  return apiMethods;
};

const App = () => {
  const [apiService, setApiService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize API service
  useEffect(() => {
    try {
      const service = createApiService();
      setApiService(service);
      setLoading(false);
    } catch (err) {
      console.error('API service initialization failed:', err);
      setError('Uygulama başlatılırken bir hata oluştu.');
      setLoading(false);
    }
  }, []);
  
  // Loading state
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>ParaZeka Yükleniyor...</h2>
          <p>Yapay zeka destekli finans asistanınız hazırlanıyor</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="app-error">
        <div className="error-container">
          <h2>Bir Hata Oluştu</h2>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }
  
  // Main app
  return (
    <div className="App">
      <AppLayout apiService={apiService} />
    </div>
  );
};

export default App;