// src/pages/Dashboard.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions } from '../store/transactionSlice';
import { fetchAccounts } from '../store/accountSlice';
import FinancialInsights from '../components/AI/FinancialInsights';
import FinanceAssistant from '../components/AI/FinanceAssistant';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { transactions, loading: transactionsLoading } = useSelector(state => state.transactions);
  const { accounts, loading: accountsLoading } = useSelector(state => state.accounts);

  useEffect(() => {
    dispatch(fetchTransactions({ pageNumber: 1, pageSize: 5 }));
    dispatch(fetchAccounts());
  }, [dispatch]);

  // Hesap bakiyelerini hesaplama
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  
  // Bu ay gelir ve giderleri hesaplama
  const thisMonthIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const thisMonthExpense = transactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (transactionsLoading || accountsLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="card-container">
        <div className="card">
          <h2>Toplam Bakiye</h2>
          <p className="amount">₺{totalBalance.toFixed(2)}</p>
          <p className="meta">Tüm hesaplarınız</p>
        </div>
        
        <div className="card">
          <h2>Bu Ay Gelir</h2>
          <p className="amount income">₺{thisMonthIncome.toFixed(2)}</p>
          <p className="meta">Nisan 2025</p>
        </div>
        
        <div className="card">
          <h2>Bu Ay Gider</h2>
          <p className="amount expense">₺{thisMonthExpense.toFixed(2)}</p>
          <p className="meta">Nisan 2025</p>
        </div>
      </div>
      
      {/* Finansal Öngörüler */}
      <FinancialInsights />
      
      <div className="recent-transactions">
        <h2>Son İşlemler</h2>
        <div className="card">
          {transactions.length > 0 ? (
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
                {transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.transactionDate).toLocaleDateString('tr-TR')}</td>
                    <td>{transaction.description}</td>
                    <td>
                      <span className="category-badge">{transaction.categoryName}</span>
                    </td>
                    <td className={`amount ${transaction.type === 'Income' ? 'income' : 'expense'}`}>
                      {transaction.type === 'Income' ? '+' : '-'}₺{transaction.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Henüz işlem kaydınız bulunmamaktadır.</p>
          )}
        </div>
      </div>
      
      {/* Finans Asistanı (sabit konumda olacağı için sayfa yapısını etkilemez) */}
      <FinanceAssistant />
    </div>
  );
};

export default Dashboard;