import React, { useState, useRef, useEffect } from 'react';
import './CompanionChatInput.css';

const CompanionChatInput = ({ value, onChange, onSubmit, loading, darkMode }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const textareaRef = useRef(null);

  const companionPrompts = [
    "I'm here to listen... what's on your mind? 💙",
    "Take your time, share whatever feels right... 🤗",
    "I'm here for you... tell me about your day 🌸",
    "What's weighing on your heart today? 💜",
    "I'm listening with care... share your thoughts 🌿",
    "You're safe here... what would you like to talk about? 🕊️",
    "I'm here to support you... what's happening? 🌺",
    "Take a deep breath... I'm here to listen 🦋"
  ];

  const encouragements = [
    "Thank you for trusting me with your thoughts 💝",
    "I'm honored you're sharing this with me 🌸",
    "Your feelings are completely valid 💚",
    "I'm here with you through this 🤲",
    "You're being so brave by opening up 🌟"
  ];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [value]);

  // Rotate prompts every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrompt(prev => (prev + 1) % companionPrompts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Show encouragement when user starts typing
  useEffect(() => {
    if (value.length > 10 && !showEncouragement) {
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 3000);
    }
  }, [value, showEncouragement]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && !loading) {
      onSubmit();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`companion-chat-container ${darkMode ? 'dark' : ''}`}>
      {/* Floating encouragement */}
      {showEncouragement && (
        <div className="floating-encouragement">
          {encouragements[Math.floor(Math.random() * encouragements.length)]}
        </div>
      )}
      
      <div className="companion-chat-wrapper">
        <form onSubmit={handleSubmit} className="companion-form">
          <div className={`companion-input-container ${isFocused ? 'focused' : ''}`}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={companionPrompts[currentPrompt]}
              className="companion-textarea"
              disabled={loading}
              rows="1"
            />
            
            {/* Character count and word count */}
            {value.length > 0 && (
              <div className="input-stats">
                <span className="word-count">
                  {value.trim().split(/\s+/).filter(word => word.length > 0).length} words
                </span>
                <span className="char-count">{value.length} characters</span>
              </div>
            )}
            
            {/* Send button */}
            <button
              type="submit"
              disabled={!value.trim() || loading}
              className={`send-button ${!value.trim() || loading ? 'disabled' : 'active'}`}
            >
              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner-dot"></div>
                  <div className="spinner-dot"></div>
                  <div className="spinner-dot"></div>
                </div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanionChatInput;
