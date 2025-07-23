import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Arcade.module.css';
import PacMan from './PacMan';
import Tetris from './Tetris';

interface SnakeSegment {
  x: number;
  y: number;
}

interface Food {
  x: number;
  y: number;
}

interface ArcadeProps {
  onBack?: () => void;
}

const Arcade: React.FC<ArcadeProps> = ({ onBack }) => {
  const [currentGame, setCurrentGame] = useState<'menu' | 'snake' | 'pacman' | 'tetris'>('menu');
  const [snake, setSnake] = useState<SnakeSegment[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Food>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [gameRunning, setGameRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(150);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const GRID_WIDTH = 30;
  const GRID_HEIGHT = 20;

  // Initialize high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  const generateFood = useCallback(() => {
    let newFood: Food;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  }, [snake]);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setScore(0);
    setGameOver(false);
    setGameRunning(false);
    generateFood();
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, [generateFood]);

  const startSnakeGame = useCallback(() => {
    resetGame();
    setGameRunning(true);
    setCurrentGame('snake');
  }, [resetGame]);

  const startPacManGame = useCallback(() => {
    setCurrentGame('pacman');
  }, []);

  const startTetrisGame = useCallback(() => {
    setCurrentGame('tetris');
  }, []);

  const moveSnake = useCallback(() => {
    if (!gameRunning) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      // Move head based on direction
      switch (direction) {
        case 'UP':
          head.y = (head.y - 1 + GRID_HEIGHT) % GRID_HEIGHT;
          break;
        case 'DOWN':
          head.y = (head.y + 1) % GRID_HEIGHT;
          break;
        case 'LEFT':
          head.x = (head.x - 1 + GRID_WIDTH) % GRID_WIDTH;
          break;
        case 'RIGHT':
          head.x = (head.x + 1) % GRID_WIDTH;
          break;
      }

      // Check if snake hits itself
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setGameRunning(false);
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('snakeHighScore', score.toString());
        }
        return prevSnake;
      }

      newSnake.unshift(head);

      // Check if snake eats food
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 1);
        generateFood();
        // Increase speed every 5 points
        if ((score + 1) % 5 === 0 && gameSpeed > 50) {
          setGameSpeed(prev => prev - 10);
        }
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameRunning, direction, food, score, highScore, gameSpeed, generateFood]);

  // Game loop
  useEffect(() => {
    if (gameRunning && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, gameSpeed);
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameRunning, gameOver, moveSnake, gameSpeed]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameRunning) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setDirection(prev => prev !== 'DOWN' ? 'UP' : prev);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setDirection(prev => prev !== 'UP' ? 'DOWN' : prev);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setDirection(prev => prev !== 'RIGHT' ? 'LEFT' : prev);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setDirection(prev => prev !== 'LEFT' ? 'RIGHT' : prev);
          break;
        case ' ':
          e.preventDefault();
          if (gameOver) {
            resetGame();
            setGameRunning(true);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameRunning, gameOver, resetGame]);

  const handleDirectionClick = (newDirection: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (!gameRunning) return;
    
    const opposites = {
      'UP': 'DOWN',
      'DOWN': 'UP',
      'LEFT': 'RIGHT',
      'RIGHT': 'LEFT'
    };
    
    if (direction !== opposites[newDirection]) {
      setDirection(newDirection);
    }
  };

  const renderGameGrid = () => {
    const grid = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
        const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
        const isFood = food.x === x && food.y === y;

        let cellClass = styles.gridCell;
        if (isSnakeHead) cellClass += ` ${styles.snakeHead}`;
        else if (isSnakeBody) cellClass += ` ${styles.snakeBody}`;
        else if (isFood) cellClass += ` ${styles.food}`;

        grid.push(
          <div
            key={`${x}-${y}`}
            className={cellClass}
            style={{
              left: `${(x / GRID_WIDTH) * 100}%`,
              top: `${(y / GRID_HEIGHT) * 100}%`,
              width: `${100 / GRID_WIDTH}%`,
              height: `${100 / GRID_HEIGHT}%`
            }}
          />
        );
      }
    }
    return grid;
  };

  if (currentGame === 'menu') {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>🎮 Arcade</h1>
          <button className={styles.backButton} onClick={onBack}>
            ⏰ Back to Clock
          </button>
        </div>

        <div className={styles.gameMenu}>
          <div className={styles.gameCard} onClick={startSnakeGame}>
            <div className={styles.gameIcon}>🐍</div>
            <h2>Snake Game</h2>
            <p>Classic snake game - eat berries and grow longer!</p>
            <div className={styles.highScore}>
              High Score: {highScore}
            </div>
          </div>

          <div className={styles.gameCard} onClick={startPacManGame} style={{ borderColor: 'yellow', color: 'yellow' }}>
            <div className={styles.gameIcon}>🟡</div>
            <h2>Pac-Man</h2>
            <p>Eat all the dots and avoid the ghosts!</p>
            <div className={styles.highScore}>
              Classic Maze Game
            </div>
          </div>

          <div className={styles.gameCard} onClick={startTetrisGame} style={{ borderColor: '#00f0f0', color: '#00f0f0' }}>
            <div className={styles.gameIcon}>🟦</div>
            <h2>Tetris</h2>
            <p>Stack the blocks and clear lines!</p>
            <div className={styles.highScore}>
              Classic Puzzle Game
            </div>
          </div>
          
          <div className={styles.comingSoon}>
            <div className={styles.gameIcon}>🎯</div>
            <h2>More Games Coming Soon!</h2>
            <p>Stay tuned for more classic arcade games</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentGame === 'pacman') {
    return (
      <PacMan onBack={() => setCurrentGame('menu')} />
    );
  }

  if (currentGame === 'tetris') {
    return (
      <Tetris onBack={() => setCurrentGame('menu')} />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.gameHeader}>
        <div className={styles.gameInfo}>
          <h2>🐍 Snake Game</h2>
          <div className={styles.scoreBoard}>
            <div className={styles.score}>Score: {score}</div>
            <div className={styles.highScore}>High Score: {highScore}</div>
          </div>
        </div>
        <button className={styles.backButton} onClick={() => setCurrentGame('menu')}>
          🎮 Back to Arcade
        </button>
      </div>

      <div className={styles.gameContainer}>
        <div className={styles.gameGrid}>
          {renderGameGrid()}
        </div>

        {gameOver && (
          <div className={styles.gameOver}>
            <h2>Game Over!</h2>
            <p>Final Score: {score}</p>
            <button className={styles.restartButton} onClick={resetGame}>
              Play Again
            </button>
          </div>
        )}

        {!gameRunning && !gameOver && (
          <div className={styles.gamePaused}>
            <h2>Snake Game</h2>
            <p>Use arrow keys to control the snake</p>
            <p>Eat berries to grow and score points</p>
            <button className={styles.startButton} onClick={() => setGameRunning(true)}>
              Start Game
            </button>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <div className={styles.controlRow}>
          <button 
            className={styles.controlButton}
            onClick={() => handleDirectionClick('UP')}
          >
            ↑
          </button>
        </div>
        <div className={styles.controlRow}>
          <button 
            className={styles.controlButton}
            onClick={() => handleDirectionClick('LEFT')}
          >
            ←
          </button>
          <button 
            className={styles.controlButton}
            onClick={() => handleDirectionClick('RIGHT')}
          >
            →
          </button>
        </div>
        <div className={styles.controlRow}>
          <button 
            className={styles.controlButton}
            onClick={() => handleDirectionClick('DOWN')}
          >
            ↓
          </button>
        </div>
      </div>
    </div>
  );
};

export default Arcade; 