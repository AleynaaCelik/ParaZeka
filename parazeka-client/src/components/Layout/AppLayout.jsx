// src/components/Layout/AppLayout.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, CreditCard, Target, FileText, Settings, 
  User, Bell, Search, Menu, X, Home, TrendingUp,
  ArrowUpCircle, ArrowDownCircle, DollarSign, LogOut,
  HelpCircle, Sun, Moon
} from 'lucide-react';
import Dashboard from '../Dashboard/Dashboard';
import CategoryManager from '../Categories/CategoryManager';
import TransactionManager from '../Transactions/TransactionManager';
import BudgetManager from '../Budgets/BudgetManager';
import GoalManager from '../Goals/GoalManager';
import ReportManager from '../Reports/ReportManager';
import './AppLayout.css';

const AppLayout = ({ apiService }) => {
  // Navigation state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // User state
  const [user, setUser] = useState({
    name: 'Kullanıcı Adı',
    email: 'kullanici@email.com',
    avatar: null
  });
  
  // Theme state
  const [darkMode, setDarkMode] = useState(false);
  
  // Quick stats state (Dashboard için küçük önizleme)
  const [quickStats, setQuickStats] = useState({
    balance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    savingsRate: 0
  });
  
  // Navigation menü items
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Ana Sayfa',
      icon: Home,
      component: Dashboard
    },
    {
      id: 'transactions',
      label: 'İşlemler',
      icon: CreditCard,
      component: TransactionManager
    },
    {
      id: 'categories',
      label: 'Kategoriler',
      icon: BarChart3,
      component: CategoryManager
    },
    {
      id: 'budgets',
      label: 'Bütçeler',
      icon: DollarSign,
      component: BudgetManager
    },
    {
      id: 'goals',
      label: 'Hedefler',
      icon: Target,
      component: GoalManager
    },
    {
      id: 'reports',
      label: 'Raporlar',
      icon: FileText,
      component: ReportManager
    }
  ];
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      
      // ESC to close search/sidebar
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSidebarOpen(false);
      }
      
      // Alt + number for quick navigation
      if (e.altKey && e.key >= '1' && e.key <= '6') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (menuItems[index]) {
          setActiveTab(menuItems[index].id);
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [menuItems]);
  
  // Load quick stats
  useEffect(() => {
    const loadQuickStats = async () => {
      try {
        // Bu örnekte mock data kullanıyoruz
        // Gerçek uygulamada apiService.dashboard.getQuickStats() çağrılır
        setQuickStats({
          balance: 25430,
          monthlyIncome: 15000,
          monthlyExpense: 8570, 
          savingsRate: 0.23
        });
      } catch (err) {
        console.error('Quick stats yüklenirken hata:', err);
      }
    };
    
    loadQuickStats();
  }, []);
  
  // Navigation functions
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  }, []);
  
  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);
  
  const handleLogout = useCallback(() => {
    // Logout işlemi
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      // API'ye logout isteği gönder
      // localStorage'ı temizle
      // Login sayfasına yönlendir
      console.log('Logout yapılıyor...');
    }
  }, []);
  
  const toggleTheme = useCallback(() => {
    setDarkMode(prev => {
      const newMode = !prev;
      document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  }, []);
  
  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      const isDark = savedTheme === 'dark';
      setDarkMode(isDark);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);
  
  // Format currency
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);
  
  // Get active component
  const getActiveComponent = useCallback(() => {
    const activeMenuItem = menuItems.find(item => item.id === activeTab);
    if (activeMenuItem) {
      const Component = activeMenuItem.component;
      return <Component apiService={apiService} />;
    }
    return <Dashboard apiService={apiService} />;
  }, [activeTab, apiService, menuItems]);
  
  // Render navigation
  const renderNavigation = () => (
    <nav className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <TrendingUp size={24} />
          </div>
          <span className="logo-text">ParaZeka</span>
        </div>
        
        <button 
          className="sidebar-close"
          onClick={handleSidebarToggle}
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="quick-stats">
        <div className="quick-stat">
          <div className="stat-icon balance">
            <DollarSign size={16} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Bakiye</div>
            <div className="stat-value">{formatCurrency(quickStats.balance)}</div>
          </div>
        </div>
        
        <div className="quick-stats-row">
          <div className="mini-stat income">
            <ArrowUpCircle size={14} />
            <span>{formatCurrency(quickStats.monthlyIncome)}</span>
          </div>
          <div className="mini-stat expense">
            <ArrowDownCircle size={14} />
            <span>{formatCurrency(quickStats.monthlyExpense)}</span>
          </div>
        </div>
      </div>
      
      <div className="nav-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleTabChange(item.id)}
              title={item.label}
            >
              <Icon size={20} />
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
      
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>
        
        <div className="footer-actions">
          <button className="footer-btn" onClick={toggleTheme} title="Tema Değiştir">
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="footer-btn" title="Ayarlar">
            <Settings size={16} />
          </button>
          <button className="footer-btn" title="Yardım">
            <HelpCircle size={16} />
          </button>
          <button className="footer-btn logout" onClick={handleLogout} title="Çıkış">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
  
  // Render header
  const renderHeader = () => (
    <header className="app-header">
      <div className="header-left">
        <button 
          className="menu-toggle"
          onClick={handleSidebarToggle}
        >
          <Menu size={20} />
        </button>
        
        <div className="page-title">
          <h1>{menuItems.find(item => item.id === activeTab)?.label || 'ParaZeka'}</h1>
        </div>
      </div>
      
      <div className="header-center">
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Ara... (Ctrl+K)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>
      
      <div className="header-right">
        <div className="header-stats">
          <div className="header-stat">
            <span className="header-stat-label">Bu Ay</span>
            <span className="header-stat-value income">
              +{formatCurrency(quickStats.monthlyIncome)}
            </span>
          </div>
          
          <div className="header-stat">
            <span className="header-stat-label">Harcama</span>
            <span className="header-stat-value expense">
              -{formatCurrency(quickStats.monthlyExpense)}
            </span>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="header-btn notification-btn" title="Bildirimler">
            <Bell size={18} />
            <span className="notification-badge">3</span>
          </button>
          
          <div className="user-menu">
            <button className="user-menu-toggle">
              <div className="user-avatar small">
                <User size={16} />
              </div>
              <span className="user-name-short">{user.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
  
  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {renderNavigation()}
      
      <div className="main-content">
        {renderHeader()}
        
        <main className="content-area">
          <div className="content-wrapper">
            {getActiveComponent()}
          </div>
        </main>
        
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-left">
              <span className="footer-text">
                © 2024 ParaZeka - Yapay Zeka Destekli Kişisel Finans Asistanı
              </span>
            </div>
            
            <div className="footer-right">
              <div className="footer-links">
                <a href="#privacy" className="footer-link">Gizlilik</a>
                <a href="#terms" className="footer-link">Kullanım Şartları</a>
                <a href="#support" className="footer-link">Destek</a>
              </div>
              
              <div className="version-info">
                <span className="version">v1.0.0</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Search Modal */}
      {showSearch && (
        <div className="search-modal">
          <div className="search-modal-content">
            <div className="search-modal-header">
              <Search size={20} />
              <input
                type="text"
                placeholder="Ne aramak istiyorsunuz?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-modal-input"
                autoFocus
              />
              <button 
                className="search-modal-close"
                onClick={() => setShowSearch(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="search-results">
              <div className="search-section">
                <h4>Hızlı Eylemler</h4>
                <div className="search-items">
                  <button className="search-item" onClick={() => handleTabChange('transactions')}>
                    <CreditCard size={16} />
                    <span>Yeni İşlem Ekle</span>
                  </button>
                  <button className="search-item" onClick={() => handleTabChange('budgets')}>
                    <DollarSign size={16} />
                    <span>Bütçe Oluştur</span>
                  </button>
                  <button className="search-item" onClick={() => handleTabChange('goals')}>
                    <Target size={16} />
                    <span>Hedef Belirle</span>
                  </button>
                </div>
              </div>
              
              <div className="search-section">
                <h4>Sayfalar</h4>
                <div className="search-items">
                  {menuItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <button 
                        key={item.id}
                        className="search-item"
                        onClick={() => {
                          handleTabChange(item.id);
                          setShowSearch(false);
                        }}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;