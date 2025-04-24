import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import aiService from '../../services/aiService';
import './FinanceAssistant.css';

const FinanceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Merhaba! Ben ParaZeka Finans Asistanınızım. Size finansal konularda nasıl yardımcı olabilirim?',
      isBot: true
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;
    
    // Kullanıcı mesajını ekle
    const userMessage = {
      id: Date.now(),
      text: inputText,
      isBot: false
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // AI servisi ile cevap al
      const response = await aiService.askFinancialQuestion(inputText);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.answer,
        isBot: true
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
          
          <div className="finance-assistant-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`finance-assistant-message ${
                  message.isBot ? 'bot-message' : 'user-message'
                }`}
              >
                {message.text}
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