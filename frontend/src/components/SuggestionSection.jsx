import React, { useState } from 'react';
import './SuggestionSection.css';

const SuggestionSection = ({ suggestions, recommendations }) => {
  const [activeTab, setActiveTab] = useState('actions');

  // Debug logging to see what data we're receiving
  console.log('SuggestionSection received:', { suggestions, recommendations });
  console.log('Recommendations structure:', recommendations);
  
  const tabs = [
    { id: 'actions', label: '💡 Gentle Steps', icon: '🌱' },
    { id: 'quotes', label: '💭 Words of Comfort', icon: '🤗' },
    { id: 'movies', label: '🎬 Feel-Good Films', icon: '🍿' },
    { id: 'books', label: '📚 Healing Reads', icon: '�' },
    { id: 'exercise', label: '🏃 Mindful Movement', icon: '🦋' },
    { id: 'food', label: '🍽️ Nourishing Care', icon: '🌿' },
    { id: 'trips', label: '🗺️ Peaceful Places', icon: '�' },
    { id: 'links', label: '🔗 Support Resources', icon: '🤲' }
  ];

  return (
    <div className="suggestion-section">
      <h3>💙 Gentle Suggestions for You</h3>
      
      {/* Tab Navigation */}
      <div className="tab-navigation">
        {tabs.map(tab => (
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
                Share your thoughts to get personalized gentle steps
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
                <p>No quotes available right now. Try refreshing or check back later.</p>
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
                Movie recommendations will appear here to lift your spirits
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
                Book recommendations will appear here based on your needs
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
                Exercise suggestions will appear here to help you feel better
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
                Nutrition suggestions will appear here to support your wellbeing
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
                Activity ideas will appear here to brighten your day
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
                Support resources will appear here after our conversation
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionSection;
