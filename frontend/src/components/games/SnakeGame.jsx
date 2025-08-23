import React, { useState, useEffect, useCallback } from 'react';

export default function SnakeGame({ darkMode }) {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 0, y: 1 });
  const [gameRunning, setGameRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const BOARD_SIZE = 20;

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection({ x: 0, y: 1 });
    setScore(0);
    setGameOver(false);
    setGameRunning(false);
  };

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE)
    };
    setFood(newFood);
  }, []);

  const moveSnake = useCallback(() => {
    if (!gameRunning || gameOver) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      // Check wall collision
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setGameOver(true);
        setGameRunning(false);
        return prevSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setGameRunning(false);
        return prevSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameRunning, gameOver, generateFood]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameRunning) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameRunning]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, 200);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  const cardClasses = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-orange-200";

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className={`${cardClasses} border p-8 rounded-xl max-w-2xl w-full`}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">🐍 Snake Game</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Use arrow keys to move. Eat the food to grow and increase your score!
          </p>
          <div className="flex justify-center items-center space-x-6 mb-4">
            <div className="text-lg font-semibold">Score: {score}</div>
            {!gameRunning && !gameOver && (
              <button
                onClick={() => setGameRunning(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-blue-700 transition-all"
              >
                Start Game
              </button>
            )}
            {gameOver && (
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transition-all"
              >
                Play Again
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <div 
            className={`grid gap-1 p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} rounded-xl`}
            style={{ 
              gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
              width: '400px',
              height: '400px'
            }}
          >
            {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
              const x = index % BOARD_SIZE;
              const y = Math.floor(index / BOARD_SIZE);
              
              const isSnake = snake.some(segment => segment.x === x && segment.y === y);
              const isFood = food.x === x && food.y === y;
              const isHead = snake[0] && snake[0].x === x && snake[0].y === y;
              
              let cellClass = `w-full h-full rounded-sm transition-colors`;
              
              if (isHead) {
                cellClass += ` bg-green-600`;
              } else if (isSnake) {
                cellClass += ` bg-green-400`;
              } else if (isFood) {
                cellClass += ` bg-red-500`;
              } else {
                cellClass += darkMode ? ` bg-gray-800` : ` bg-gray-200`;
              }
              
              return (
                <div key={index} className={cellClass}>
                  {isFood && <div className="w-full h-full flex items-center justify-center text-xs">🍎</div>}
                </div>
              );
            })}
          </div>
        </div>

        {gameOver && (
          <div className="text-center mt-6">
            <p className="text-lg font-semibold mb-2">🎮 Game Over!</p>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Final Score: {score} • Great job! 🎉
            </p>
          </div>
        )}

        <div className={`mt-6 p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
          <h3 className="font-semibold mb-2">🧠 Why Snake Helps Your Mind:</h3>
          <ul className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
            <li>• <strong>Focus:</strong> Requires sustained attention and concentration</li>
            <li>• <strong>Planning:</strong> Strategic thinking about future moves</li>
            <li>• <strong>Relaxation:</strong> Repetitive gameplay reduces stress</li>
            <li>• <strong>Achievement:</strong> Small wins boost confidence and mood</li>
          </ul>
        </div>
      </div>
    </div>
  );
}