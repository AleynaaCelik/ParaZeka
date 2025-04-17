// src/pages/Goals.js
import React from 'react';

const Goals = () => {
  return (
    <div className="goals-page">
      <h1>Finansal Hedefler</h1>
      
      <div className="goals-header">
        <button className="btn btn-primary">+ Yeni Hedef</button>
      </div>
      
      <div className="goals-cards">
        <div className="goal-card">
          <div className="goal-card-header">
            <h3>Tatil Fonu</h3>
            <span className="goal-badge">Devam Ediyor</span>
          </div>
          <p className="goal-description">Yaz tatili için birikim yapıyorum.</p>
          <div className="goal-progress">
            <div className="progress-bar">
              <div className="progress" style={{ width: '60%' }}></div>
            </div>
            <div className="goal-numbers">
              <span>₺6,000 / ₺10,000</span>
              <span className="goal-percentage">60%</span>
            </div>
          </div>
          <div className="goal-details">
            <div className="goal-detail">
              <span>Başlangıç Tarihi</span>
              <span>01.01.2025</span>
            </div>
            <div className="goal-detail">
              <span>Hedef Tarihi</span>
              <span>01.07.2025</span>
            </div>
            <div className="goal-detail">
              <span>Kalan Süre</span>
              <span>75 gün</span>
            </div>
          </div>
          <div className="goal-actions">
            <button className="btn btn-outline">Para Ekle</button>
            <button className="btn btn-outline">Düzenle</button>
          </div>
        </div>
        
        <div className="goal-card">
          <div className="goal-card-header">
            <h3>Acil Durum Fonu</h3>
            <span className="goal-badge">Devam Ediyor</span>
          </div>
          <p className="goal-description">Beklenmeyen durumlar için acil durum fonu.</p>
          <div className="goal-progress">
            <div className="progress-bar">
              <div className="progress" style={{ width: '40%' }}></div>
            </div>
            <div className="goal-numbers">
              <span>₺8,000 / ₺20,000</span>
              <span className="goal-percentage">40%</span>
            </div>
          </div>
          <div className="goal-details">
            <div className="goal-detail">
              <span>Başlangıç Tarihi</span>
              <span>01.10.2024</span>
            </div>
            <div className="goal-detail">
              <span>Hedef Tarihi</span>
              <span>01.10.2025</span>
            </div>
            <div className="goal-detail">
              <span>Kalan Süre</span>
              <span>168 gün</span>
            </div>
          </div>
          <div className="goal-actions">
            <button className="btn btn-outline">Para Ekle</button>
            <button className="btn btn-outline">Düzenle</button>
          </div>
        </div>
        
        <div className="goal-card completed">
          <div className="goal-card-header">
            <h3>Yeni Bilgisayar</h3>
            <span className="goal-badge success">Tamamlandı</span>
          </div>
          <p className="goal-description">Yeni bilgisayar almak için birikim.</p>
          <div className="goal-progress">
            <div className="progress-bar">
              <div className="progress" style={{ width: '100%' }}></div>
            </div>
            <div className="goal-numbers">
              <span>₺15,000 / ₺15,000</span>
              <span className="goal-percentage">100%</span>
            </div>
          </div>
          <div className="goal-details">
            <div className="goal-detail">
              <span>Başlangıç Tarihi</span>
              <span>01.01.2024</span>
            </div>
            <div className="goal-detail">
              <span>Tamamlanma Tarihi</span>
              <span>15.03.2025</span>
            </div>
            <div className="goal-detail">
              <span>Süre</span>
              <span>74 gün</span>
            </div>
          </div>
          <div className="goal-actions">
            <button className="btn btn-success">Tamamlandı</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;