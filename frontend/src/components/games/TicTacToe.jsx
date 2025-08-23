import React, { useState, useEffect, useCallback } from 'react';

export default function TicTacToe({ darkMode, userProfile }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost', 'draw'
  const [aiPersonality, setAiPersonality] = useState('encouraging');
  const [botMessage, setBotMessage] = useState('');
  const [gameStats, setGameStats] = useState({ wins: 0, losses: 0, draws: 0 });
  const [difficulty, setDifficulty] = useState('adaptive');

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  const aiPersonalities = {
    encouraging: {
      moves: ["Nice move! 🌟", "You're thinking strategically! 💭", "Interesting choice! 🤔"],
      wins: ["Great game! You outplayed me! 🎉", "Excellent strategy! Well deserved! 👏", "You're getting really good at this! 🌟"],
      losses: ["Good try! Every game teaches us something 😊", "You're improving! Let's play again! 💪", "That was close! Your strategy is evolving! 🌱"],
      draws: ["Perfect balance! Great minds think alike! ⚖️", "What a strategic battle! 🤝", "Evenly matched! Impressive! ✨"]
    },
    playful: {
      moves: ["Ooh, sneaky move! 😏", "Trying to outsmart me, eh? 😄", "Plot twist! 🎭"],
      wins: ["You got me! GG! 🎮", "Okay, okay, you win this round! 😅", "Teach me your ways, master! 🙇‍♂️"],
      losses: ["Hehe, got you! But you played well! 😊", "Lucky me! You almost had it! 🍀", "That was fun! Your turn to win next! 🔄"],
      draws: ["It's a tie! We're both geniuses! 🧠", "Great minds! 🤝", "Nobody wins, everybody wins! 🎊"]
    },
    mentor: {
      moves: ["Consider your next move carefully 🤔", "Strategic thinking! 💡", "I see your plan developing 👁️"],
      wins: ["Excellent execution! You've mastered this! 🎓", "Brilliant strategy! You've learned well! 📚", "Outstanding! Your growth is remarkable! 🌟"],
      losses: ["Learning opportunity! Analyze the board 📊", "Good effort! Strategy comes with practice 💪", "Each game builds your tactical skills 🧠"],
      draws: ["Perfectly balanced! Excellent strategic thinking! ⚖️", "Equal mastery! Well played! 🤝", "Strategic stalemate! Both played excellently! ✨"]
    }
  };

  const checkWinner = useCallback((currentBoard) => {
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], pattern };
      }
    }
    if (currentBoard.every(cell => cell !== null)) {
      return { winner: 'draw', pattern: null };
    }
    return { winner: null, pattern: null };
  }, [winPatterns]);

  const getAiMove = useCallback((currentBoard) => {
    const availableMoves = currentBoard.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
    
    if (difficulty === 'easy') {
      // Random moves (easier)
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    if (difficulty === 'adaptive') {
      // Adaptive difficulty based on player performance
      const playerWinRate = gameStats.wins / (gameStats.wins + gameStats.losses + gameStats.draws || 1);
      
      if (playerWinRate > 0.6) {
        // Player is winning too much, play harder
        return getBestMove(currentBoard, availableMoves);
      } else if (playerWinRate < 0.3) {
        // Player struggling, play easier
        if (Math.random() < 0.4) {
          return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
      }
    }
    
    // Strategic play with some randomness
    if (Math.random() < 0.8) {
      return getBestMove(currentBoard, availableMoves);
    } else {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
  }, [difficulty, gameStats]);

  const getBestMove = (currentBoard, availableMoves) => {
    // Check for winning move
    for (let move of availableMoves) {
      const testBoard = [...currentBoard];
      testBoard[move] = 'O';
      if (checkWinner(testBoard).winner === 'O') {
        return move;
      }
    }
    
    // Block player winning move
    for (let move of availableMoves) {
      const testBoard = [...currentBoard];
      testBoard[move] = 'X';
      if (checkWinner(testBoard).winner === 'X') {
        return move;
      }
    }
    
    // Take center if available
    if (availableMoves.includes(4)) return 4;
    
    // Take corners
    const corners = [0, 2, 6, 8].filter(corner => availableMoves.includes(corner));
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }
    
    // Take any available move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  const makeMove = (index) => {
    if (board[index] || !isPlayerTurn || gameStatus !== 'playing') return;
    
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);
    
    // AI encouragement for player moves
    const messages = aiPersonalities[aiPersonality].moves;
    setBotMessage(messages[Math.floor(Math.random() * messages.length)]);
    
    const result = checkWinner(newBoard);
    if (result.winner) {
      handleGameEnd(result, newBoard);
      return;
    }
    
    // AI move after short delay
    setTimeout(() => {
      const aiMove = getAiMove(newBoard);
      if (aiMove !== undefined) {
        const aiBoard = [...newBoard];
        aiBoard[aiMove] = 'O';
        setBoard(aiBoard);
        
        const aiResult = checkWinner(aiBoard);
        if (aiResult.winner) {
          handleGameEnd(aiResult, aiBoard);
        } else {
          setIsPlayerTurn(true);
          setBotMessage("Your turn! What's your strategy? 🤔");
        }
      }
    }, 1000);
  };

  const handleGameEnd = (result, finalBoard) => {
    const messages = aiPersonalities[aiPersonality];
    let status, message;
    
    if (result.winner === 'X') {
      status = 'won';
      message = messages.wins[Math.floor(Math.random() * messages.wins.length)];
      setGameStats(prev => ({ ...prev, wins: prev.wins + 1 }));
    } else if (result.winner === 'O') {
      status = 'lost';
      message = messages.losses[Math.floor(Math.random() * messages.losses.length)];
      setGameStats(prev => ({ ...prev, losses: prev.losses + 1 }));
    } else {
      status = 'draw';
      message = messages.draws[Math.floor(Math.random() * messages.draws.length)];
      setGameStats(prev => ({ ...prev, draws: prev.draws + 1 }));
    }
    
    setGameStatus(status);
    setBotMessage(message);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameStatus('playing');
    setBotMessage("Ready for another round? You're X, I'm O! 🎮");
  };

  useEffect(() => {
    setBotMessage("Let's play! You're X, I'm O. Show me your best strategy! 🎯");
  }, []);

  const cardClasses = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-orange-200";

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className={`${cardClasses} border p-8 rounded-xl max-w-2xl w-full`}>
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">⭕ Strategic Tic Tac Toe</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Challenge an adaptive AI that learns from your playstyle!
          </p>
          
          {/* Game Controls */}
          <div className="flex justify-center items-center space-x-4 mb-4">
            <select
              value={aiPersonality}
              onChange={(e) => setAiPersonality(e.target.value)}
              className={`px-3 py-1 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} text-sm`}
            >
              <option value="encouraging">Encouraging AI</option>
              <option value="playful">Playful AI</option>
              <option value="mentor">Mentor AI</option>
            </select>
            
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className={`px-3 py-1 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} text-sm`}
            >
              <option value="easy">Easy Mode</option>
              <option value="adaptive">Adaptive</option>
              <option value="hard">Challenge Mode</option>
            </select>
          </div>

          {/* Stats */}
          <div className="flex justify-center space-x-6 mb-4 text-sm">
            <div className="text-center">
              <div className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{gameStats.wins}</div>
              <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Wins</div>
            </div>
            <div className="text-center">
              <div className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{gameStats.draws}</div>
              <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Draws</div>
            </div>
            <div className="text-center">
              <div className={`font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{gameStats.losses}</div>
              <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Losses</div>
            </div>
          </div>
        </div>

        {/* AI Chat Bubble */}
        <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-blue-900 bg-opacity-50' : 'bg-blue-50'}`}>
          <div className="flex items-start space-x-3">
            <div className="text-2xl">🤖</div>
            <div>
              <div className={`text-sm font-medium ${darkMode ? 'text-blue-200' : 'text-blue-800'} mb-1`}>
                AI Companion ({aiPersonality})
              </div>
              <div className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                {botMessage}
              </div>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-3 gap-2 w-72 h-72">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => makeMove(index)}
                disabled={!isPlayerTurn || gameStatus !== 'playing' || cell !== null}
                className={`w-full h-full border-2 rounded-lg text-4xl font-bold transition-all
                  ${cell === 'X' ? (darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800') : ''}
                  ${cell === 'O' ? (darkMode ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-800') : ''}
                  ${!cell ? (darkMode ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' : 'bg-gray-50 hover:bg-gray-100 border-gray-300') : ''}
                  ${!isPlayerTurn || gameStatus !== 'playing' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
              >
                {cell}
              </button>
            ))}
          </div>
        </div>

        {/* Game Status */}
        {gameStatus !== 'playing' && (
          <div className="text-center mb-6">
            <div className="text-lg font-semibold mb-2">
              {gameStatus === 'won' && '🎉 You Won!'}
              {gameStatus === 'lost' && '🤖 AI Wins!'}
              {gameStatus === 'draw' && '🤝 It\'s a Draw!'}
            </div>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transition-all"
            >
              Play Again
            </button>
          </div>
        )}

        {/* Mental Health Benefits */}
        <div className={`mt-6 p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
          <h3 className="font-semibold mb-2">🧠 Mental Health Benefits:</h3>
          <ul className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
            <li>• <strong>Strategic Thinking:</strong> Enhances planning and foresight abilities</li>
            <li>• <strong>Stress Relief:</strong> Provides focused distraction from worries</li>
            <li>• <strong>Social Connection:</strong> Interactive AI creates companionship feeling</li>
            <li>• <strong>Achievement:</strong> Small wins boost confidence and mood</li>
            <li>• <strong>Mindfulness:</strong> Requires present-moment focus and attention</li>
          </ul>
        </div>
      </div>
    </div>
  );
}