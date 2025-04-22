// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basit doğrulama
    if (!formData.email || !formData.password) {
      setError('Email ve şifre gereklidir.');
      return;
    }
    
    // Şimdilik basit bir simülasyon (gerçek API çağrısı yapılmalı)
    if (formData.email === 'demo@example.com' && formData.password === 'password') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/');
    } else {
      setError('Geçersiz email veya şifre.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>ParaZeka</h1>
          <p>Finansal geleceğinizi akıllıca yönetin</p>
        </div>
        
        <div className="login-form-container">
          <h2>Giriş Yap</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">E-posta</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="E-posta adresiniz"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Şifre</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Şifreniz"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-check mb-3">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe" className="form-check-label">
                Beni hatırla
              </label>
            </div>
            
            <button type="submit" className="btn btn-primary btn-block">
              Giriş Yap
            </button>
          </form>
          
          <div className="mt-3 text-center">
            <Link to="/forgot-password">Şifremi unuttum</Link>
          </div>
          
          <div className="mt-4 text-center">
            Hesabınız yok mu? <Link to="/register">Kayıt Ol</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;