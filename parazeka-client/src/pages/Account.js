// src/pages/Accounts.js
import React from 'react';

const Accounts = () => {
  return (
    <div className="accounts-page">
      <h1>Hesaplar</h1>
      
      <div className="account-header">
        <button className="btn btn-primary">+ Yeni Hesap</button>
      </div>
      
      <div className="account-cards">
        <div className="account-card">
          <div className="account-card-header">
            <span className="account-type">Vadesiz Hesap</span>
            <h3>İş Bankası Hesabı</h3>
          </div>
          <p className="account-number">TR12 3456 7890 1234 5678 90</p>
          <div className="amount">₺3,250.00</div>
          <div className="account-actions">
            <button className="btn btn-outline">İşlemler</button>
            <button className="btn btn-outline">Düzenle</button>
          </div>
        </div>
        
        <div className="account-card credit">
          <div className="account-card-header">
            <span className="account-type">Kredi Kartı</span>
            <h3>Garanti Bonus Kart</h3>
          </div>
          <p className="account-number">**** **** **** 5678</p>
          <div className="amount expense">-₺1,500.00</div>
          <div className="account-actions">
            <button className="btn btn-outline">İşlemler</button>
            <button className="btn btn-outline">Düzenle</button>
          </div>
        </div>
        
        <div className="account-card savings">
          <div className="account-card-header">
            <span className="account-type">Birikim Hesabı</span>
            <h3>Akbank Tasarruf</h3>
          </div>
          <p className="account-number">TR98 7654 3210 9876 5432 10</p>
          <div className="amount">₺2,500.00</div>
          <div className="account-actions">
            <button className="btn btn-outline">İşlemler</button>
            <button className="btn btn-outline">Düzenle</button>
          </div>
        </div>
      </div>
      
      <div className="account-summary card">
        <h3>Toplam Bakiye Özeti</h3>
        <div className="summary-row">
          <span>Toplam Varlıklar</span>
          <span className="amount">₺5,750.00</span>
        </div>
        <div className="summary-row">
          <span>Toplam Borçlar</span>
          <span className="amount expense">₺1,500.00</span>
        </div>
        <div className="summary-row total">
          <span>Net Toplam</span>
          <span className="amount">₺4,250.00</span>
        </div>
      </div>
    </div>
  );
};

export default Accounts;