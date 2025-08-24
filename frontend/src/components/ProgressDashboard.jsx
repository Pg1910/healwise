import React, { useState, useEffect } from 'react';
import ConversationManager from '../utils/conversationManager.js';

export default function ProgressDashboard({ onBack, darkMode, userProfile }) {
  const [insights, setInsights] = useState(null);
  const [timeframe, setTimeframe] = useState('7days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const manager = new ConversationManager();
    const generatedInsights = manager.generateInsights();
    setInsights(generatedInsights);
    setLoading(false);
  }, [timeframe]);

  const cardClasses = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-orange-200";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend) => {
    switch(trend) {
      case 'improving': return darkMode ? 'text-green-400' : 'text-green-600';
      case 'declining': return darkMode ? 'text-red-400' : 'text-red-600';
      default: return darkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50'} p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              📊 Wellness Progress
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-purple-600'} italic mt-2`}>
              Track your mental health journey with data-driven insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 3 Months</option>
            </select>
            <button
              onClick={onBack}
              className={`px-6 py-3 ${cardClasses} border rounded-xl hover:shadow-md transition-all`}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Trend Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`${cardClasses} border p-6 rounded-xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Recent Trend</h3>
              <span className="text-2xl">{getTrendIcon(insights.recentTrend)}</span>
            </div>
            <div className={`text-2xl font-bold ${getTrendColor(insights.recentTrend)} capitalize`}>
              {insights.recentTrend}
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              Based on your last 7 days of conversations
            </p>
          </div>

          <div className={`${cardClasses} border p-6 rounded-xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Overall Progress</h3>
              <span className="text-2xl">{getTrendIcon(insights.overallProgress)}</span>
            </div>
            <div className={`text-2xl font-bold ${getTrendColor(insights.overallProgress)} capitalize`}>
              {insights.overallProgress}
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              Your 30-day wellness trajectory
            </p>
          </div>
        </div>

        {/* Top Emotions */}
        <div className={`${cardClasses} border p-6 rounded-xl mb-8`}>
          <h3 className="text-xl font-semibold mb-4">🎭 Emotional Landscape</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {insights.topEmotions.slice(0, 5).map(([emotion, intensity], index) => (
              <div key={emotion} className="text-center">
                <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3 mb-2`}>
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                    style={{ width: `${(intensity / insights.topEmotions[0][1]) * 100}%` }}
                  />
                </div>
                <div className="font-medium capitalize">{emotion}</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {(intensity * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones & Achievements */}
        <div className={`${cardClasses} border p-6 rounded-xl mb-8`}>
          <h3 className="text-xl font-semibold mb-4">🏆 Wellness Milestones</h3>
          <div className="space-y-3">
            {insights.milestones.length > 0 ? (
              insights.milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${darkMode ? 'bg-yellow-900 bg-opacity-30' : 'bg-yellow-50'}`}>
                  <span className="text-2xl">🎉</span>
                  <div>
                    <div className="font-medium">{milestone.title}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {milestone.description}
                    </div>
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {new Date(milestone.date).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="text-4xl mb-2 block">🌱</span>
                <p>Keep journaling to unlock wellness milestones!</p>
                <p className="text-sm mt-2">Your journey is just beginning.</p>
              </div>
            )}
          </div>
        </div>

        {/* Personalized Insights */}
        <div className={`${cardClasses} border p-6 rounded-xl`}>
          <h3 className="text-xl font-semibold mb-4">💡 Personalized Insights</h3>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-50'}`}>
              <h4 className="font-medium mb-2">🎯 What's Working Well</h4>
              <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                {insights.recentTrend === 'improving' 
                  ? "Your recent conversations show increasing positivity and emotional balance."
                  : "You're consistently engaging with self-reflection, which is a powerful wellness habit."
                }
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-900 bg-opacity-30' : 'bg-purple-50'}`}>
              <h4 className="font-medium mb-2">🚀 Growth Opportunities</h4>
              <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
                {insights.recentTrend === 'declining' 
                  ? "Consider incorporating more self-care activities and reaching out for support when needed."
                  : "Try exploring new coping strategies or mindfulness practices to continue your progress."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}