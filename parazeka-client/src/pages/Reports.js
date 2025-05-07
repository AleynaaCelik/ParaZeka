// src/pages/Reports.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions } from '../store/transactionSlice';
import { fetchAccounts } from '../store/accountSlice';
import FinancialReports from '../components/Reports/FinancialReports';
import apiService from '../services/apiService';

const Reports = () => {
  const dispatch = useDispatch();
  const { loading: transactionsLoading } = useSelector(state => state.transactions);
  const { loading: accountsLoading } = useSelector(state => state.accounts);
  
  useEffect(() => {
    // Raporlar için gerekli verileri yükle
    dispatch(fetchTransactions({ pageSize: 1000 }));
    dispatch(fetchAccounts());
  }, [dispatch]);
  
  if (transactionsLoading || accountsLoading) {
    return <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Finansal veriler yükleniyor...</p>
    </div>;
  }
  
  return (
    <div className="reports-page">
      <h1>Finansal Raporlar</h1>
      
      <FinancialReports apiService={apiService} />
    </div>
  );
};

export default Reports;