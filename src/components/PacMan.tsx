import React, { useState, useEffect, useRef } from 'react';

interface PacManProps {
  onBack?: () => void;
}

// Maze legend: 0 = empty, 1 = wall, 2 = dot, 3 = power pellet
const CLASSIC_MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,3,1],
  [1,2,1,1,2,1,2,1,2,1,2,1,2,1,2,1,1,2,1],
  [1,2,1,1,2,2,2,1,2,2,2,1,2,2,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,2,1],
  [1,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,1],
  [0,1,2,2,2,1,2,2,2,2,2,2,2,1,2,2,2,1,0],
  [1,1,2,1,2,1,2,1,1,0,1,1,2,1,2,1,2,1,1],
  [1,2,2,1,2,2,2,1,0,0,0,1,2,2,2,1,2,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,3,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,3,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];
const ROWS = CLASSIC_MAZE.length;
const COLS = CLASSIC_MAZE[0].length;

const DIRS = [
  { dx: 0, dy: -1 }, // up
  { dx: 0, dy: 1 },  // down
  { dx: -1, dy: 0 }, // left
  { dx: 1, dy: 0 },  // right
];

const GHOST_COLORS = ['red', 'pink', 'cyan', 'orange'];

function isWall(maze: number[][], x: number, y: number) {
  return maze[y] && maze[y][x] === 1;
}

