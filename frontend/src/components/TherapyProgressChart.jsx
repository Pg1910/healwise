import React, { useState } from 'react';

export default function TherapyProgressChart({ progressData, onBack, darkMode }) {
  const [selectedMetric, setSelectedMetric] = useState('overall');
  
  const metrics = {
    overall: { label: 'Overall Wellness', color: 'bg-blue-500', icon: '💫' },
    mood: { label: 'Mood Level', color: 'bg-green-500', icon: '😊' },
    anxiety: { label: 'Anxiety Level', color: 'bg-yellow-500', icon: '😰' },
    depression: { label: 'Depression Level', color: 'bg-red-500', icon: '😔' }
  };

  const getRiskColor = (risk) => {
    const colors = {
      'SAFE': darkMode ? 'text-green-400' : 'text-green-600',
      'LOW': darkMode ? 'text-yellow-400' : 'text-yellow-600',
      'MODERATE': darkMode ? 'text-orange-400' : 'text-orange-600',
      'HIGH': darkMode ? 'text-red-400' : 'text-red-600',
      'CRISIS': darkMode ? 'text-red-500' : 'text-red-700'
    };
    return colors[risk] || colors['SAFE'];
  };

  const getAdvice = () => {
    if (progressData.length === 0) return "Start journaling to see your progress!";
    
    const recent = progressData.slice(-7);
    const avgMood = recent.reduce((sum, entry) => sum + entry.mood, 0) / recent.length;
    const avgAnxiety = recent.reduce((sum, entry) => sum + entry.anxiety, 0) / recent.length;
    
    if (avgMood > 0.6) return "You're doing great! Keep up the positive momentum! 🌟";
    if (avgAnxiety > 0.6) return "Consider trying some breathing exercises or meditation. 🧘‍♀️";
    return "Every day is a step forward. Be gentle with yourself. 💚";
  };

  const baseClasses = darkMode ? "bg-gray-900 text-gray-100" : "bg-gradient-to-br from-amber-50 via-orange-50 to-red-50";
  const cardClasses = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-orange-200";

  return (
    <div className={`min-h-screen ${baseClasses} p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-amber-300' : 'text-amber-800'} font-serif`}>
              📊 Your Wellness Journey
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-amber-600'} italic mt-2`}>
              Track your mental health progress over time
            </p>
          </div>
          <button
            onClick={onBack}
            className={`px-4 py-2 ${cardClasses} border rounded-xl hover:shadow-md transition-all`}
          >
            ← Back to Journal
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metrics Cards */}
          <div className="lg:col-span-1 space-y-4">
            {Object.entries(metrics).map(([key, metric]) => (
              <div
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`${cardClasses} border p-4 rounded-xl cursor-pointer transition-all ${
                  selectedMetric === key ? 'ring-2 ring-amber-500' : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{metric.icon}</span>
                      <h3 className="font-semibold">{metric.label}</h3>
                    </div>
                    {progressData.length > 0 && (
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        Latest: {(progressData[progressData.length - 1][key] * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                  <div className={`w-3 h-3 rounded-full ${metric.color}`}></div>
                </div>
              </div>
            ))}

            {/* Advice Card */}
            <div className={`${cardClasses} border p-4 rounded-xl`}>
              <h3 className="font-semibold mb-2 flex items-center">
                <span className="mr-2">💡</span>
                Insight
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} italic`}>
                {getAdvice()}
              </p>
            </div>
          </div>

          {/* Chart Area */}
          <div className="lg:col-span-2">
            <div className={`${cardClasses} border p-6 rounded-xl`}>
              <h3 className="text-xl font-semibold mb-4">
                {metrics[selectedMetric].label} Trend
              </h3>
              
              {progressData.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📈</div>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Start journaling to see your progress visualization!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Simple Bar Chart */}
                  <div className="h-64 flex items-end space-x-2 overflow-x-auto">
                    {progressData.slice(-14).map((entry, idx) => {
                      const value = entry[selectedMetric];
                      const height = Math.max(value * 200, 10);
                      return (
                        <div key={idx} className="flex flex-col items-center min-w-8">
                          <div
                            className={`w-6 ${metrics[selectedMetric].color} rounded-t transition-all hover:opacity-80`}
                            style={{ height: `${height}px` }}
                            title={`${new Date(entry.date).toLocaleDateString()}: ${(value * 100).toFixed(0)}%`}
                          ></div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 transform rotate-45`}>
                            {new Date(entry.date).getDate()}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Risk Level Timeline */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Risk Level Timeline</h4>
                    <div className="flex flex-wrap gap-2">
                      {progressData.slice(-7).map((entry, idx) => (
                        <div key={idx} className="text-center">
                          <div className={`text-xs ${getRiskColor(entry.riskLevel)} font-medium`}>
                            {entry.riskLevel}
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Summary */}
        {progressData.length > 0 && (
          <div className={`${cardClasses} border p-6 rounded-xl mt-6`}>
            <h3 className="text-xl font-semibold mb-4">📅 Weekly Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(metrics).map(([key, metric]) => {
                const weekData = progressData.slice(-7);
                const average = weekData.reduce((sum, entry) => sum + entry[key], 0) / weekData.length;
                return (
                  <div key={key} className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg text-center`}>
                    <div className="text-2xl mb-2">{metric.icon}</div>
                    <div className="font-semibold">{(average * 100).toFixed(0)}%</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {metric.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}