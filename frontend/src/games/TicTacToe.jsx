import React, { useState, useEffect } from 'react';

export default function TicTacToe({ darkMode, userProfile }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost', 'draw'
  const [score, setScore] = useState({ player: 0, ai: 0, draws: 0 });
  const [botMessage, setBotMessage] = useState('');
  const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'
  const [gameStarted, setGameStarted] = useState(false);

  const botPersona = userProfile?.botPersona || 'friend';
  const playerName = userProfile?.name || 'friend';

  const botMessages = {
    gameStart: {
      friend: `Hey ${playerName}! Ready for a fun game? I'll go easy on you... maybe! 😄`,
      sibling: `Alright ${playerName}, let's see what you've got! Don't cry when I win! 😏`,
      parent: `Let's play, sweetheart! Remember, it's all about having fun! 🤗`,
      mentor: `A game of strategy, ${playerName}. Let's see how your mind works! 🧠`
    },
    playerWin: {
      friend: `Wow! You got me there! Great job! 🎉`,
      sibling: `Ugh, you win this round! I demand a rematch! 😤`,
      parent: `I'm so proud of you! You played beautifully! 💕`,
      mentor: `Excellent strategic thinking! You've learned well! 🌟`
    },
    aiWin: {
      friend: `Oops, I won that one! But you're getting better! 😊`,
      sibling: `Ha! Told you I'd win! Want to go again? 😎`,
      parent: `I won this time, but you played so well! Try again? 🌸`,
      mentor: `Victory is mine! But notice the patterns - you're improving! 📈`
    },
    draw: {
      friend: `It's a tie! We both played well! 🤝`,
      sibling: `Draw?! That's basically a win for you! 😅`,
      parent: `A tie means we're both winners! 🏆`,
      mentor: `A strategic stalemate! Well played on both sides! ⚖️`
    },
    goodMove: {
      friend: `Nice move! You're thinking ahead! 💭`,
      sibling: `Okay, that was actually pretty smart... 🤔`,
      parent: `What a clever move, darling! 💡`,
      mentor: `Interesting strategy! I see your thinking! 🎯`
    },
    tease: {
      friend: `Hmm, are you sure about that move? 🤨`,
      sibling: `Really? That's your move? Bold choice! 😂`,
      parent: `Oh honey, let me show you something! 😌`,
      mentor: `Curious choice... let's see how this plays out! 🤓`
    }
  };

  // AI difficulty levels
  const makeAIMove = (currentBoard, level) => {
    const emptySquares = currentBoard.map((square, index) => square === null ? index : null).filter(val => val !== null);
    
    if (emptySquares.length === 0) return null;

    // Hard: Minimax algorithm
    if (level === 'hard') {
      return getBestMove(currentBoard);
    }
    
    // Medium: 70% optimal, 30% random
    if (level === 'medium') {
      if (Math.random() < 0.7) {
        return getBestMove(currentBoard);
      }
    }
    
    // Easy/Medium fallback: Random move
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
  };

  // Minimax algorithm for optimal AI play
  const getBestMove = (board) => {
    const emptySquares = board.map((square, index) => square === null ? index : null).filter(val => val !== null);
    
    // First, try to win
    for (let square of emptySquares) {
      const testBoard = [...board];
      testBoard[square] = 'O';
      if (checkWinner(testBoard) === 'O') return square;
    }
    
    // Then, block player from winning
    for (let square of emptySquares) {
      const testBoard = [...board];
      testBoard[square] = 'X';
      if (checkWinner(testBoard) === 'X') return square;
    }
    
    // Take center if available
    if (board[4] === null) return 4;
    
    // Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => board[i] === null);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Take any remaining square
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
  };

  const checkWinner = (board) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (let line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const makeMove = (index) => {
    if (board[index] || !isPlayerTurn || gameStatus !== 'playing') return;
    
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);
    
    const winner = checkWinner(newBoard);
    if (winner === 'X') {
      setGameStatus('won');
      setScore(prev => ({ ...prev, player: prev.player + 1 }));
      setBotMessage(botMessages.playerWin[botPersona]);
      return;
    }
    
    if (newBoard.every(square => square !== null)) {
      setGameStatus('draw');
      setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
      setBotMessage(botMessages.draw[botPersona]);
      return;
    }
    
    // Add encouraging message for good moves
    if (Math.random() < 0.3) {
      setBotMessage(botMessages.goodMove[botPersona]);
    }
  };

  // AI move effect
  useEffect(() => {
    if (!isPlayerTurn && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        const aiMove = makeAIMove(board, difficulty);
        if (aiMove !== null) {
          const newBoard = [...board];
          newBoard[aiMove] = 'O';
          setBoard(newBoard);
          
          const winner = checkWinner(newBoard);
          if (winner === 'O') {
            setGameStatus('lost');
            setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
            setBotMessage(botMessages.aiWin[botPersona]);
          } else if (newBoard.every(square => square !== null)) {
            setGameStatus('draw');
            setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
            setBotMessage(botMessages.draw[botPersona]);
          } else {
            // Occasional teasing
            if (Math.random() < 0.2) {
              setBotMessage(botMessages.tease[botPersona]);
            }
          }
        }
        setIsPlayerTurn(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, board, gameStatus, difficulty, botPersona]);

  const startNewGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameStatus('playing');
    setGameStarted(true);
    setBotMessage(botMessages.gameStart[botPersona]);
  };

  const resetScore = () => {
    setScore({ player: 0, ai: 0, draws: 0 });
  };

  const cardClasses = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-orange-200";

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className={`${cardClasses} border p-8 rounded-xl max-w-2xl w-full`}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">🎯 Tic-Tac-Toe Challenge</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Strategic thinking meets fun! Choose your difficulty and take on your AI companion.
          </p>

          {/* Difficulty Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">AI Difficulty:</label>
            <div className="flex justify-center space-x-2">
              {['easy', 'medium', 'hard'].map(level => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  disabled={gameStatus === 'playing' && gameStarted}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    difficulty === level
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${gameStatus === 'playing' && gameStarted ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-900 bg-opacity-50' : 'bg-green-50'}`}>
              <div className="text-lg font-bold text-green-600">You</div>
              <div className="text-2xl font-bold">{score.player}</div>
            </div>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="text-lg font-bold">Draws</div>
              <div className="text-2xl font-bold">{score.draws}</div>
            </div>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-red-900 bg-opacity-50' : 'bg-red-50'}`}>
              <div className="text-lg font-bold text-red-600">AI</div>
              <div className="text-2xl font-bold">{score.ai}</div>
            </div>
          </div>

          {/* Bot Message */}
          {botMessage && (
            <div className={`p-3 rounded-lg mb-4 ${darkMode ? 'bg-blue-900 bg-opacity-50 text-blue-200' : 'bg-blue-50 text-blue-800'}`}>
              <div className="flex items-center justify-center space-x-2">
                <span>🤖</span>
                <span>{botMessage}</span>
              </div>
            </div>
          )}

          {/* Game Controls */}
          <div className="flex justify-center space-x-3 mb-6">
            {!gameStarted || gameStatus !== 'playing' ? (
              <button
                onClick={startNewGame}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-blue-700 transition-all"
              >
                {gameStarted ? 'New Game' : 'Start Game'}
              </button>
            ) : null}
            
            <button
              onClick={resetScore}
              className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-medium hover:from-gray-600 hover:to-gray-700 transition-all"
            >
              Reset Score
            </button>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-3 gap-2 w-64 h-64">
            {board.map((square, index) => (
              <button
                key={index}
                onClick={() => makeMove(index)}
                disabled={square !== null || !isPlayerTurn || gameStatus !== 'playing'}
                className={`w-20 h-20 text-3xl font-bold rounded-lg border-2 transition-all ${
                  square === 'X'
                    ? 'bg-green-100 text-green-600 border-green-300'
                    : square === 'O'
                      ? 'bg-red-100 text-red-600 border-red-300'
                      : darkMode
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                } ${square === null && isPlayerTurn && gameStatus === 'playing' ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                {square}
              </button>
            ))}
          </div>
        </div>

        {/* Game Status */}
        {gameStatus !== 'playing' && gameStarted && (
          <div className="text-center mb-4">
            <div className={`text-lg font-semibold ${
              gameStatus === 'won' ? 'text-green-600' :
              gameStatus === 'lost' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {gameStatus === 'won' ? '🎉 You Won!' :
               gameStatus === 'lost' ? '🤖 AI Wins!' : '🤝 It\'s a Draw!'}
            </div>
          </div>
        )}

        {/* Mental Health Benefits */}
        <div className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
          <h3 className="font-semibold mb-2">🧠 Strategic Thinking Benefits:</h3>
          <ul className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
            <li>• <strong>Decision Making:</strong> Practice quick strategic decisions</li>
            <li>• <strong>Pattern Recognition:</strong> Improves cognitive flexibility</li>
            <li>• <strong>Focus:</strong> Enhances concentration and attention</li>
            <li>• <strong>Resilience:</strong> Learn from losses and celebrate wins</li>
            <li>• <strong>Social Connection:</strong> Interactive play with AI companion</li>
          </ul>
        </div>
      </div>
    </div>
  );
}