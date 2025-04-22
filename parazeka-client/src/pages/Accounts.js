// src/pages/Accounts.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAccounts } from '../store/accountSlice';

const Accounts = () => {
  const dispatch = useDispatch();
  const { accounts, loading, error } = useSelector(state => state.accounts);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  // Varlıklar, borçlar ve net bakiyeyi hesapla
  const totalAssets = accounts
    .filter(account => account.balance > 0)
    .reduce((sum, account) => sum + account.balance, 0);

  const totalLiabilities = accounts
    .filter(account => account.balance < 0)
    .reduce((sum, account) => sum + Math.abs(account.balance), 0);

  const netBalance = totalAssets - totalLiabilities;

  if (loading) {
    return <div>Hesaplar yükleniyor...</div>;
  }

  if (error) {
    return <div>Hata: {error}</div>;
  }

  return (
    <div className="accounts-page">
      <h1>Hesaplar</h1>
      
      <div className="account-header">
        <button className="btn btn-primary">+ Yeni Hesap</button>
      </div>
      
      <div className="account-cards">
        {accounts.map(account => (
          <div 
            key={account.id} 
            className={`account-card ${account.balance < 0 ? 'credit' : account.accountType.includes('Birikim') ? 'savings' : ''}`}
          >
            <div className="account-card-header">
              <span className="account-type">{account.accountType}</span>
              <h3>{account.name}</h3>
            </div>
            <p className="account-number">{account.accountNumber}</p>
            <div className={`amount ${account.balance < 0 ? 'expense' : ''}`}>
              ₺{Math.abs(account.balance).toFixed(2)}
            </div>
            <div className="account-actions">
              <button className="btn btn-outline">İşlemler</button>
              <button className="btn btn-outline">Düzenle</button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="account-summary card">
        <h3>Toplam Bakiye Özeti</h3>
        <div className="summary-row">
          <span>Toplam Varlıklar</span>
          <span className="amount">₺{totalAssets.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Toplam Borçlar</span>
          <span className="amount expense">₺{totalLiabilities.toFixed(2)}</span>
        </div>
        <div className="summary-row total">
          <span>Net Toplam</span>
          <span className="amount">₺{netBalance.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default Accounts;