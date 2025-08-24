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
                  <blockquote className="italic border-l-4 border-amber-400 pl-4 py-2">
                    "{quote}"
                  </blockquote>
                </div>
              ))
            ) : (
              <div className="empty-state text-center py-8">
                <p className="text-gray-600 mb-4">💝 Comforting words will appear here</p>
                <p className="text-sm text-gray-500">Share more about your feelings to receive personalized quotes of comfort</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'movies' && (
          <div className="movies-panel">
            {recommendations?.movies?.length > 0 ? (
              recommendations.movies.map((movie, index) => (
                <div key={index} className="movie-card bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200 mb-3">
                  <div className="flex items-start space-x-3">
                    <span className="movie-icon text-2xl">🎬</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{movie.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{movie.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="bg-purple-100 px-2 py-1 rounded-full">{movie.mood}</span>
                        {movie.duration && <span>⏱️ {movie.duration}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state text-center py-8">
                <p className="text-gray-600 mb-4">🍿 Feel-good films will appear here</p>
                <p className="text-sm text-gray-500">Share your current mood to get personalized movie recommendations</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'books' && (
          <div className="books-panel">
            {recommendations?.books?.length > 0 ? (
              recommendations.books.map((book, index) => (
                <div key={index} className="book-item bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 mb-3">
                  <div className="flex items-start space-x-3">
                    <span className="book-icon text-2xl">📚</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{book.title}</h4>
                      <p className="text-sm text-blue-600 mt-1">by {book.author}</p>
                      {book.description && (
                        <p className="text-sm text-gray-600 mt-2">{book.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state text-center py-8">
                <p className="text-gray-600 mb-4">📖 Healing reads will appear here</p>
                <p className="text-sm text-gray-500">Continue our conversation to discover books that might help</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'exercise' && (
          <div className="exercise-panel">
            {recommendations?.exercises?.length > 0 ? (
              recommendations.exercises.map((exercise, index) => (
                <div key={index} className="exercise-card bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mb-3">
                  <div className="flex items-start space-x-3">
                    <span className="exercise-icon text-2xl">🧘‍♀️</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{exercise.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                      {exercise.duration && (
                        <p className="text-xs text-green-600 mt-2">⏱️ {exercise.duration}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state text-center py-8">
                <p className="text-gray-600 mb-4">💪 Mindful movement ideas will appear here</p>
                <p className="text-sm text-gray-500">Tell me how you're feeling to get personalized exercise suggestions</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'food' && (
          <div className="food-panel">
            {recommendations?.nutrition?.length > 0 ? (
              recommendations.nutrition.map((food, index) => (
                <div key={index} className="food-card bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200 mb-3">
                  <div className="flex items-start space-x-3">
                    <span className="food-icon text-2xl">🥗</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{food.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{food.benefit}</p>
                      {food.timing && (
                        <p className="text-xs text-orange-600 mt-2">⏰ Best time: {food.timing}</p>
                      )}
                      {food.examples && (
                        <p className="text-xs text-gray-500 mt-1">Examples: {food.examples}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state text-center py-8">
                <p className="text-gray-600 mb-4">🍎 Nourishing suggestions will appear here</p>
                <p className="text-sm text-gray-500">Share more about your day to get personalized nutrition ideas</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="trips-panel">
            {recommendations?.activities?.length > 0 ? (
              recommendations.activities.map((activity, index) => (
                <div key={index} className="activity-card bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200 mb-3">
                  <div className="flex items-start space-x-3">
                    <span className="activity-icon text-2xl">🌟</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{activity.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs">
                        {activity.duration && <span className="text-cyan-600">⏱️ {activity.duration}</span>}
                        {activity.benefit && <span className="text-gray-500">💝 {activity.benefit}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state text-center py-8">
                <p className="text-gray-600 mb-4">🎈 Peaceful activities will appear here</p>
                <p className="text-sm text-gray-500">Continue sharing to discover activities that might lift your spirits</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <div className="links-panel">
            {recommendations?.resources?.length > 0 ? (
              recommendations.resources.map((resource, index) => (
                <div key={index} className="link-card bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border border-red-200 mb-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">🔗</span>
                    <p className="text-sm text-gray-700">{resource}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state text-center py-8">
                <p className="text-gray-600 mb-4">💙 Support resources will appear here</p>
                <p className="text-sm text-gray-500">Professional support links will be provided when helpful</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionSection;
