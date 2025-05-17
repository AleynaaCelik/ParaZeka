// src/components/Dashboard/AiInsightCard.jsx
import React from 'react';
import { Lightbulb, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react';
import './AiInsightCard.css';

const AiInsightCard = ({ insight }) => {
  // İçgörü tipine göre ikon belirleme
  const renderInsightIcon = () => {
    switch (insight.type) {
      case 'tip':
        return <Lightbulb size={24} />;
      case 'warning':
        return <AlertCircle size={24} />;
      case 'saving':
        return <TrendingUp size={24} />;
      default:
        return <Lightbulb size={24} />;
    }
  };

  return (
    <div className={`insight-item ${insight.type}`}>
      <div className="insight-icon">
        {renderInsightIcon()}
      </div>
      
      <div className="insight-content">
        <div className="insight-title">{insight.title}</div>
        <div className="insight-description">{insight.description}</div>
        
        {insight.actionLink && (
          <a href={insight.actionLink} className="insight-action">
            {insight.actionText || 'Daha Fazla Bilgi'}
            <ArrowRight size={16} />
          </a>
        )}

        {insight.parameters && insight.parameters.length > 0 && (
          <div className="insight-parameters">
            {insight.parameters.map((param, index) => (
              <div key={index} className="insight-parameter">
                <span className="parameter-label">{param.label}:</span>
                <span className="parameter-value">{param.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiInsightCard;