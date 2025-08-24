import React, { useState, useEffect } from 'react';
import './SuggestionSection.css';

const SuggestionSection = ({ 
  suggestions, 
  recommendations, 
  suggestion_mode = false, 
  suggestion_types = [],
  conversation_stage = "initial",
  onRequestSuggestions 
}) => {
  const [activeTab, setActiveTab] = useState('actions');

  // Debug logging to see what data we're receiving
  console.log('SuggestionSection received:', { 
    suggestions, 
    recommendations, 
    suggestion_mode, 
    suggestion_types, 
    conversation_stage 
  });
  
  const allTabs = [
    { id: 'actions', label: '💡 Gentle Steps', icon: '🌱', key: 'quotes' },
    { id: 'quotes', label: '💭 Words of Comfort', icon: '🤗', key: 'quotes' },
    { id: 'movies', label: '🎬 Feel-Good Films', icon: '🍿', key: 'movies' },
    { id: 'books', label: '📚 Healing Reads', icon: '📖', key: 'books' },
    { id: 'exercises', label: '🏃 Mindful Movement', icon: '🦋', key: 'exercises' },
    { id: 'nutrition', label: '🍽️ Nourishing Care', icon: '🌿', key: 'nutrition' },
    { id: 'activities', label: '🗺️ Peaceful Places', icon: '🌸', key: 'activities' },
    { id: 'resources', label: '🔗 Support Resources', icon: '🤲', key: 'resources' }
  ];

  // Determine which tabs to show based on conversation stage and suggestion mode
  const getAvailableTabs = () => {
    if (!suggestion_mode) {
      // Early stages of conversation - only show gentle steps and comfort
      return allTabs.filter(tab => ['actions', 'quotes'].includes(tab.id));
    }
    
    if (suggestion_types.length > 0) {
      // Specific suggestion types requested
      const typeMapping = {
        'feel_good_films': 'movies',
        'healing_reads': 'books', 
        'mindful_movement': 'exercises',
        'nourishing_care': 'nutrition',
        'peaceful_places': 'activities',
        'support_resources': 'resources',
        'gentle_steps': 'actions',
        'words_of_comfort': 'quotes'
      };
      
      const allowedIds = suggestion_types.map(type => typeMapping[type] || type);
      return allTabs.filter(tab => allowedIds.includes(tab.id));
    }
    
    // Default - show all tabs
    return allTabs;
  };

  const availableTabs = getAvailableTabs();
  
  // Auto-select first available tab if current tab is not available
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);

  const renderSuggestionPrompt = () => {
    if (conversation_stage === 'deep_dive' && !suggestion_mode) {
      return (
        <div className="suggestion-prompt">
          <div className="prompt-message">
            <h4>🌟 Would you like some personalized suggestions?</h4>
            <p>I can provide you with specific recommendations tailored to what you're experiencing right now.</p>
            <button 
              className="request-suggestions-btn"
              onClick={() => onRequestSuggestions && onRequestSuggestions()}
            >
              Yes, I'd like some suggestions
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderContent = (tab) => {
    const data = tab.id === 'actions' ? suggestions : recommendations?.[tab.key];
    
    if (!data || data.length === 0) {
      if (!suggestion_mode && tab.id !== 'actions' && tab.id !== 'quotes') {
        return (
          <div className="empty-content">
            <div className="empty-message">
              <h4>🌸 Suggestions Coming Soon</h4>
              <p>As our conversation deepens, I'll provide personalized {tab.label.toLowerCase()} recommendations.</p>
            </div>
          </div>
        );
      }
      
      return (
        <div className="empty-content">
          <div className="empty-message">
            <h4>💭 No suggestions yet</h4>
            <p>Continue our conversation and I'll provide helpful suggestions.</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`${tab.id}-panel`}>
        {data.map((item, index) => (
          <div key={index} className="suggestion-card">
            <span className="suggestion-bullet">•</span>
            <span className="suggestion-text">{item}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="suggestion-section">
      <div className="section-header">
        <h3>💙 {suggestion_mode ? 'Personalized Suggestions' : 'Gentle Guidance'}</h3>
        {conversation_stage !== 'initial' && (
          <div className="stage-indicator">
            <span className="stage-badge">{conversation_stage.replace('_', ' ')}</span>
          </div>
        )}
      </div>
      
      {renderSuggestionPrompt()}
      
      {/* Tab Navigation */}
      <div className="tab-navigation">
        {availableTabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Panels */}
      <div className="tab-content">
        {availableTabs.map(tab => (
          activeTab === tab.id && (
            <div key={tab.id} className="content-panel">
              {renderContent(tab)}
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default SuggestionSection;
