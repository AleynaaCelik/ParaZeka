// src/pages/Budgets.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBudgets } from '../store/budgetSlice';

const Budgets = () => {
  const dispatch = useDispatch();
  const { budgets, loading, error } = useSelector(state => state.budgets);

  useEffect(() => {
    dispatch(fetchBudgets());
  }, [dispatch]);

  // Bütçe durumunu belirleyen yardımcı fonksiyon
  const getBudgetStatusClass = (budget) => {
    const percentage = (budget.spent / budget.amount) * 100;
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    if (percentage <= 50) return 'success';
    return '';
  };

  // Toplam bütçe özeti
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  if (loading) {
    return <div>Bütçeler yükleniyor...</div>;
  }

  if (error) {
    return <div>Hata: {error}</div>;
  }

  return (
    <div className="budgets-page">
      <h1>Bütçeler</h1>
      
      <div className="budget-header">
        <button className="btn btn-primary">+ Yeni Bütçe</button>
      </div>
      
      <div className="budget-cards">
        {budgets.map(budget => {
          const percentage = (budget.spent / budget.amount) * 100;
          return (
            <div 
              key={budget.id} 
              className={`budget-card ${getBudgetStatusClass(budget)}`}
            >
              <div className="budget-header">
                <h3>{budget.name}</h3>
                <span className="budget-period">{budget.period}</span>
              </div>
              <div className="budget-progress">
                <div className="progress-bar">
                  <div 
                    className="progress" 
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="budget-numbers">
                  <span>₺{budget.spent.toFixed(2)} / ₺{budget.amount.toFixed(2)}</span>
                  <span className="budget-percentage">{percentage.toFixed(0)}%</span>
                </div>
              </div>
              <div className="budget-footer">
                <button className="btn btn-outline">Detaylar</button>
                <button className="btn btn-outline">Düzenle</button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="budget-summary card">
        <h3>Toplam Bütçe Durumu</h3>
        <div className="budget-progress">
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${Math.min(totalPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="budget-numbers">
            <span>₺{totalSpent.toFixed(2)} / ₺{totalBudget.toFixed(2)}</span>
            <span className="budget-percentage">{totalPercentage.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budgets;