// src/pages/Budgets.js
import React from 'react';

const Budgets = () => {
  return (
    <div className="budgets-page">
      <h1>Bütçeler</h1>
      
      <div className="budget-header">
        <button className="btn btn-primary">+ Yeni Bütçe</button>
      </div>
      
      <div className="budget-cards">
        <div className="budget-card">
          <div className="budget-header">
            <h3>Gıda Harcamaları</h3>
            <span className="budget-period">Nisan 2025</span>
          </div>
          <div className="budget-progress">
            <div className="progress-bar">
              <div className="progress" style={{ width: '70%' }}></div>
            </div>
            <div className="budget-numbers">
              <span>₺700 / ₺1,000</span>
              <span className="budget-percentage">70%</span>
            </div>
          </div>
          <div className="budget-footer">
            <button className="btn btn-outline">Detaylar</button>
            <button className="btn btn-outline">Düzenle</button>
          </div>
        </div>
        
        <div className="budget-card warning">
          <div className="budget-header">
            <h3>Eğlence</h3>
            <span className="budget-period">Nisan 2025</span>
          </div>
          <div className="budget-progress">
            <div className="progress-bar">
              <div className="progress" style={{ width: '85%' }}></div>
            </div>
            <div className="budget-numbers">
              <span>₺425 / ₺500</span>
              <span className="budget-percentage">85%</span>
            </div>
          </div>
          <div className="budget-footer">
            <button className="btn btn-outline">Detaylar</button>
            <button className="btn btn-outline">Düzenle</button>
          </div>
        </div>
        
        <div className="budget-card danger">
          <div className="budget-header">
            <h3>Alışveriş</h3>
            <span className="budget-period">Nisan 2025</span>
          </div>
          <div className="budget-progress">
            <div className="progress-bar">
              <div className="progress" style={{ width: '110%' }}></div>
            </div>
            <div className="budget-numbers">
              <span>₺550 / ₺500</span>
              <span className="budget-percentage">110%</span>
            </div>
          </div>
          <div className="budget-footer">
            <button className="btn btn-outline">Detaylar</button>
            <button className="btn btn-outline">Düzenle</button>
          </div>
        </div>
        
        <div className="budget-card success">
          <div className="budget-header">
            <h3>Ulaşım</h3>
            <span className="budget-period">Nisan 2025</span>
          </div>
          <div className="budget-progress">
            <div className="progress-bar">
              <div className="progress" style={{ width: '40%' }}></div>
            </div>
            <div className="budget-numbers">
              <span>₺200 / ₺500</span>
              <span className="budget-percentage">40%</span>
            </div>
          </div>
          <div className="budget-footer">
            <button className="btn btn-outline">Detaylar</button>
            <button className="btn btn-outline">Düzenle</button>
          </div>
        </div>
      </div>
      
      <div className="budget-summary card">
        <h3>Toplam Bütçe Durumu</h3>
        <div className="budget-progress">
          <div className="progress-bar">
            <div className="progress" style={{ width: '65%' }}></div>
          </div>
          <div className="budget-numbers">
            <span>₺1,875 / ₺2,500</span>
            <span className="budget-percentage">65%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budgets;