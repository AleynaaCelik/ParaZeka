import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, BarChart2, RefreshCw, HelpCircle, PieChart } from 'lucide-react';
import aiService from '../../services/aiService';
import './FinanceAssistant.css';

const FinanceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Merhaba! Ben ParaZeka Finans Asistanınızım. Size finansal konularda nasıl yardımcı olabilirim?',
      isBot: true,
      suggestions: [
        'Bütçemi nasıl yönetebilirim?',
        'Bu ay ne kadar harcama yapacağım?',
        'Tasarruf için önerilerin var mı?',
        'Finansal durumumu analiz et'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickActions, setQuickActions] = useState([
    { id: 'budget', icon: <PieChart size={16} />, text: 'Bütçe Analizi' },
    { id: 'forecast', icon: <BarChart2 size={16} />, text: 'Gelecek Ay Tahmini' },
    { id: 'tips', icon: <HelpCircle size={16} />, text: 'Tasarruf İpuçları' },
    { id: 'refresh', icon: <RefreshCw size={16} />, text: 'Analizi Yenile' }
  ]);
  const endOfMessagesRef = useRef(null);

  // Mesajların sonuna otomatik kaydırma
  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleQuickAction = async (actionId) => {
    setIsLoading(true);
    let userMessage = '';
    
    switch(actionId) {
      case 'budget':
        userMessage = 'Bütçemi analiz eder misin?';
        break;
      case 'forecast':
        userMessage = 'Önümüzdeki ay ne kadar harcama yapacağım?';
        break;
      case 'tips':
        userMessage = 'Bütçeme göre tasarruf önerileri verir misin?';
        break;
      case 'refresh':
        userMessage = 'Finansal durumumu analiz et ve öneriler sun';
        break;
      default:
        userMessage = 'Finansal durumumu analiz et';
    }
    
    addMessage(userMessage, false);
    
    try {
      const response = await aiService.askFinancialQuestion(userMessage);
      
      // Gelecek ay tahmini için ekstra veri alıp göster
      if (actionId === 'forecast') {
        const forecastAmount = await aiService.getMonthlyForecast(1);
        const botMessage = {
          id: Date.now() + 1,
          text: `${response.answer} Önümüzdeki ay tahmini harcamanız: ₺${forecastAmount.toFixed(2)}`,
          isBot: true
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const botMessage = {
          id: Date.now() + 1,
          text: response.answer,
          isBot: true,
          suggestions: getSuggestions(userMessage, response.answer)
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('AI cevabı alınamadı:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Üzgünüm, şu anda isteğinizi işleyemiyorum. Lütfen daha sonra tekrar deneyin.',
        isBot: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestions = (question, answer) => {
    // Soru ve cevaba göre ilgili öneriler oluştur
    if (question.includes('bütçe') || answer.includes('bütçe')) {
      return [
        '50/30/20 bütçe kuralı nedir?',
        'Bütçemi nasıl takip edebilirim?',
        'Bütçemi hangi kategorilere ayırmalıyım?'
      ];
    } else if (question.includes('tasarruf') || answer.includes('tasarruf')) {
      return [
        'Daha fazla tasarruf için ne yapabilirim?',
        'Acil durum fonu oluşturmalı mıyım?',
        'Hangi harcamalarımı azaltabilirim?'
      ];
    } else if (question.includes('yatırım') || answer.includes('yatırım')) {
      return [
        'Hangi yatırım araçları var?',
        'Düşük riskli yatırımlar nelerdir?',
        'Yatırım için ne kadar para ayırmalıyım?'
      ];
    }
    
    // Genel öneriler
    return [
      'Finansal hedefler belirlememe yardım et',
      'Gelirimi artırmak için ne yapabilirim?',
      'Finansal sağlığımı nasıl iyileştirebilirim?'
    ];
  };

  const addMessage = (text, isBot, suggestions = []) => {
    const newMessage = {
      id: Date.now(),
      text,
      isBot,
      suggestions
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;
    
    // Kullanıcı mesajını ekle
    addMessage(inputText, false);
    setInputText('');
    setIsLoading(true);
    
    try {
      // AI servisi ile cevap al
      const response = await aiService.askFinancialQuestion(inputText);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.answer,
        isBot: true,
        suggestions: getSuggestions(inputText, response.answer)
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('AI cevabı alınamadı:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Üzgünüm, şu anda sorunuzu yanıtlayamıyorum. Lütfen daha sonra tekrar deneyin.',
        isBot: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputText(suggestion);
    handleSubmit({ preventDefault: () => {} });
  };

  // Enter tuşuyla mesaj gönderme
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="finance-assistant-container">
      {/* Chatbot açma/kapama butonu */}
      <button
        className="finance-assistant-button"
        onClick={toggleChat}
        aria-label="Finans Asistanı"
      >
        <MessageCircle size={24} />
      </button>
      
      {/* Chat penceresi */}
      {isOpen && (
        <div className="finance-assistant-panel">
          <div className="finance-assistant-header">
            <h3>ParaZeka Finans Asistanı</h3>
            <button 
              className="finance-assistant-close" 
              onClick={toggleChat}
              aria-label="Kapat"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Hızlı Eylemler */}
          <div className="finance-assistant-quick-actions">
            {quickActions.map(action => (
              <button 
                key={action.id}
                className="quick-action-button"
                onClick={() => handleQuickAction(action.id)}
                disabled={isLoading}
              >
                {action.icon}
                <span>{action.text}</span>
              </button>
            ))}
          </div>
          
          <div className="finance-assistant-messages">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`finance-assistant-message ${
                  message.isBot ? 'bot-message' : 'user-message'
                }`}
              >
                <div className="message-text">{message.text}</div>
                
                {message.isBot && message.suggestions && message.suggestions.length > 0 && (
                  <div className="message-suggestions">
                    {message.suggestions.map((suggestion, index) => (
                      <button 
                        key={index} 
                        className="suggestion-button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={isLoading}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="finance-assistant-message bot-message loading">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}
            
            <div ref={endOfMessagesRef} />
          </div>
          
          <form className="finance-assistant-input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Finansal sorunuzu yazın..."
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !inputText.trim()}
              aria-label="Gönder"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FinanceAssistant;