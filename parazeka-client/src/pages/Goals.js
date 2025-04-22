// src/pages/Goals.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGoals } from '../store/goalSlice';

const Goals = () => {
  const dispatch = useDispatch();
  const { goals, loading, error } = useSelector(state => state.goals);

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  // Kalan günleri hesaplayan yardımcı fonksiyon
  const calculateRemainingDays = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const timeDiff = target - today;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };

  // Geçen günleri hesaplayan yardımcı fonksiyon
  const calculatePassedDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end - start;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return <div>Hedefler yükleniyor...</div>;
  }

  if (error) {
    return <div>Hata: {error}</div>;
  }

  return (
    <div className="goals-page">
      <h1>Finansal Hedefler</h1>
      
      <div className="goals-header">
        <button className="btn btn-primary">+ Yeni Hedef</button>
      </div>
      
      <div className="goals-cards">
        {goals.map(goal => {
          const percentage = (goal.currentAmount / goal.targetAmount) * 100;
          const isCompleted = goal.status === 'Completed';
          const remainingDays = isCompleted ? 0 : calculateRemainingDays(goal.targetDate);
          const passedDays = isCompleted 
            ? calculatePassedDays(goal.startDate, goal.targetDate)
            : calculatePassedDays(goal.startDate, new Date());
          
          return (
            <div 
              key={goal.id} 
              className={`goal-card ${isCompleted ? 'completed' : ''}`}
            >
              <div className="goal-card-header">
                <h3>{goal.name}</h3>
                <span className={`goal-badge ${isCompleted ? 'success' : ''}`}>
                  {isCompleted ? 'Tamamlandı' : 'Devam Ediyor'}
                </span>
              </div>
              <p className="goal-description">{goal.description}</p>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div 
                    className="progress" 
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="goal-numbers">
                  <span>₺{goal.currentAmount.toFixed(2)} / ₺{goal.targetAmount.toFixed(2)}</span>
                  <span className="goal-percentage">{percentage.toFixed(0)}%</span>
                </div>
              </div>
              <div className="goal-details">
                <div className="goal-detail">
                  <span>Başlangıç Tarihi</span>
                  <span>{new Date(goal.startDate).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="goal-detail">
                  <span>{isCompleted ? 'Tamamlanma Tarihi' : 'Hedef Tarihi'}</span>
                  <span>{new Date(goal.targetDate).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="goal-detail">
                  <span>{isCompleted ? 'Süre' : 'Kalan Süre'}</span>
                  <span>{isCompleted ? passedDays : remainingDays} gün</span>
                </div>
              </div>
              <div className="goal-actions">
                {isCompleted ? (
                  <button className="btn btn-success">Tamamlandı</button>
                ) : (
                  <>
                    <button className="btn btn-outline">Para Ekle</button>
                    <button className="btn btn-outline">Düzenle</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Goals;