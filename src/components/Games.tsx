import React, { useState, useEffect, useRef } from 'react';
import styles from './Games.module.css';

interface GameScore {
  game: string;
  score: number;
  date: string;
}

const Games: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<string>('menu');
  const [scores, setScores] = useState<GameScore[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [gameTime, setGameTime] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const games = [
    { id: 'timekeeper', name: 'Time Keeper', icon: '⏰', description: 'Click the clock when it shows the target time!' },
    { id: 'speedtimer', name: 'Speed Timer', icon: '⚡', description: 'Stop the timer as close to the target as possible!' },
    { id: 'memoryclock', name: 'Memory Clock', icon: '🧠', description: 'Remember the time pattern and repeat it!' },
    { id: 'timepuzzle', name: 'Time Puzzle', icon: '🧩', description: 'Arrange the clock hands to match the time!' }
  ];

  useEffect(() => {
    // Load saved scores
    const savedScores = localStorage.getItem('gameScores');
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
  }, []);

  useEffect(() => {
    // Save scores to localStorage
    localStorage.setItem('gameScores', JSON.stringify(scores));
  }, [scores]);

  const startGame = (gameId: string) => {
    setCurrentGame(gameId);
    setCurrentScore(0);
    setGameTime(30);
    setIsPlaying(true);
    
    // Start game timer
    intervalRef.current = setInterval(() => {
      setGameTime(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    
    // Save score
    const newScore: GameScore = {
      game: currentGame,
      score: currentScore,
      date: new Date().toLocaleDateString()
    };
    setScores(prev => [...prev, newScore]);
  };

  const addScore = (points: number) => {
    setCurrentScore(prev => prev + points);
  };

  const getHighScore = (gameId: string) => {
    const gameScores = scores.filter(s => s.game === gameId);
    return gameScores.length > 0 ? Math.max(...gameScores.map(s => s.score)) : 0;
  };

  const backToMenu = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentGame('menu');
    setIsPlaying(false);
  };

  // Time Keeper Game
  const TimeKeeperGame = () => {
    const [targetTime, setTargetTime] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [lastClick, setLastClick] = useState(0);

    useEffect(() => {
      if (!isPlaying) return;
      
      const interval = setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        });
        setCurrentTime(timeStr);
        
        // Generate new target every 3 seconds
        if (now.getTime() - lastClick > 3000) {
          const target = new Date(now.getTime() + 2000 + Math.random() * 3000);
          setTargetTime(target.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }));
        }
      }, 100);

      return () => clearInterval(interval);
    }, [isPlaying, lastClick]);

    const handleClick = () => {
      const now = Date.now();
      setLastClick(now);
      
      const timeDiff = Math.abs(new Date().getTime() - new Date(targetTime).getTime());
      if (timeDiff < 1000) {
        addScore(100);
      } else if (timeDiff < 2000) {
        addScore(50);
      } else {
        addScore(10);
      }
    };

    return (
      <div className={styles.gameContainer}>
        <h3>⏰ Time Keeper</h3>
        <div className={styles.gameInfo}>
          <p>Click when the clock shows: <strong>{targetTime}</strong></p>
          <p>Current time: <strong>{currentTime}</strong></p>
        </div>
        <button 
          className={styles.gameButton}
          onClick={handleClick}
          disabled={!isPlaying}
        >
          CLICK NOW!
        </button>
      </div>
    );
  };

  // Speed Timer Game
  const SpeedTimerGame = () => {
    const [targetSeconds, setTargetSeconds] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [startTime, setStartTime] = useState(0);

    useEffect(() => {
      if (!isPlaying) return;
      
      if (isRunning) {
        const interval = setInterval(() => {
          setElapsedTime(Date.now() - startTime);
        }, 10);
        return () => clearInterval(interval);
      }
    }, [isPlaying, isRunning, startTime]);

    const startTimer = () => {
      setTargetSeconds(Math.floor(Math.random() * 10) + 1);
      setElapsedTime(0);
      setIsRunning(true);
      setStartTime(Date.now());
    };

    const stopTimer = () => {
      setIsRunning(false);
      const difference = Math.abs(elapsedTime - targetSeconds * 1000);
      if (difference < 100) {
        addScore(100);
      } else if (difference < 500) {
        addScore(50);
      } else if (difference < 1000) {
        addScore(25);
      } else {
        addScore(10);
      }
    };

    return (
      <div className={styles.gameContainer}>
        <h3>⚡ Speed Timer</h3>
        <div className={styles.gameInfo}>
          <p>Stop the timer at exactly: <strong>{targetSeconds} seconds</strong></p>
          <p>Elapsed: <strong>{(elapsedTime / 1000).toFixed(2)}s</strong></p>
        </div>
        <div className={styles.timerButtons}>
          <button 
            className={styles.gameButton}
            onClick={startTimer}
            disabled={isRunning || !isPlaying}
          >
            Start Timer
          </button>
          <button 
            className={styles.gameButton}
            onClick={stopTimer}
            disabled={!isRunning || !isPlaying}
          >
            Stop Timer
          </button>
        </div>
      </div>
    );
  };

  // Memory Clock Game
  const MemoryClockGame = () => {
    const [sequence, setSequence] = useState<number[]>([]);
    const [playerSequence, setPlayerSequence] = useState<number[]>([]);
    const [level, setLevel] = useState(1);
    const [isShowing, setIsShowing] = useState(false);

    useEffect(() => {
      if (!isPlaying) return;
      generateNewSequence();
    }, [isPlaying]);

    const generateNewSequence = () => {
      const newSequence = Array.from({ length: level + 2 }, () => 
        Math.floor(Math.random() * 12)
      );
      setSequence(newSequence);
      setPlayerSequence([]);
      showSequence(newSequence);
    };

    const showSequence = async (seq: number[]) => {
      setIsShowing(true);
      for (let i = 0; i < seq.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      setIsShowing(false);
    };

    const handleNumberClick = (num: number) => {
      if (isShowing || !isPlaying) return;
      
      const newPlayerSeq = [...playerSequence, num];
      setPlayerSequence(newPlayerSeq);
      
      if (newPlayerSeq[newPlayerSeq.length - 1] !== sequence[newPlayerSeq.length - 1]) {
        // Wrong sequence
        addScore(level * 10);
        setLevel(1);
        generateNewSequence();
      } else if (newPlayerSeq.length === sequence.length) {
        // Correct sequence
        addScore(level * 50);
        setLevel(level + 1);
        generateNewSequence();
      }
    };

    return (
      <div className={styles.gameContainer}>
        <h3>🧠 Memory Clock</h3>
        <div className={styles.gameInfo}>
          <p>Level: <strong>{level}</strong></p>
          <p>Remember the sequence!</p>
        </div>
        <div className={styles.clockGrid}>
          {Array.from({ length: 12 }, (_, i) => (
            <button
              key={i}
              className={`${styles.clockNumber} ${
                isShowing && sequence[playerSequence.length] === i ? styles.highlighted : ''
              }`}
              onClick={() => handleNumberClick(i)}
              disabled={isShowing || !isPlaying}
            >
              {i === 0 ? 12 : i}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Time Puzzle Game
  const TimePuzzleGame = () => {
    const [targetTime, setTargetTime] = useState({ hours: 0, minutes: 0 });
    const [currentTime, setCurrentTime] = useState({ hours: 0, minutes: 0 });

    useEffect(() => {
      if (!isPlaying) return;
      generateNewPuzzle();
    }, [isPlaying]);

    const generateNewPuzzle = () => {
      const hours = Math.floor(Math.random() * 12);
      const minutes = Math.floor(Math.random() * 60);
      setTargetTime({ hours, minutes });
      setCurrentTime({ hours: 0, minutes: 0 });
    };

    const adjustTime = (type: 'hours' | 'minutes', direction: 1 | -1) => {
      setCurrentTime(prev => {
        let newValue = prev[type] + direction;
        if (type === 'hours') {
          newValue = (newValue + 12) % 12;
        } else {
          newValue = (newValue + 60) % 60;
        }
        return { ...prev, [type]: newValue };
      });
    };

    const checkSolution = () => {
      const hoursMatch = currentTime.hours === targetTime.hours;
      const minutesMatch = Math.abs(currentTime.minutes - targetTime.minutes) <= 5;
      
      if (hoursMatch && minutesMatch) {
        addScore(100);
        generateNewPuzzle();
      } else {
        addScore(10);
      }
    };

    return (
      <div className={styles.gameContainer}>
        <h3>🧩 Time Puzzle</h3>
        <div className={styles.gameInfo}>
          <p>Set the clock to: <strong>{targetTime.hours}:{targetTime.minutes.toString().padStart(2, '0')}</strong></p>
        </div>
        <div className={styles.clockPuzzle}>
          <div className={styles.timeDisplay}>
            <div className={styles.timeControl}>
              <button onClick={() => adjustTime('hours', 1)}>▲</button>
              <span>{currentTime.hours}</span>
              <button onClick={() => adjustTime('hours', -1)}>▼</button>
            </div>
            <span>:</span>
            <div className={styles.timeControl}>
              <button onClick={() => adjustTime('minutes', 1)}>▲</button>
              <span>{currentTime.minutes.toString().padStart(2, '0')}</span>
              <button onClick={() => adjustTime('minutes', -1)}>▼</button>
            </div>
          </div>
          <button 
            className={styles.gameButton}
            onClick={checkSolution}
            disabled={!isPlaying}
          >
            Check Answer
          </button>
        </div>
      </div>
    );
  };

  const renderGame = () => {
    switch (currentGame) {
      case 'timekeeper':
        return <TimeKeeperGame />;
      case 'speedtimer':
        return <SpeedTimerGame />;
      case 'memoryclock':
        return <MemoryClockGame />;
      case 'timepuzzle':
        return <TimePuzzleGame />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.gamesContainer}>
      <div className={styles.gamesHeader}>
        <h2>🎮 Mini Games</h2>
        <div className={styles.headerControls}>
          <button 
            className={styles.backButton}
            onClick={backToMenu}
          >
            ← Back
          </button>
        </div>
      </div>

      {currentGame === 'menu' ? (
        <div className={styles.gamesMenu}>
          <div className={styles.gamesGrid}>
            {games.map(game => (
              <div key={game.id} className={styles.gameCard}>
                <div className={styles.gameIcon}>{game.icon}</div>
                <h3>{game.name}</h3>
                <p>{game.description}</p>
                <div className={styles.gameStats}>
                  <span>High Score: {getHighScore(game.id)}</span>
                </div>
                <button 
                  className={styles.playButton}
                  onClick={() => startGame(game.id)}
                >
                  Play
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.gamePlay}>
          <div className={styles.gameHeader}>
            <div className={styles.gameStats}>
              <span>Score: {currentScore}</span>
              <span>Time: {gameTime}s</span>
            </div>
          </div>
          {renderGame()}
        </div>
      )}
    </div>
  );
};

export default Games; 