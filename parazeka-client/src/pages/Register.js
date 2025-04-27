// src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Şifre doğrulama kontrolü
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    
    try {
      const response = await authService.register(formData);
      
      // Başarılı kayıt sonrası giriş sayfasına yönlendir
      navigate('/login', { state: { message: 'Kayıt başarılı! Lütfen giriş yapın.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt sırasında bir hata oluştu');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>ParaZeka'ya Kaydolun</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Kullanıcı Adı</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label>E-posta</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label>Şifre</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label>Şifre Tekrar</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-block">
            Kaydol
          </button>
        </form>
        
        <div className="auth-links mt-3">
          Zaten hesabınız var mı? <Link to="/login">Giriş Yapın</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;