import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Arcade.module.css';
import PacMan from './PacMan';
import Tetris from './Tetris';
import TwoPlayerTetris from './TwoPlayerTetris';
import TicTacToe from './TicTacToe';
import MultiplayerTicTacToe from './MultiplayerTicTacToe';
import SnakeScoreboard from './SnakeScoreboard';
import TetrisScoreboard from './TetrisScoreboard';
import SlotMachine from './SlotMachine';

interface SnakeSegment {
  x: number;
  y: number;
}

interface Food {
  x: number;
  y: number;
}

interface ArcadeProps {
  onBack: () => void;
}

interface GameStats {
  totalGames: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  gamesPlayed: number;
}

const Arcade: React.FC<ArcadeProps> = ({ onBack }) => {
  const [currentGame, setCurrentGame] = useState<'menu' | 'snake' | 'pacman' | 'tetris' | 'twoplayer-tetris' | 'tictactoe' | 'multiplayer-tictactoe' | 'snake-scoreboard' | 'tetris-scoreboard' | 'slotmachine'>('menu');
  const [snake, setSnake] = useState<SnakeSegment[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Food>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [gameRunning, setGameRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(150);
  const [level, setLevel] = useState(1);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalGames: 0,
    totalScore: 0,
    averageScore: 0,
    bestScore: 0,
    gamesPlayed: 0
  });
  const [tetrisHighScore, setTetrisHighScore] = useState(0);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const scoreSavedRef = useRef(false);

  const GRID_WIDTH = 30;
  const GRID_HEIGHT = 20;

  // Initialize high score and stats from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    const savedStats = localStorage.getItem('snakeGameStats');
    const savedTetrisHighScore = localStorage.getItem('tetrisHighScore');
    
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
    
    if (savedStats) {
      setGameStats(JSON.parse(savedStats));
    }
    
    if (savedTetrisHighScore) {
      setTetrisHighScore(parseInt(savedTetrisHighScore));
    }
  }, []);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('snakeGameStats', JSON.stringify(gameStats));
  }, [gameStats]);

  // Listen for Tetris high score changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tetrisHighScore' && e.newValue) {
        setTetrisHighScore(parseInt(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
    setLevel(1);
    setGameSpeed(150);
    setGameOver(false);
    setGameRunning(false);
    scoreSavedRef.current = false;
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
    localStorage.setItem('snakeGameStartTime', Date.now().toString());
  }, [resetGame]);

  const startPacManGame = useCallback(() => {
    setCurrentGame('pacman');
  }, []);

  const startTetrisGame = useCallback(() => {
    setCurrentGame('tetris');
  }, []);

  const startTwoPlayerTetrisGame = useCallback(() => {
    setCurrentGame('twoplayer-tetris');
  }, []);

  const startTicTacToeGame = useCallback(() => {
    setCurrentGame('tictactoe');
  }, []);

  const startMultiplayerTicTacToeGame = useCallback(() => {
    setCurrentGame('multiplayer-tictactoe');
  }, []);

  const startSlotMachineGame = useCallback(() => {
    setCurrentGame('slotmachine');
  }, []);

  const resetSnakeStats = useCallback(() => {
    setGameStats({
      totalGames: 0,
      totalScore: 0,
      averageScore: 0,
      bestScore: 0,
      gamesPlayed: 0
    });
    setHighScore(0);
    localStorage.removeItem('snakeHighScore');
    localStorage.removeItem('snakeGameStats');
  }, []);



  const openSnakeScoreboard = useCallback(() => {
    setCurrentGame('snake-scoreboard');
  }, []);

  const openTetrisScoreboard = useCallback(() => {
    setCurrentGame('tetris-scoreboard');
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
        
        // Only save score if not already saved (prevent duplicates)
        if (!scoreSavedRef.current) {
          scoreSavedRef.current = true;
          
          // Save individual score
          const gameStartTime = localStorage.getItem('snakeGameStartTime');
          const duration = gameStartTime ? Math.floor((Date.now() - parseInt(gameStartTime)) / 1000) : 0;
          
          const newScore = {
            id: Date.now().toString(),
            score: score,
            level: level,
            date: new Date().toISOString(),
            duration: duration
          };
          
          const existingScores = localStorage.getItem('snakeScores');
          const scores = existingScores ? JSON.parse(existingScores) : [];
          scores.push(newScore);
          localStorage.setItem('snakeScores', JSON.stringify(scores));
          
          // Update game statistics
          const newStats = {
            totalGames: gameStats.totalGames + 1,
            totalScore: gameStats.totalScore + score,
            averageScore: Math.round((gameStats.totalScore + score) / (gameStats.totalGames + 1)),
            bestScore: Math.max(gameStats.bestScore, score),
            gamesPlayed: gameStats.gamesPlayed + 1
          };
          setGameStats(newStats);
          
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('snakeHighScore', score.toString());
          }
        }
        return prevSnake;
      }

      newSnake.unshift(head);

      // Check if snake eats food
      if (head.x === food.x && head.y === food.y) {
        const newScore = score + 1;
        const newLevel = Math.floor(newScore / 5) + 1;
        setScore(newScore);
        setLevel(newLevel);
        generateFood();
        
        // Increase speed every 5 points (level up)
        if (newScore % 5 === 0 && gameSpeed > 50) {
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
            <div className={styles.gameStats}>
              Games: {gameStats.gamesPlayed} | Avg: {gameStats.averageScore}
            </div>
            <button className={styles.scoreboardButton} onClick={(e) => {
              e.stopPropagation();
              openSnakeScoreboard();
            }}>
              📊 View Scoreboard
            </button>
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
              High Score: {tetrisHighScore}
            </div>
            <button className={styles.scoreboardButton} onClick={(e) => {
              e.stopPropagation();
              openTetrisScoreboard();
            }}>
              📊 View Scoreboard
            </button>
          </div>

          <div className={styles.gameCard} onClick={startTwoPlayerTetrisGame} style={{ borderColor: '#ff6b6b', color: '#ff6b6b' }}>
            <div className={styles.gameIcon}>👥</div>
            <h2>Two Player Tetris</h2>
            <p>Compete with a friend on the same screen!</p>
            <div className={styles.highScore}>
              Local Multiplayer
            </div>
          </div>

          <div className={styles.gameCard} onClick={startTicTacToeGame} style={{ borderColor: '#4CAF50', color: '#4CAF50' }}>
            <div className={styles.gameIcon}>⭕</div>
            <h2>Tic Tac Toe</h2>
            <p>Classic X's and O's game!</p>
            <div className={styles.highScore}>
              Two Player Game
            </div>
          </div>

          <div className={styles.gameCard} onClick={startMultiplayerTicTacToeGame} style={{ borderColor: '#00bcd4', color: '#00bcd4' }}>
            <div className={styles.gameIcon}>🌐</div>
            <h2>Multiplayer Tic Tac Toe</h2>
            <p>Play with friends across devices!</p>
            <div className={styles.highScore}>
              Online Multiplayer
            </div>
          </div>

          <div className={styles.gameCard} onClick={startSlotMachineGame} style={{ borderColor: '#ffd700', color: '#ffd700' }}>
            <div className={styles.gameIcon}>🎰</div>
            <h2>777 Slot Machine</h2>
            <p>Try your luck with classic slot machine!</p>
            <div className={styles.highScore}>
              Casino Game
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

  if (currentGame === 'twoplayer-tetris') {
    return (
      <TwoPlayerTetris onBack={() => setCurrentGame('menu')} />
    );
  }

  if (currentGame === 'tictactoe') {
    return (
      <TicTacToe onBack={() => setCurrentGame('menu')} />
    );
  }

  if (currentGame === 'multiplayer-tictactoe') {
    return (
      <MultiplayerTicTacToe onBack={() => setCurrentGame('menu')} />
    );
  }

  if (currentGame === 'snake-scoreboard') {
    return (
      <SnakeScoreboard onBack={() => setCurrentGame('menu')} />
    );
  }

  if (currentGame === 'tetris-scoreboard') {
    return (
      <TetrisScoreboard onBack={() => setCurrentGame('menu')} />
    );
  }

  if (currentGame === 'slotmachine') {
    return (
      <SlotMachine onBack={() => setCurrentGame('menu')} />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.gameHeader}>
        <div className={styles.gameInfo}>
          <h2>🐍 Snake Game</h2>
          <div className={styles.scoreBoard}>
            <div className={styles.score}>Score: {score}</div>
            <div className={styles.level}>Level: {level}</div>
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
            <div className={styles.gameOverStats}>
              <p>Final Score: {score}</p>
              <p>Level Reached: {level}</p>
              {score > highScore && <p className={styles.newRecord}>🏆 New High Score! 🏆</p>}
            </div>
            <div className={styles.gameStats}>
              <h3>Game Statistics</h3>
              <div className={styles.statsGrid}>
                <div>Games Played: {gameStats.gamesPlayed}</div>
                <div>Best Score: {gameStats.bestScore}</div>
                <div>Average Score: {gameStats.averageScore}</div>
                <div>Total Score: {gameStats.totalScore}</div>
              </div>
            </div>
            <div className={styles.gameOverButtons}>
              <button className={styles.restartButton} onClick={resetGame}>
                Play Again
              </button>
              <button className={styles.resetStatsButton} onClick={resetSnakeStats}>
                Reset Stats
              </button>
            </div>
          </div>
        )}

        {!gameRunning && !gameOver && (
          <div className={styles.gamePaused}>
            <h2>Snake Game</h2>
            <p>Use arrow keys to control the snake</p>
            <p>Eat berries to grow and score points</p>
            <p>Current Level: {level}</p>
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