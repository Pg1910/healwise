import React, { useState } from 'react';
import TicTacToe from './games/TicTacToe';
import SnakeGame from './games/SnakeGame';
import WordAssociation from './games/WordAssociation';
import MeditationSession from './games/MeditationSession';

export default function GameCenter({ onBack, darkMode, userProfile }) {
  const [activeGame, setActiveGame] = useState(null);

  const games = [
    {
      id: 'tictactoe',
      name: 'Strategic Tic Tac Toe',
      icon: '⭕',
      description: 'Challenge yourself against a smart AI that adapts to your moves',
      component: TicTacToe,
      category: 'strategy',
      difficulty: 'adaptive'
    },
    {
      id: 'snake',
      name: 'Mindful Snake',
      icon: '🐍',
      description: 'Relax and improve concentration with peaceful gameplay',
      component: SnakeGame,
      category: 'focus',
      difficulty: 'medium'
    },
    {
      id: 'wordassociation',
      name: 'Creative Word Flow',
      icon: '💭',
      description: 'Explore your creativity with AI-guided word associations',
      component: WordAssociation,
      category: 'creativity',
      difficulty: 'easy'
    },
    {
      id: 'meditation',
      name: 'Guided Meditation',
      icon: '🧘',
      description: 'Personalized meditation sessions for stress relief and mindfulness',
      component: MeditationSession,
      category: 'wellness',
      difficulty: 'relaxing'
    }
  ];

  const baseClasses = darkMode ? "bg-gray-900 text-gray-100" : "bg-gradient-to-br from-amber-50 via-orange-50 to-red-50";
  const cardClasses = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-orange-200";

  if (activeGame) {
    const game = games.find(g => g.id === activeGame);
    const GameComponent = game?.component;
    return (
      <div className={`min-h-screen ${baseClasses}`}>
        <div className="p-4">
          <button
            onClick={() => setActiveGame(null)}
            className={`px-4 py-2 ${cardClasses} border rounded-xl hover:shadow-md transition-all flex items-center space-x-2`}
          >
            <span>←</span>
            <span>Back to Games</span>
          </button>
        </div>
        {GameComponent && <GameComponent darkMode={darkMode} userProfile={userProfile} />}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${baseClasses} p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-amber-300' : 'text-amber-800'} font-serif`}>
              🎮 Therapeutic Game Center
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-amber-600'} italic mt-2`}>
              Interactive wellness activities designed for your mental health journey
            </p>
            {userProfile && (
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'} mt-1`}>
                Welcome back, {userProfile.name}! Ready for some mindful gaming?
              </p>
            )}
          </div>
          <button
            onClick={onBack}
            className={`px-6 py-3 ${cardClasses} border rounded-xl hover:shadow-md transition-all flex items-center space-x-2`}
          >
            <span>←</span>
            <span>Back to Journal</span>
          </button>
        </div>

        {/* Game Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Strategy & Focus Games */}
          <div className={`${cardClasses} border p-6 rounded-xl`}>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              Strategy & Focus
            </h3>
            <div className="space-y-4">
              {games.filter(game => ['strategy', 'focus'].includes(game.category)).map((game) => (
                <div
                  key={game.id}
                  onClick={() => setActiveGame(game.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md border ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{game.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{game.name}</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                        {game.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(game.difficulty, darkMode)}`}>
                          {game.difficulty}
                        </span>
                        <span className="text-xs opacity-70">• Interactive AI companion</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Creativity & Wellness */}
          <div className={`${cardClasses} border p-6 rounded-xl`}>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="mr-2">✨</span>
              Creativity & Wellness
            </h3>
            <div className="space-y-4">
              {games.filter(game => ['creativity', 'wellness'].includes(game.category)).map((game) => (
                <div
                  key={game.id}
                  onClick={() => setActiveGame(game.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md border ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{game.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{game.name}</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                        {game.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(game.difficulty, darkMode)}`}>
                          {game.difficulty}
                        </span>
                        <span className="text-xs opacity-70">• Personalized experience</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {userProfile && (
          <div className={`${cardClasses} border p-6 rounded-xl mb-8`}>
            <h3 className="text-lg font-semibold mb-4">📊 Your Gaming Journey</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>12</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Games Played</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>8m</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Time Meditated</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>156</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Words Created</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>7</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Day Streak</div>
              </div>
            </div>
          </div>
        )}

        {/* Mental Health Benefits */}
        <div className={`${cardClasses} border p-6 rounded-xl`}>
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <span className="mr-2">🧠</span>
            Science-Backed Benefits of Therapeutic Gaming
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="font-medium mb-2">Enhanced Focus</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Strategic games improve sustained attention and reduce mind-wandering
              </p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                <span className="text-2xl">😊</span>
              </div>
              <h4 className="font-medium mb-2">Mood Elevation</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Achievement-based gameplay releases endorphins and dopamine naturally
              </p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${darkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
                <span className="text-2xl">🧘</span>
              </div>
              <h4 className="font-medium mb-2">Stress Reduction</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Mindful gaming and meditation lower cortisol levels significantly
              </p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${darkMode ? 'bg-orange-900' : 'bg-orange-100'}`}>
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-medium mb-2">Cognitive Flexibility</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Word games and puzzles enhance creative problem-solving abilities
              </p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${darkMode ? 'bg-red-900' : 'bg-red-100'}`}>
                <span className="text-2xl">💪</span>
              </div>
              <h4 className="font-medium mb-2">Resilience Building</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Overcoming game challenges builds mental toughness and perseverance
              </p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${darkMode ? 'bg-teal-900' : 'bg-teal-100'}`}>
                <span className="text-2xl">🌱</span>
              </div>
              <h4 className="font-medium mb-2">Mindfulness Practice</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Present-moment gaming cultivates mindfulness and emotional regulation
              </p>
            </div>
          </div>
        </div>

        {/* Daily Challenge */}
        <div className={`${cardClasses} border p-6 rounded-xl mt-8 bg-gradient-to-r ${darkMode ? 'from-gray-800 to-gray-700' : 'from-amber-50 to-orange-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <span className="mr-2">🏆</span>
                Daily Wellness Challenge
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Complete any game for 5 minutes to maintain your wellness streak!
              </p>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>🔥</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>7 day streak</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for difficulty colors
function getDifficultyColor(difficulty, darkMode) {
  const colors = {
    easy: darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800',
    medium: darkMode ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-100 text-yellow-800',
    adaptive: darkMode ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-800',
    relaxing: darkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'
  };
  return colors[difficulty] || colors.easy;
}