// src/pages/Transactions.js
import React from 'react';

const Transactions = () => {
  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>İşlemler</h1>
        <button className="btn btn-primary">Yeni İşlem Ekle</button>
      </div>
      
      <div className="card">
        <div className="filters">
          <input type="text" placeholder="İşlem ara..." className="search-input" />
          <div className="filter-buttons">
            <button className="btn btn-outline active">Tümü</button>
            <button className="btn btn-outline">Gelirler</button>
            <button className="btn btn-outline">Giderler</button>
          </div>
        </div>
        
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Açıklama</th>
              <th>Kategori</th>
              <th>Hesap</th>
              <th>Tutar</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>15.04.2025</td>
              <td>Market Alışverişi</td>
              <td>
                <span className="category-badge">Gıda</span>
              </td>
              <td>Vadesiz Hesap</td>
              <td className="amount expense">-₺250.00</td>
              <td>
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">🗑️</button>
              </td>
            </tr>
            <tr>
              <td>14.04.2025</td>
              <td>Maaş</td>
              <td>
                <span className="category-badge income">Maaş</span>
              </td>
              <td>Vadesiz Hesap</td>
              <td className="amount income">+₺6,500.00</td>
              <td>
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">🗑️</button>
              </td>
            </tr>
            <tr>
              <td>10.04.2025</td>
              <td>Elektrik Faturası</td>
              <td>
                <span className="category-badge">Faturalar</span>
              </td>
              <td>Kredi Kartı</td>
              <td className="amount expense">-₺320.00</td>
              <td>
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;