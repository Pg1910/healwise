import React, { useState } from 'react';
import './SuggestionSection.css';

const SuggestionSection = ({ suggestions, recommendations }) => {
  const [activeTab, setActiveTab] = useState('actions');

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
            {suggestions?.map((action, index) => (
              <div key={index} className="action-card">
                <span className="action-bullet">•</span>
                {action}
              </div>
            ))}
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
                  <h4>{movie.title}</h4>
                  <p className="genre">{movie.genre}</p>
                  <p className="description">{movie.description}</p>
                  <p className="reason">{movie.reason}</p>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No movie recommendations available right now.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'books' && (
          <div className="books-panel">
            {recommendations?.books?.length > 0 ? (
              recommendations.books.map((book, index) => (
                <div key={index} className="book-card">
                  <h4>{book.title}</h4>
                  <p className="author">by {book.author}</p>
                  <p className="description">{book.description}</p>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No book recommendations available right now.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'exercise' && (
          <div className="exercise-panel">
            {recommendations?.exercises?.length > 0 ? (
              recommendations.exercises.map((exercise, index) => (
                <div key={index} className="exercise-card">
                  <h4>{exercise.exercise}</h4>
                  <p className="duration">{exercise.duration}</p>
                  <p className="benefit">{exercise.benefit}</p>
                  <p className="description">{exercise.description}</p>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No exercise recommendations available right now.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'food' && (
          <div className="food-panel">
            {recommendations?.nutrition?.length > 0 ? (
              recommendations.nutrition.map((food, index) => (
                <div key={index} className="food-card">
                  <h4>{food.food}</h4>
                  <p className="benefit">{food.benefit}</p>
                  <p className="description">{food.description}</p>
                  <p className="preparation">{food.preparation}</p>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No nutrition recommendations available right now.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="trips-panel">
            {recommendations?.activities?.length > 0 ? (
              recommendations.activities.map((activity, index) => (
                <div key={index} className="trip-card">
                  <h4>{activity.type}</h4>
                  <p className="suggestion">{activity.suggestion}</p>
                  <p className="benefit">{activity.benefit}</p>
                  <p className="duration">Duration: {activity.duration}</p>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No activity recommendations available right now.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <div className="links-panel">
            {recommendations?.resources?.length > 0 ? (
              recommendations.resources.map((resource, index) => (
                <div key={index} className="link-card">
                  <h4>{resource.title}</h4>
                  <p className="description">{resource.description}</p>
                  {resource.phone && <p className="phone">📞 {resource.phone}</p>}
                  <p className="type">Type: {resource.type}</p>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No resource links available right now.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionSection;