const PacMan: React.FC<PacManProps> = ({ onBack }) => {
  const [maze, setMaze] = useState(() => CLASSIC_MAZE.map(row => [...row]));
  const [pacman, setPacman] = useState({ x: 9, y: 11, dir: 3 }); // start at center bottom, facing right
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [win, setWin] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [power, setPower] = useState(0); // power mode timer
  const [ghosts, setGhosts] = useState([
    { x: 9, y: 5, dir: 1, color: 0, dead: false },
    { x: 8, y: 7, dir: 0, color: 1, dead: false },
    { x: 10, y: 7, dir: 2, color: 2, dead: false },
    { x: 9, y: 7, dir: 3, color: 3, dead: false },
  ]);
  const moveRef = useRef({ pacman, ghosts, maze, power, score, lives, win, gameOver });
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);

  // Keep refs in sync
  useEffect(() => {
    moveRef.current = { pacman, ghosts, maze, power, score, lives, win, gameOver };
  }, [pacman, ghosts, maze, power, score, lives, win, gameOver]);

  // Create new audio instance on play
  const playMusic = () => {
    console.log('Creating new PacMan audio instance...');
    const audio = new Audio('/PacMan Original Theme.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().then(() => {
      console.log('PacMan audio started successfully');
      setAudioInstance(audio);
      setMusicPlaying(true);
    }).catch((error) => {
      console.error('Failed to play PacMan audio:', error);
    });
  };

  const stopMusic = () => {
    console.log('Stopping PacMan audio...');
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
      setAudioInstance(null);
    }
    setMusicPlaying(false);
  };

  const toggleMusic = () => {
    if (musicPlaying) {
      stopMusic();
    } else {
      playMusic();
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
        audioInstance.currentTime = 0;
      }
    };
  }, [audioInstance]);

  // Pac-Man movement
  useEffect(() => {
    if (win || gameOver) return;
    const handle = setInterval(() => {
      setPacman(prev => {
        let { x, y, dir } = prev;
        let nx = x + DIRS[dir].dx;
        let ny = y + DIRS[dir].dy;
        // Tunnel wrap
        if (nx < 0) nx = COLS - 1;
        if (nx >= COLS) nx = 0;
        if (ny < 0) ny = ROWS - 1;
        if (ny >= ROWS) ny = 0;
        if (!isWall(moveRef.current.maze, nx, ny)) {
          // Eat dot or power pellet
          let cell = moveRef.current.maze[ny][nx];
          let newMaze = moveRef.current.maze.map(row => [...row]);
          let newScore = moveRef.current.score;
          let newPower = moveRef.current.power;
          if (cell === 2) newScore += 10;
          if (cell === 3) { newScore += 50; newPower = 50; }
          if (cell === 2 || cell === 3) newMaze[ny][nx] = 0;
          // Win check
          if (newMaze.flat().every(cell => cell !== 2 && cell !== 3)) {
            setWin(true);
          }
          setScore(newScore);
          setPower(newPower > 0 ? newPower - 1 : 0);
          setMaze(newMaze);
          return { x: nx, y: ny, dir };
        }
        return prev;
      });
    }, 120);
    return () => clearInterval(handle);
  }, [win, gameOver]);

  // Keyboard controls
  useEffect(() => {
    if (win || gameOver) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W') setPacman(p => ({ ...p, dir: 0 }));
      if (e.key === 's' || e.key === 'S') setPacman(p => ({ ...p, dir: 1 }));
      if (e.key === 'a' || e.key === 'A') setPacman(p => ({ ...p, dir: 2 }));
      if (e.key === 'd' || e.key === 'D') setPacman(p => ({ ...p, dir: 3 }));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [win, gameOver]);

  // Ghost movement
  useEffect(() => {
    if (win || gameOver) return;
    const handle = setInterval(() => {
      setGhosts(prevGhosts => prevGhosts.map((ghost) => {
        if (ghost.dead) return { ...ghost, x: 9, y: 7, dead: false }; // respawn at center
        let { x, y, dir } = ghost;
        // Try to move in current dir, else pick random
        let nx = x + DIRS[dir].dx;
        let ny = y + DIRS[dir].dy;
        if (
          nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS ||
          isWall(moveRef.current.maze, nx, ny)
        ) {
          // Pick a new direction (not reverse)
          let options = DIRS.map((_, i) => i).filter(i => i !== (dir ^ 1));
          let valid = options.filter(i => {
            let tx = x + DIRS[i].dx;
            let ty = y + DIRS[i].dy;
            return !isWall(moveRef.current.maze, tx, ty);
          });
          if (valid.length > 0) dir = valid[Math.floor(Math.random() * valid.length)];
          nx = x + DIRS[dir].dx;
          ny = y + DIRS[dir].dy;
        }
        // Tunnel wrap
        if (nx < 0) nx = COLS - 1;
        if (nx >= COLS) nx = 0;
        if (ny < 0) ny = ROWS - 1;
        if (ny >= ROWS) ny = 0;
        return { ...ghost, x: nx, y: ny, dir };
      }));
    }, 350);
    return () => clearInterval(handle);
  }, [win, gameOver]);

  // Power mode timer
  useEffect(() => {
    if (power > 0) {
      const t = setTimeout(() => setPower(power - 1), 100);
      return () => clearTimeout(t);
    }
  }, [power]);

  // Collision detection
  useEffect(() => {
    if (win || gameOver) return;
    ghosts.forEach((ghost, idx) => {
      if (ghost.x === pacman.x && ghost.y === pacman.y) {
        if (power > 0 && !ghost.dead) {
          // Eat ghost
          setGhosts(gs => gs.map((g, i) => i === idx ? { ...g, dead: true } : g));
          setScore(s => s + 200);
        } else if (!ghost.dead) {
          // Pac-Man dies
          setLives(l => {
            if (l <= 1) {
              setGameOver(true);
              return 0;
            }
            setPacman({ x: 9, y: 11, dir: 3 });
            return l - 1;
          });
        }
      }
    });
  }, [ghosts, pacman, power, win, gameOver]);



  // Start music when game starts
  useEffect(() => {
    if (!win && !musicPlaying) {
      playMusic();
    }
  }, [win]);

  // Render maze
  const renderMaze = () => (
    <div style={{ display: 'inline-block', background: 'black', padding: 8, borderRadius: 12 }}>
      {maze.map((row, y) => (
        <div key={y} style={{ display: 'flex' }}>
          {row.map((cell, x) => {
            // Draw ghosts
            const ghostHere = ghosts.find(g => g.x === x && g.y === y && !g.dead);
            let content = null;
            if (pacman.x === x && pacman.y === y) {
              content = <div style={{ width: 22, height: 22, borderRadius: '50%', background: power > 0 ? 'gold' : 'yellow', border: '2px solid #fff', margin: 1, position: 'relative' }} />;
            } else if (ghostHere) {
              content = <div style={{ width: 22, height: 22, borderRadius: '50%', background: GHOST_COLORS[ghostHere.color], border: '2px solid #fff', margin: 1, position: 'relative' }} />;
            } else if (cell === 1) {
              content = <div style={{ width: 22, height: 22, background: '#2222ff', borderRadius: 6, margin: 1 }} />;
            } else if (cell === 2) {
              content = <div style={{ width: 8, height: 8, background: 'white', borderRadius: '50%', margin: 7 }} />;
            } else if (cell === 3) {
              content = <div style={{ width: 14, height: 14, background: 'white', borderRadius: '50%', margin: 4, border: '2px solid gold' }} />;
            } else {
              content = <div style={{ width: 22, height: 22, margin: 1 }} />;
            }
            return <div key={x}>{content}</div>;
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', color: 'yellow', background: 'black', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.5)'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '2px' }}>🟡 Pac-Man</h1>
      <button onClick={toggleMusic} style={{ marginBottom: 16, marginLeft: 8, padding: '0.5rem 1.5rem', borderRadius: 8, border: 'none', background: musicPlaying ? 'yellow' : '#888', color: '#222', fontWeight: 'bold', cursor: 'pointer' }}>
        {musicPlaying ? 'Pause Music' : 'Play Music'}
      </button>
      <div style={{ marginBottom: '1.5rem', color: 'white', fontSize: '1.2rem' }}>Score: {score} &nbsp; | &nbsp; Lives: {lives}</div>
      {renderMaze()}
      {win && <div style={{ color: 'lime', fontWeight: 'bold', fontSize: '2rem', margin: '1.5rem' }}>You Win!</div>}
      {gameOver && <div style={{ color: 'red', fontWeight: 'bold', fontSize: '2rem', margin: '1.5rem' }}>Game Over</div>}
      <button
        onClick={onBack}
        style={{ padding: '1rem 2rem', background: 'yellow', color: 'black', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '2rem' }}
      >
        🎮 Back to Arcade
      </button>
      <div style={{ color: 'white', marginTop: '1rem', fontSize: '0.9rem' }}>
        Use <b>WASD</b> keys to move Pac-Man
      </div>
    </div>
  );
};

export default PacMan; 