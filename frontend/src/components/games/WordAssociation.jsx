import React, { useState, useEffect } from 'react';

export default function WordAssociation({ darkMode, userProfile }) {
  const [gameWords, setGameWords] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [theme, setTheme] = useState('wellness');
  const [streak, setStreak] = useState(0);
  const [wordHistory, setWordHistory] = useState([]);

  const themes = {
    wellness: {
      starters: ['peace', 'growth', 'healing', 'strength', 'balance', 'harmony', 'mindful', 'calm'],
      name: 'Wellness Journey'
    },
    creativity: {
      starters: ['imagination', 'color', 'music', 'art', 'dream', 'story', 'dance', 'poetry'],
      name: 'Creative Flow'
    },
    nature: {
      starters: ['ocean', 'mountain', 'forest', 'sunshine', 'rain', 'flower', 'river', 'sky'],
      name: 'Natural World'
    },
    emotions: {
      starters: ['joy', 'hope', 'love', 'wonder', 'gratitude', 'excitement', 'curiosity', 'warmth'],
      name: 'Emotional Spectrum'
    }
  };

  const positiveResponses = [
    "Beautiful connection! 🌟", "Love that flow! 💫", "Creative thinking! 🎨",
    "Wonderful association! ✨", "Nice mental leap! 🌈", "Insightful! 💡",
    "Perfect link! 🔗", "Brilliant mind work! 🧠", "Flowing beautifully! 🌊"
  ];

  const aiPersonalities = {
    encouraging: [
      "What about exploring '{word}' next? 🤔",
      "I sense a theme developing with '{word}' 🎭",
      "Your mind might enjoy '{word}' 💭",
      "Consider the feeling of '{word}' ✨"
    ],
    playful: [
      "Ooh, how about '{word}'? 😄",
      "Plot twist: '{word}'! 🎪",
      "My brain says '{word}' - what do you think? 🤖",
      "Random thought: '{word}' 🎲"
    ],
    zen: [
      "Perhaps '{word}' calls to you 🧘",
      "In stillness, I sense '{word}' 🌸",
      "The universe whispers '{word}' 🌌",
      "Breathe into '{word}' 🕯️"
    ]
  };

  const generateAISuggestion = (lastWords) => {
    if (lastWords.length === 0) return '';
    
    const lastWord = lastWords[lastWords.length - 1].toLowerCase();
    const personality = userProfile?.botPersona || 'encouraging';
    
    // Simple word associations based on common patterns
    const associations = {
      'peace': ['serenity', 'tranquil', 'stillness', 'harmony'],
      'growth': ['progress', 'bloom', 'evolve', 'flourish'],
      'healing': ['recovery', 'wholeness', 'restoration', 'wellness'],
      'strength': ['courage', 'resilience', 'power', 'endurance'],
      'love': ['compassion', 'kindness', 'warmth', 'connection'],
      'hope': ['optimism', 'future', 'possibility', 'light'],
      'joy': ['happiness', 'celebration', 'laughter', 'bliss'],
      'calm': ['peaceful', 'serene', 'gentle', 'quiet']
    };
    
    // Find association or use thematic words
    let suggestedWord = associations[lastWord] 
      ? associations[lastWord][Math.floor(Math.random() * associations[lastWord].length)]
      : themes[theme].starters[Math.floor(Math.random() * themes[theme].starters.length)];
    
    const templates = aiPersonalities[personality] || aiPersonalities.encouraging;
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return template.replace('{word}', suggestedWord);
  };

  const startGame = () => {
    const randomWord = themes[theme].starters[Math.floor(Math.random() * themes[theme].starters.length)];
    setGameWords([randomWord]);
    setGameStarted(true);
    setTimeLeft(90);
    setScore(0);
    setGameOver(false);
    setStreak(0);
    setWordHistory([]);
    setFeedback(`Theme: ${themes[theme].name} | Starting word: "${randomWord}"`);
    setAiSuggestion('');
  };

  const addWord = () => {
    const word = currentInput.trim().toLowerCase();
    if (!word || word.length < 2) return;
    
    // Check for repetition
    if (gameWords.includes(word)) {
      setFeedback("Already used that word! Try something new 🔄");
      return;
    }

    const newWords = [...gameWords, word];
    setGameWords(newWords);
    setWordHistory(prev => [...prev, { word, timestamp: Date.now() }]);
    setCurrentInput('');
    
    // Calculate score based on word length and creativity
    const wordScore = Math.max(word.length - 1, 1);
    const bonusScore = streak > 2 ? Math.floor(streak / 3) : 0;
    const totalScore = wordScore + bonusScore;
    
    setScore(prev => prev + totalScore);
    setStreak(prev => prev + 1);
    
    // Positive feedback
    const response = positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
    setFeedback(response + (bonusScore > 0 ? ` Streak bonus! +${bonusScore}` : ''));
    
    // Generate AI suggestion after a few words
    if (newWords.length > 2 && Math.random() < 0.6) {
      setTimeout(() => {
        setAiSuggestion(generateAISuggestion(newWords));
      }, 1500);
    }
  };

  const useAISuggestion = () => {
    if (!aiSuggestion) return;
    
    // Extract the suggested word from the AI message
    const match = aiSuggestion.match(/'([^']+)'/);
    if (match) {
      setCurrentInput(match[1]);
      setAiSuggestion('');
    }
  };

  const resetGame = () => {
    setGameWords([]);
    setCurrentInput('');
    setGameStarted(false);
    setScore(0);
    setTimeLeft(90);
    setGameOver(false);
    setFeedback('');
    setAiSuggestion('');
    setStreak(0);
    setWordHistory([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addWord();
    }
  };

  useEffect(() => {
    let timer;
    if (gameStarted && timeLeft > 0 && !gameOver) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameStarted) {
      setGameOver(true);
      setGameStarted(false);
      
      // Calculate final performance
      const wordsPerMinute = (gameWords.length / 1.5).toFixed(1);
      const avgWordLength = (score / gameWords.length).toFixed(1);
      
      setFeedback(`Amazing! ${gameWords.length} words in 90 seconds (${wordsPerMinute} WPM). Average creativity score: ${avgWordLength}! 🎉`);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameStarted, gameOver, gameWords.length, score]);

  const cardClasses = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-orange-200";

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className={`${cardClasses} border p-8 rounded-xl max-w-4xl w-full`}>
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">💭 Creative Word Flow</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Let your mind wander freely through word associations with AI guidance!
          </p>
          
          {/* Theme Selection */}
          <div className="flex justify-center items-center space-x-4 mb-4">
            <label className="text-sm font-medium">Theme:</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              disabled={gameStarted}
              className={`px-3 py-1 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} text-sm`}
            >
              {Object.entries(themes).map(([key, data]) => (
                <option key={key} value={key}>{data.name}</option>
              ))}
            </select>
          </div>
          
          {/* Game Stats */}
          <div className="flex justify-center items-center space-x-6 mb-4">
            <div className="text-lg font-semibold">Score: {score}</div>
            <div className="text-lg font-semibold">Words: {gameWords.length}</div>
            {streak > 0 && (
              <div className={`text-lg font-semibold ${streak > 5 ? 'text-yellow-500' : ''}`}>
                🔥 {streak} streak
              </div>
            )}
            {gameStarted && (
              <div className={`text-lg font-semibold ${timeLeft <= 15 ? 'text-red-500' : ''}`}>
                ⏰ {timeLeft}s
              </div>
            )}
          </div>

          {/* Controls */}
          {!gameStarted && !gameOver && (
            <button
              onClick={startGame}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-700 transition-all"
            >
              Start Word Flow
            </button>
          )}
          
          {gameOver && (
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transition-all"
            >
              New Session
            </button>
          )}

          {/* Feedback */}
          {feedback && (
            <div className={`p-3 rounded-lg mt-4 ${darkMode ? 'bg-blue-900 bg-opacity-50 text-blue-200' : 'bg-blue-50 text-blue-800'}`}>
              {feedback}
            </div>
          )}
        </div>

        {/* AI Suggestion */}
        {aiSuggestion && (
          <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-purple-900 bg-opacity-50' : 'bg-purple-50'} border border-dashed ${darkMode ? 'border-purple-500' : 'border-purple-300'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-3">
                <div className="text-xl">🤖</div>
                <div>
                  <div className={`text-sm font-medium ${darkMode ? 'text-purple-200' : 'text-purple-800'} mb-1`}>
                    AI Inspiration
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    {aiSuggestion}
                  </div>
                </div>
              </div>
              <button
                onClick={useAISuggestion}
                className={`px-3 py-1 text-xs rounded-lg ${darkMode ? 'bg-purple-700 hover:bg-purple-600' : 'bg-purple-200 hover:bg-purple-300'} transition-colors`}
              >
                Use This
              </button>
            </div>
          </div>
        )}

        {/* Word Chain Display */}
        {gameWords.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Your Word Journey:</h3>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {gameWords.map((word, index) => (
                <div key={index} className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    index === 0 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
                      : index === gameWords.length - 1
                        ? darkMode ? 'bg-green-700 text-green-200 ring-2 ring-green-500' : 'bg-green-100 text-green-800 ring-2 ring-green-500'
                        : darkMode 
                          ? 'bg-gray-700 text-gray-200' 
                          : 'bg-gray-100 text-gray-800'
                  }`}>
                    {word}
                  </span>
                  {index < gameWords.length - 1 && (
                    <span className={`mx-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        {gameStarted && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              What word flows from your mind? (Press Enter to continue the journey)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your next word..."
                className={`flex-1 px-4 py-3 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500`}
                autoFocus
              />
              <button
                onClick={addWord}
                disabled={!currentInput.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-700 transition-all disabled:opacity-50"
              >
                Flow
              </button>
            </div>
          </div>
        )}

        {/* Final Results */}
        {gameOver && wordHistory.length > 0 && (
          <div className={`p-6 rounded-lg mb-6 ${darkMode ? 'bg-green-900 bg-opacity-50' : 'bg-green-50'}`}>
            <h3 className="font-semibold mb-4">🎉 Word Flow Complete!</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold">{gameWords.length}</div>
                <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Words Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{score}</div>
                <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Creativity Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{(gameWords.length / 1.5).toFixed(1)}</div>
                <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Words/Minute</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{streak}</div>
                <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Best Streak</div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Info */}
        <div className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
          <h3 className="font-semibold mb-2">🧠 Cognitive Benefits:</h3>
          <ul className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
            <li>• <strong>Neural Plasticity:</strong> Strengthens connections between brain regions</li>
            <li>• <strong>Creative Flow:</strong> Activates divergent thinking and innovation</li>
            <li>• <strong>Memory Enhancement:</strong> Improves word recall and semantic networks</li>
            <li>• <strong>Mindful Focus:</strong> Promotes present-moment awareness and concentration</li>
            <li>• <strong>Stress Relief:</strong> Provides meditative mental exercise and relaxation</li>
            <li>• <strong>Self-Discovery:</strong> Reveals thought patterns and subconscious associations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}