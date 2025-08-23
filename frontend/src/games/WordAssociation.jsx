import React, { useState, useEffect } from 'react';

export default function WordAssociation({ darkMode, userProfile }) {
  const [gameWords, setGameWords] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [themes, setThemes] = useState([]);
  const [currentTheme, setCurrentTheme] = useState(null);
  const [powerUps, setPowerUps] = useState({ hints: 3, timeBoost: 2 });
  const [wordHistory, setWordHistory] = useState(new Set());

  const botPersona = userProfile?.botPersona || 'friend';
  const playerName = userProfile?.name || 'friend';

  const gameThemes = {
    emotions: { words: ['joy', 'peace', 'calm', 'love', 'hope'], emoji: '😊', description: 'Explore positive emotions' },
    nature: { words: ['forest', 'ocean', 'mountain', 'flower', 'sunrise'], emoji: '🌿', description: 'Connect with nature' },
    growth: { words: ['learning', 'wisdom', 'strength', 'courage', 'progress'], emoji: '🌱', description: 'Personal development' },
    creativity: { words: ['art', 'music', 'story', 'color', 'imagination'], emoji: '🎨', description: 'Creative expression' },
    mindfulness: { words: ['breath', 'present', 'awareness', 'meditation', 'stillness'], emoji: '🧘', description: 'Mindful awareness' }
  };

  const botMessages = {
    start: {
      friend: `Let's explore your mind together, ${playerName}! 🧠✨`,
      sibling: `Time to see how creative you really are! 😄`,
      parent: `I love seeing how your beautiful mind works! 💕`,
      mentor: `Let's unlock the patterns in your thinking! 🔓`
    },
    goodWord: {
      friend: `"${currentInput}" - I love that connection! 🌟`,
      sibling: `Ooh, "${currentInput}" is clever! 😎`,
      parent: `"${currentInput}" - such beautiful thinking! 🌸`,
      mentor: `"${currentInput}" shows deep understanding! 📚`
    },
    longWord: {
      friend: `Wow, "${currentInput}" is a magnificent word! 🎯`,
      sibling: `Show off with that long word! 😂`,
      parent: `Such vocabulary, sweetheart! 👑`,
      mentor: `Excellent linguistic choice! 🎓`
    },
    streak: {
      friend: `${streak} in a row! You're on fire! 🔥`,
      sibling: `${streak} streak! Don't let it go to your head! 😏`,
      parent: `${streak} beautiful words in a row! 🌈`,
      mentor: `${streak} consecutive associations - excellent flow! 📈`
    }
  };

  const startGame = (themeKey = null) => {
    let startWord;
    if (themeKey && gameThemes[themeKey]) {
      const theme = gameThemes[themeKey];
      startWord = theme.words[Math.floor(Math.random() * theme.words.length)];
      setCurrentTheme(themeKey);
      setThemes([themeKey]);
    } else {
      const allWords = Object.values(gameThemes).flatMap(theme => theme.words);
      startWord = allWords[Math.floor(Math.random() * allWords.length)];
      setCurrentTheme(null);
    }
    
    setGameWords([startWord]);
    setGameStarted(true);
    setTimeLeft(90);
    setScore(0);
    setStreak(0);
    setGameOver(false);
    setWordHistory(new Set([startWord]));
    setFeedback(botMessages.start[botPersona]);
  };

  const addWord = () => {
    const word = currentInput.trim().toLowerCase();
    if (!word || word.length < 2) return;

    // Check for repetition
    if (wordHistory.has(word)) {
      setFeedback("🔄 Try a new word - you've used that one already!");
      setCurrentInput('');
      return;
    }

    // Add word and calculate score
    const wordScore = word.length + (streak > 0 ? Math.floor(streak / 3) : 0);
    setGameWords(prev => [...prev, word]);
    setWordHistory(prev => new Set([...prev, word]));
    setCurrentInput('');
    setScore(prev => prev + wordScore);
    
    const newStreak = streak + 1;
    setStreak(newStreak);
    if (newStreak > bestStreak) setBestStreak(newStreak);

    // Generate encouraging feedback
    if (word.length > 7) {
      setFeedback(botMessages.longWord[botPersona].replace('${currentInput}', word));
    } else if (newStreak % 5 === 0) {
      setFeedback(botMessages.streak[botPersona].replace('${streak}', newStreak));
    } else {
      setFeedback(botMessages.goodWord[botPersona].replace('${currentInput}', word));
    }

    // Auto-detect themes
    detectTheme(word);
  };

  const detectTheme = (word) => {
    for (const [themeKey, theme] of Object.entries(gameThemes)) {
      if (theme.words.some(themeWord => 
        word.includes(themeWord) || themeWord.includes(word) || 
        areRelated(word, themeWord)
      )) {
        if (!themes.includes(themeKey)) {
          setThemes(prev => [...prev, themeKey]);
          setFeedback(prev => prev + ` 🎯 I see you're exploring ${themeKey}!`);
        }
        break;
      }
    }
  };

  const areRelated = (word1, word2) => {
    // Simple semantic relation check (can be enhanced with NLP)
    const relations = {
      'happy': ['joy', 'smile', 'laugh'],
      'sad': ['cry', 'tears', 'down'],
      'tree': ['forest', 'wood', 'leaf'],
      'water': ['ocean', 'river', 'rain']
    };
    
    return relations[word1]?.includes(word2) || relations[word2]?.includes(word1);
  };

  const useHint = () => {
    if (powerUps.hints <= 0) return;
    
    setPowerUps(prev => ({ ...prev, hints: prev.hints - 1 }));
    
    const lastWord = gameWords[gameWords.length - 1];
    const hints = [
      `Try something that rhymes with "${lastWord}"`,
      `Think of the opposite of "${lastWord}"`,
      `What does "${lastWord}" make you feel?`,
      `Where might you find "${lastWord}"?`,
      `What color is "${lastWord}"?`
    ];
    
    setFeedback(`💡 Hint: ${hints[Math.floor(Math.random() * hints.length)]}`);
  };

  const useTimeBoost = () => {
    if (powerUps.timeBoost <= 0) return;
    
    setPowerUps(prev => ({ ...prev, timeBoost: prev.timeBoost - 1 }));
    setTimeLeft(prev => prev + 15);
    setFeedback("⏰ +15 seconds! Keep the flow going!");
  };

  const resetGame = () => {
    setGameWords([]);
    setCurrentInput('');
    setGameStarted(false);
    setScore(0);
    setStreak(0);
    setTimeLeft(90);
    setGameOver(false);
    setFeedback('');
    setThemes([]);
    setCurrentTheme(null);
    setPowerUps({ hints: 3, timeBoost: 2 });
    setWordHistory(new Set());
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
      setFeedback(`🎉 Amazing flow! You created ${gameWords.length} associations with a best streak of ${bestStreak}!`);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameStarted, gameOver, gameWords.length, bestStreak]);

  const cardClasses = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-orange-200";

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className={`${cardClasses} border p-8 rounded-xl max-w-4xl w-full`}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">💭 Enhanced Word Association</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Create flowing chains of thoughts! Discover themes, build streaks, and explore your mind.
          </p>

          {/* Theme Selection */}
          {!gameStarted && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Choose a Theme (or go freestyle):</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {Object.entries(gameThemes).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => startGame(key)}
                    className="p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all"
                  >
                    <div className="text-2xl mb-1">{theme.emoji}</div>
                    <div className="font-medium capitalize">{key}</div>
                    <div className="text-xs text-gray-500">{theme.description}</div>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => startGame()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-700 transition-all"
              >
                🎲 Freestyle Mode
              </button>
            </div>
          )}

          {/* Game Stats */}
          {gameStarted && (
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900 bg-opacity-50' : 'bg-blue-50'}`}>
                <div className="text-lg font-bold text-blue-600">Score</div>
                <div className="text-xl font-bold">{score}</div>
              </div>
              <div className={`p-2 rounded-lg ${timeLeft <= 15 ? 'bg-red-100' : darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="text-lg font-bold">Time</div>
                <div className={`text-xl font-bold ${timeLeft <= 15 ? 'text-red-600' : ''}`}>{timeLeft}s</div>
              </div>
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-900 bg-opacity-50' : 'bg-green-50'}`}>
                <div className="text-lg font-bold text-green-600">Streak</div>
                <div className="text-xl font-bold">{streak}</div>
              </div>
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-900 bg-opacity-50' : 'bg-purple-50'}`}>
                <div className="text-lg font-bold text-purple-600">Best</div>
                <div className="text-xl font-bold">{bestStreak}</div>
              </div>
            </div>
          )}

          {/* Power-ups */}
          {gameStarted && (
            <div className="flex justify-center space-x-3 mb-4">
              <button
                onClick={useHint}
                disabled={powerUps.hints <= 0}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  powerUps.hints > 0
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                💡 Hints ({powerUps.hints})
              </button>
              <button
                onClick={useTimeBoost}
                disabled={powerUps.timeBoost <= 0}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  powerUps.timeBoost > 0
                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                ⏰ Time Boost ({powerUps.timeBoost})
              </button>
            </div>
          )}

          {feedback && (
            <div className={`p-3 rounded-lg mb-4 ${darkMode ? 'bg-blue-900 bg-opacity-50 text-blue-200' : 'bg-blue-50 text-blue-800'}`}>
              {feedback}
            </div>
          )}
        </div>

        {/* Word Chain Display */}
        {gameWords.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Your Word Journey:</h3>
              {themes.length > 0 && (
                <div className="flex space-x-2">
                  {themes.map(theme => (
                    <span key={theme} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {gameThemes[theme].emoji} {theme}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {gameWords.map((word, index) => (
                <div key={index} className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    index === 0 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
                      : index === gameWords.length - 1
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
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
              What comes next? (Press Enter or click Add)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your associated word..."
                className={`flex-1 px-4 py-3 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500`}
                autoFocus
              />
              <button
                onClick={addWord}
                disabled={!currentInput.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-700 transition-all disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex justify-center space-x-3 mb-6">
          {gameOver && (
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transition-all"
            >
              New Game
            </button>
          )}
          {gameStarted && (
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-medium hover:from-gray-600 hover:to-gray-700 transition-all"
            >
              Reset
            </button>
          )}
        </div>

        {/* Enhanced Benefits */}
        <div className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
          <h3 className="font-semibold mb-2">🧠 Cognitive & Emotional Benefits:</h3>
          <ul className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
            <li>• <strong>Neural Plasticity:</strong> Strengthens brain connections and flexibility</li>
            <li>• <strong>Emotional Vocabulary:</strong> Expands ability to express feelings</li>
            <li>• <strong>Pattern Recognition:</strong> Improves ability to see connections</li>
            <li>• <strong>Mindful Flow:</strong> Creates meditative state of focused attention</li>
            <li>• <strong>Self-Discovery:</strong> Reveals subconscious thoughts and associations</li>
            <li>• <strong>Stress Relief:</strong> Provides engaging mental distraction</li>
          </ul>
        </div>
      </div>
    </div>
  );
}