import React, { useState } from 'react';
import './SuggestionSection.css';

const SuggestionSection = ({ 
  suggestions, 
  recommendations, 
  suggestion_mode = false, 
  suggestion_types = [],
  conversation_stage = "initial",
  onSuggestionRequest 
}) => {
  const [activeTab, setActiveTab] = useState('actions');
  const [requestedSuggestionType, setRequestedSuggestionType] = useState(null);

  // Debug logging to see what data we're receiving
  console.log('SuggestionSection received:', { 
    suggestions, 
    recommendations, 
    suggestion_mode, 
    suggestion_types,
    conversation_stage 
  });
  
  const allTabs = [
    { id: 'actions', label: '💡 Gentle Steps', icon: '🌱', key: 'gentle_steps' },
    { id: 'quotes', label: '💭 Words of Comfort', icon: '🤗', key: 'words_of_comfort' },
    { id: 'movies', label: '🎬 Feel-Good Films', icon: '🍿', key: 'feel_good_films' },
    { id: 'books', label: '📚 Healing Reads', icon: '📖', key: 'healing_reads' },
    { id: 'exercise', label: '🏃 Mindful Movement', icon: '🦋', key: 'mindful_movement' },
    { id: 'food', label: '🍽️ Nourishing Care', icon: '🌿', key: 'nourishing_care' },
    { id: 'trips', label: '🗺️ Peaceful Places', icon: '🗺️', key: 'peaceful_places' },
    { id: 'links', label: '🔗 Support Resources', icon: '🤲', key: 'support_resources' }
  ];

  // Filter tabs based on available suggestion types or show all if not in suggestion mode
  const availableTabs = suggestion_mode 
    ? allTabs.filter(tab => suggestion_types.includes(tab.key))
    : allTabs;

  const handleSuggestionRequest = (suggestionType) => {
    setRequestedSuggestionType(suggestionType);
    if (onSuggestionRequest) {
      onSuggestionRequest(suggestionType);
    }
  };

  const renderSuggestionTypeSelector = () => {
    if (!suggestion_mode || suggestion_types.length === 0) return null;

    return (
      <div className="suggestion-type-selector">
        <h4>🌟 What kind of support would help you right now?</h4>
        <p className="selector-description">
          Choose the type of suggestions you'd like to receive:
        </p>
        <div className="suggestion-type-grid">
          {suggestion_types.map(type => {
            const tab = allTabs.find(t => t.key === type);
            if (!tab) return null;
            
            return (
              <button
                key={type}
                className="suggestion-type-btn"
                onClick={() => handleSuggestionRequest(type)}
              >
                <span className="suggestion-icon">{tab.icon}</span>
                <span className="suggestion-label">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderConversationStageInfo = () => {
    const stageMessages = {
      initial: "🌱 We're just getting started. Feel free to share what's on your mind.",
      exploration: "🔍 I'm learning more about your situation. Thank you for sharing.",
      deep_dive: "💭 We're exploring deeper insights together. You're doing great.",
      closure: "🌟 Let's wrap up with some helpful resources and next steps."
    };

    return (
      <div className="conversation-stage-info">
        <p className="stage-message">{stageMessages[conversation_stage]}</p>
      </div>
    );
  };

  return (
    <div className="suggestion-section">
      <h3>💙 Personalized Support for You</h3>
      
      {renderConversationStageInfo()}
      
      {/* Show suggestion type selector if in suggestion mode */}
      {suggestion_mode && renderSuggestionTypeSelector()}
      
      {/* Tab Navigation - only show if we have content or not in suggestion mode */}
      {(!suggestion_mode || Object.keys(recommendations || {}).length > 0) && (
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
      )}

      {/* Content Panels - only show if we have content or not in suggestion mode */}
      {(!suggestion_mode || Object.keys(recommendations || {}).length > 0) && (
        <div className="tab-content">
          {activeTab === 'actions' && (
            <div className="actions-panel">
              {suggestions && suggestions.length > 0 ? (
                suggestions.map((action, index) => (
                  <div key={index} className="action-card">
                    <span className="action-bullet">•</span>
                    {action}
                  </div>
                ))
              ) : (
                <div className="action-card">
                  <span className="action-bullet">💙</span>
                  {suggestion_mode 
                    ? "Request gentle steps above to get personalized guidance"
                    : "Share your thoughts to get personalized gentle steps"
                  }
                </div>
              )}
            </div>
          )}

          {activeTab === 'quotes' && (
            <div className="quotes-panel">
              {recommendations?.quotes?.length > 0 ? (
                recommendations.quotes.map((quote, index) => (
                  <div key={index} className="quote-card">
                    <blockquote>"{quote}"</blockquote>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>{suggestion_mode 
                    ? "Request words of comfort above to receive inspiring quotes"
                    : "Comforting quotes will appear here as we talk"
                  }</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'movies' && (
            <div className="movies-panel">
              {recommendations?.movies?.length > 0 ? (
                recommendations.movies.map((movie, index) => (
                  <div key={index} className="movie-card">
                    <span className="movie-icon">🎬</span>
                    {movie}
                  </div>
                ))
              ) : (
                <div className="movie-card">
                  <span className="movie-icon">🍿</span>
                  {suggestion_mode 
                    ? "Request feel-good films above for personalized movie recommendations"
                    : "Movie recommendations will appear here to lift your spirits"
                  }
                </div>
              )}
            </div>
          )}

          {activeTab === 'books' && (
            <div className="books-panel">
              {recommendations?.books?.length > 0 ? (
                recommendations.books.map((book, index) => (
                  <div key={index} className="book-item">
                    <span className="book-icon">📚</span>
                    {book}
                  </div>
                ))
              ) : (
                <div className="book-item">
                  <span className="book-icon">📖</span>
                  {suggestion_mode 
                    ? "Request healing reads above for book recommendations"
                    : "Book recommendations will appear here based on your needs"
                  }
                </div>
              )}
            </div>
          )}

          {activeTab === 'exercise' && (
            <div className="exercise-panel">
              {recommendations?.exercises?.length > 0 ? (
                recommendations.exercises.map((exercise, index) => (
                  <div key={index} className="exercise-card">
                    <span className="exercise-icon">🏃‍♀️</span>
                    {exercise}
                  </div>
                ))
              ) : (
                <div className="exercise-card">
                  <span className="exercise-icon">💪</span>
                  {suggestion_mode 
                    ? "Request mindful movement above for exercise suggestions"
                    : "Exercise suggestions will appear here to help you feel better"
                  }
                </div>
              )}
            </div>
          )}

          {activeTab === 'food' && (
            <div className="food-panel">
              {recommendations?.nutrition?.length > 0 ? (
                recommendations.nutrition.map((food, index) => (
                  <div key={index} className="food-card">
                    <span className="food-icon">🍎</span>
                    {food}
                  </div>
                ))
              ) : (
                <div className="food-card">
                  <span className="food-icon">🥗</span>
                  {suggestion_mode 
                    ? "Request nourishing care above for nutrition suggestions"
                    : "Nutrition suggestions will appear here to support your wellbeing"
                  }
                </div>
              )}
            </div>
          )}

          {activeTab === 'trips' && (
            <div className="trips-panel">
              {recommendations?.activities?.length > 0 ? (
                recommendations.activities.map((activity, index) => (
                  <div key={index} className="activity-card">
                    <span className="activity-icon">🌟</span>
                    {activity}
                  </div>
                ))
              ) : (
                <div className="activity-card">
                  <span className="activity-icon">🎈</span>
                  {suggestion_mode 
                    ? "Request peaceful places above for activity ideas"
                    : "Activity ideas will appear here to brighten your day"
                  }
                </div>
              )}
            </div>
          )}

          {activeTab === 'links' && (
            <div className="links-panel">
              {recommendations?.resources?.length > 0 ? (
                recommendations.resources.map((resource, index) => (
                  <div key={index} className="link-card">
                    <span className="action-bullet">🔗</span>
                    {resource}
                  </div>
                ))
              ) : (
                <div className="link-card">
                  <span className="action-bullet">💙</span>
                  {suggestion_mode 
                    ? "Request support resources above for helpful links"
                    : "Support resources will appear here after our conversation"
                  }
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestionSection;
