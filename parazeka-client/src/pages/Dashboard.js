// src/pages/Dashboard.js
import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="card-container">
        <div className="card">
          <h2>Toplam Bakiye</h2>
          <p className="amount">₺4,250.00</p>
          <p className="meta">Tüm hesaplarınız</p>
        </div>
        
        <div className="card">
          <h2>Bu Ay Gelir</h2>
          <p className="amount income">₺6,500.00</p>
          <p className="meta">Nisan 2025</p>
        </div>
        
        <div className="card">
          <h2>Bu Ay Gider</h2>
          <p className="amount expense">₺2,250.00</p>
          <p className="meta">Nisan 2025</p>
        </div>
      </div>
      
      <div className="recent-transactions">
        <h2>Son İşlemler</h2>
        <div className="card">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Açıklama</th>
                <th>Kategori</th>
                <th>Tutar</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>15.04.2025</td>
                <td>Market Alışverişi</td>
                <td>
                  <span className="category-badge">Gıda</span>
                </td>
                <td className="amount expense">-₺250.00</td>
              </tr>
              <tr>
                <td>14.04.2025</td>
                <td>Maaş</td>
                <td>
                  <span className="category-badge income">Maaş</span>
                </td>
                <td className="amount income">+₺6,500.00</td>
              </tr>
              <tr>
                <td>10.04.2025</td>
                <td>Elektrik Faturası</td>
                <td>
                  <span className="category-badge">Faturalar</span>
                </td>
                <td className="amount expense">-₺320.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;