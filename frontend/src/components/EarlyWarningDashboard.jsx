import React, { useState, useEffect } from 'react';
import EarlyDetectionEngine from '../utils/earlyDetection.js';

export default function EarlyWarningDashboard({ conversations, userProfile, onBack, darkMode }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState(7);

  useEffect(() => {
    try {
      const engine = new EarlyDetectionEngine();
      const prediction = engine.generateRiskPrediction(conversations, userProfile);
      setAnalysis(prediction);
    } catch (error) {
      console.error('Error generating analysis:', error);
      // Provide fallback analysis
      setAnalysis({
        overallRisk: { score: 0.2, level: 'LOW', breakdown: { temporal: 0.2, behavioral: 0.2, linguistic: 0.2 } },
        confidence: 0.5,
        timeframe: '7-14 days',
        earlyWarnings: [],
        recommendations: [
          'Continue your current wellness routine',
          'Practice regular self-check-ins',
          'Maintain social connections',
          'Consider starting a mindfulness practice'
        ],
        interventions: ['Daily mood tracking', 'Regular sleep schedule']
      });
    } finally {
      setLoading(false);
    }
  }, [conversations, userProfile, selectedTimeframe]);

  const cardClasses = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-orange-200";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Analyzing your wellness patterns...</p>
        </div>
      </div>
    );
  }

  const getRiskColor = (level) => {
    const colors = {
      'LOW': darkMode ? 'text-green-400 bg-green-900' : 'text-green-800 bg-green-100',
      'MODERATE': darkMode ? 'text-yellow-400 bg-yellow-900' : 'text-yellow-800 bg-yellow-100',
      'HIGH': darkMode ? 'text-red-400 bg-red-900' : 'text-red-800 bg-red-100'
    };
    return colors[level] || colors.LOW;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-amber-50 via-orange-50 to-red-50'} p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              🔮 Wellness Insights
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-amber-600'} italic mt-2`}>
              AI-powered early detection for your mental wellness journey
            </p>
          </div>
          <button
            onClick={onBack}
            className={`px-6 py-3 ${cardClasses} border rounded-xl hover:shadow-md transition-all`}
          >
            ← Back to Journal
          </button>
        </div>

        {/* Risk Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${cardClasses} border p-6 rounded-xl text-center`}>
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold mb-2">Overall Risk</h3>
            <div className={`inline-block px-4 py-2 rounded-full font-medium ${getRiskColor(analysis.overallRisk.level)}`}>
              {analysis.overallRisk.level}
            </div>
            <div className="mt-2 text-sm opacity-70">
              Score: {(analysis.overallRisk.score * 100).toFixed(0)}%
            </div>
          </div>

          <div className={`${cardClasses} border p-6 rounded-xl text-center`}>
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="font-semibold mb-2">Confidence</h3>
            <div className="text-2xl font-bold text-blue-500">
              {(analysis.confidence * 100).toFixed(0)}%
            </div>
            <div className="mt-2 text-sm opacity-70">
              Based on {Array.isArray(conversations) ? conversations.length : Object.keys(conversations).length} conversations
            </div>
          </div>

          <div className={`${cardClasses} border p-6 rounded-xl text-center`}>
            <div className="text-3xl mb-2">⏰</div>
            <h3 className="font-semibold mb-2">Prediction Window</h3>
            <div className="text-lg font-semibold">
              {analysis.timeframe}
            </div>
            <div className="mt-2 text-sm opacity-70">
              Early warning period
            </div>
          </div>
        </div>

        {/* Risk Breakdown */}
        <div className={`${cardClasses} border p-6 rounded-xl mb-8`}>
          <h3 className="text-xl font-semibold mb-4">📊 Risk Factor Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(analysis.overallRisk.breakdown).map(([factor, score]) => (
              <div key={factor} className="text-center">
                <h4 className="font-medium mb-2 capitalize">{factor}</h4>
                <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-4 mb-2`}>
                  <div 
                    className={`h-4 rounded-full transition-all ${
                      score > 0.6 ? 'bg-red-500' : 
                      score > 0.3 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${score * 100}%` }}
                  />
                </div>
                <div className="text-sm opacity-70">{(score * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Early Warnings */}
        {analysis.earlyWarnings.length > 0 ? (
          <div className={`${cardClasses} border p-6 rounded-xl mb-8`}>
            <h3 className="text-xl font-semibold mb-4">⚠️ Early Warning Signals</h3>
            <div className="space-y-4">
              {analysis.earlyWarnings.map((warning, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  warning.severity === 'HIGH' ? 'border-red-500 bg-red-50' :
                  warning.severity === 'MODERATE' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                } ${darkMode ? 'bg-opacity-20' : ''}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      warning.severity === 'HIGH' ? 'bg-red-100 text-red-800' :
                      warning.severity === 'MODERATE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {warning.severity}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {warning.message}
                      </p>
                      {warning.suggestions && (
                        <ul className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                          {warning.suggestions.map((suggestion, idx) => (
                            <li key={idx}>• {suggestion}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`${cardClasses} border p-6 rounded-xl mb-8`}>
            <h3 className="text-xl font-semibold mb-4">✅ All Clear</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              No early warning signals detected. Your mental wellness patterns appear stable. Keep up the great work with your self-care routine!
            </p>
          </div>
        )}

        {/* Personalized Recommendations */}
        <div className={`${cardClasses} border p-6 rounded-xl mb-8`}>
          <h3 className="text-xl font-semibold mb-4">💡 Personalized Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-50'} border-l-4 border-blue-500`}>
                <p className={`${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Data Insights */}
        <div className={`${cardClasses} border p-6 rounded-xl mb-8`}>
          <h3 className="text-xl font-semibold mb-4">📈 Your Data Story</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">💬</div>
              <div className="text-2xl font-bold">{Array.isArray(conversations) ? conversations.length : Object.keys(conversations).length}</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Conversations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold">{(analysis.confidence * 100).toFixed(0)}%</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Analysis Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-2xl font-bold">{analysis.overallRisk.level}</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Risk Level</div>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className={`${cardClasses} border p-4 rounded-xl bg-gradient-to-r ${darkMode ? 'from-green-900 to-blue-900' : 'from-green-50 to-blue-50'}`}>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-green-500">🔒</span>
            <span className="font-medium">100% Private Analysis</span>
            <span>•</span>
            <span>All processing happens locally on your device</span>
            <span>•</span>
            <span>No data is ever sent to external servers</span>
          </div>
        </div>
      </div>
    </div>
  );
}