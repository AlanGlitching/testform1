import React, { useState, useEffect, useRef } from 'react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Tetromino shapes and colors
const TETROMINOES = [
  { shape: [[1, 1, 1, 1]], color: '#00f0f0' }, // I
  { shape: [[1, 1], [1, 1]], color: '#f0f000' }, // O
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0' }, // T
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#00f000' }, // S
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#f00000' }, // Z
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000f0' }, // J
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#f0a000' }, // L
];

function randomTetromino() {
  const idx = Math.floor(Math.random() * TETROMINOES.length);
  return { ...TETROMINOES[idx], x: 3, y: 0, rotation: 0 };
}

function rotate(matrix: number[][]): number[][] {
  return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

function checkCollision(board: any[][], tetro: any) {
  const { shape, x, y } = tetro;
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const nx = x + col;
        const ny = y + row;
        if (
          nx < 0 || nx >= BOARD_WIDTH ||
          ny >= BOARD_HEIGHT ||
          (ny >= 0 && board[ny][nx])
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

function merge(board: any[][], tetro: any) {
  const newBoard = board.map(row => [...row]);
  const { shape, x, y, color } = tetro;
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const nx = x + col;
        const ny = y + row;
        if (ny >= 0 && ny < BOARD_HEIGHT && nx >= 0 && nx < BOARD_WIDTH) {
          newBoard[ny][nx] = color;
        }
      }
    }
  }
  return newBoard;
}

function clearLines(board: any[][]) {
  let cleared = 0;
  const newBoard = board.filter(row => {
    if (row.every(cell => cell)) {
      cleared++;
      return false;
    }
    return true;
  });
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(0));
  }
  return { newBoard, cleared };
}

const Tetris = ({ onBack }: { onBack?: () => void }) => {
  const [board, setBoard] = useState(() => Array(BOARD_HEIGHT).fill(0).map(() => Array(BOARD_WIDTH).fill(0)));
  const [current, setCurrent] = useState(randomTetromino());
  const [next, setNext] = useState(randomTetromino());
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'paused' | 'gameover'>('start');
  const dropRef = useRef<any>();
  const repeatRef = useRef<{ [key: string]: NodeJS.Timeout | null }>({});
  const dasRef = useRef<{ [key: string]: NodeJS.Timeout | null }>({});
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);

  // Start or restart the game
  function startGame() {
    setBoard(Array(BOARD_HEIGHT).fill(0).map(() => Array(BOARD_WIDTH).fill(0)));
    setCurrent(randomTetromino());
    setNext(randomTetromino());
    setScore(0);
    setGameState('playing');
    setMusicPlaying(true);
  }

  // Create new audio instance on play
  const playMusic = () => {
    console.log('Creating new audio instance...');
    const audio = new Audio('/tetris-theme.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().then(() => {
      console.log('Audio started successfully with new instance');
      setAudioInstance(audio);
      setMusicPlaying(true);
    }).catch((error) => {
      console.error('Failed to play audio:', error);
    });
  };

  const stopMusic = () => {
    console.log('Stopping audio...');
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
      setAudioInstance(null);
    }
    setMusicPlaying(false);
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

  // Drop logic
  useEffect(() => {
    if (gameState !== 'playing') return;
    dropRef.current = setInterval(() => {
      move(0, 1);
    }, 500);
    return () => clearInterval(dropRef.current);
  }, [gameState, current, board]);

  // Keyboard controls with DAS/ARR and pause
  useEffect(() => {
    if (gameState === 'gameover' || gameState === 'start') return;
    const DAS = 200;
    const ARR = 40;
    const keys = {
      left: ['a', 'A', 'ArrowLeft'],
      right: ['d', 'D', 'ArrowRight'],
      down: ['s', 'S', 'ArrowDown']
    };
    function startDAS(key: string, action: () => void) {
      if (repeatRef.current[key] || dasRef.current[key]) return;
      action();
      dasRef.current[key] = setTimeout(() => {
        repeatRef.current[key] = setInterval(action, ARR);
      }, DAS);
    }
    function stopDAS(key: string) {
      if (dasRef.current[key]) {
        clearTimeout(dasRef.current[key]!);
        dasRef.current[key] = null;
      }
      if (repeatRef.current[key]) {
        clearInterval(repeatRef.current[key]!);
        repeatRef.current[key] = null;
      }
    }
    const moveLeft = () => move(-1, 0);
    const moveRight = () => move(1, 0);
    const moveDown = () => move(0, 1);
    const handleDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (keys.left.includes(e.key)) startDAS('left', moveLeft);
      if (keys.right.includes(e.key)) startDAS('right', moveRight);
      if (keys.down.includes(e.key)) startDAS('down', moveDown);
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') rotateTetro();
      if (e.key === ' ') hardDrop();
      if (e.key === 'p' || e.key === 'P') togglePause();
    };
    const handleUp = (e: KeyboardEvent) => {
      if (keys.left.includes(e.key)) stopDAS('left');
      if (keys.right.includes(e.key)) stopDAS('right');
      if (keys.down.includes(e.key)) stopDAS('down');
    };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
      Object.values(repeatRef.current).forEach(timer => timer && clearInterval(timer));
      Object.values(dasRef.current).forEach(timer => timer && clearTimeout(timer));
      repeatRef.current = {};
      dasRef.current = {};
    };
  }, [gameState, current, board]);

  // Music control: play/pause with game state
  useEffect(() => {
    if (!audioRef.current) return;
    if (gameState === 'playing' && musicPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [gameState, musicPlaying]);

  function move(dx: number, dy: number) {
    if (gameState !== 'playing') return false;
    const moved = { ...current, x: current.x + dx, y: current.y + dy };
    if (!checkCollision(board, moved)) {
      setCurrent(moved);
      return true;
    } else if (dy === 1) {
      // Piece landed
      const merged = merge(board, current);
      const { newBoard, cleared } = clearLines(merged);
      setScore(s => s + cleared * 100);
      const nextTetro = { ...next, x: 3, y: 0 };
      if (checkCollision(newBoard, nextTetro)) {
        setGameState('gameover');
      } else {
        setBoard(newBoard);
        setCurrent(nextTetro);
        setNext(randomTetromino());
      }
    }
    return false;
  }

  function rotateTetro() {
    if (gameState !== 'playing') return;
    const rotated = { ...current, shape: rotate(current.shape) };
    if (!checkCollision(board, rotated)) {
      setCurrent(rotated);
    }
  }

  function hardDrop() {
    if (gameState !== 'playing') return;
    let dropped = { ...current };
    while (!checkCollision(board, { ...dropped, y: dropped.y + 1 })) {
      dropped.y++;
    }
    // Lock the piece in place and spawn next
    const merged = merge(board, dropped);
    const { newBoard, cleared } = clearLines(merged);
    setScore(s => s + cleared * 100);
    const nextTetro = { ...next, x: 3, y: 0 };
    if (checkCollision(newBoard, nextTetro)) {
      setGameState('gameover');
    } else {
      setBoard(newBoard);
      setCurrent(nextTetro);
      setNext(randomTetromino());
    }
  }

  function togglePause() {
    setGameState(state => (state === 'playing' ? 'paused' : state === 'paused' ? 'playing' : state));
  }

  function renderBoard() {
    // Merge current piece for display
    const display = board.map(row => [...row]);
    const { shape, x, y, color } = current;
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const nx = x + col;
          const ny = y + row;
          if (ny >= 0 && ny < BOARD_HEIGHT && nx >= 0 && nx < BOARD_WIDTH) {
            display[ny][nx] = color;
          }
        }
      }
    }
    return display.map((row, y) => (
      <div key={y} style={{ display: 'flex' }}>
        {row.map((cell, x) => (
          <div
            key={x}
            style={{
              width: 24,
              height: 24,
              background: cell ? cell : '#222',
              border: '1px solid #444',
              borderRadius: 4,
              margin: 0.5
            }}
          />
        ))}
      </div>
    ));
  }

  // Overlay for start, pause, and game over
  function renderOverlay() {
    if (gameState === 'start') {
      return (
        <div style={overlayStyle}>
          <div style={popupStyle}>
            <h2 style={{ marginBottom: 16 }}>Tetris</h2>
            <button onClick={startGame} style={buttonStyle}>Start Game</button>
          </div>
        </div>
      );
    }
    if (gameState === 'paused') {
      return (
        <div style={overlayStyle}>
          <div style={popupStyle}>
            <h2 style={{ marginBottom: 16 }}>Paused</h2>
            <button onClick={togglePause} style={buttonStyle}>Resume</button>
          </div>
        </div>
      );
    }
    if (gameState === 'gameover') {
      return (
        <div style={overlayStyle}>
          <div style={popupStyle}>
            <h2 style={{ marginBottom: 16, color: 'red' }}>Game Over</h2>
            <div style={{ marginBottom: 16 }}>Score: {score}</div>
            <button onClick={startGame} style={buttonStyle}>Restart</button>
          </div>
        </div>
      );
    }
    return null;
  }

  // Overlay styles
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };
  const popupStyle: React.CSSProperties = {
    background: '#222',
    color: 'white',
    borderRadius: 16,
    padding: '2rem 3rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    textAlign: 'center',
    minWidth: 260
  };
  const buttonStyle: React.CSSProperties = {
    background: '#00f0f0',
    color: '#222',
    border: 'none',
    borderRadius: 8,
    padding: '0.75rem 2rem',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    cursor: 'pointer',
    marginTop: 8
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)', color: 'white', padding: 24, position: 'relative' }}>
      {renderOverlay()}
      <audio ref={audioRef} src="/tetris-theme.mp3" loop preload="auto" muted />
      <h1 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>Tetris</h1>
      <button onClick={onBack} style={{ marginBottom: 16, padding: '0.5rem 1.5rem', borderRadius: 8, border: 'none', background: '#444', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Back</button>
      <button onClick={startGame} style={{ marginBottom: 16, marginLeft: 8, padding: '0.5rem 1.5rem', borderRadius: 8, border: 'none', background: '#00f0f0', color: '#222', fontWeight: 'bold', cursor: 'pointer' }}>Restart</button>
      <button
        onClick={() => {
          if (!musicPlaying) {
            playMusic();
          } else {
            stopMusic();
          }
        }}
        style={{ marginBottom: 16, marginLeft: 8, padding: '0.5rem 1.5rem', borderRadius: 8, border: 'none', background: musicPlaying ? '#00f0f0' : '#888', color: '#222', fontWeight: 'bold', cursor: 'pointer' }}
      >
        {musicPlaying ? 'Pause Music' : 'Play Music'}
      </button>
      <div style={{ display: 'flex', gap: 32 }}>
        <div>{renderBoard()}</div>
        <div style={{ minWidth: 120 }}>
          <div style={{ marginBottom: 24 }}>
            <b>Score:</b> {score}
          </div>
          <div style={{ marginBottom: 24 }}>
            <b>Next:</b>
            <div style={{ marginTop: 8 }}>
              {next.shape.map((row, y) => (
                <div key={y} style={{ display: 'flex' }}>
                  {row.map((cell, x) => (
                    <div key={x} style={{ width: 20, height: 20, background: cell ? next.color : 'transparent', border: '1px solid #888', borderRadius: 3, margin: 0.5 }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 32, color: '#ccc', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 16 }}>
        Controls: <b>A/D</b> or <b>←/→</b> Move &nbsp; <b>W</b> or <b>↑</b> Rotate &nbsp; <b>S</b> or <b>↓</b> Soft Drop &nbsp; <b>Space</b> Hard Drop
        <button onClick={togglePause} style={{ marginLeft: 16, background: '#00f0f0', color: '#222', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>Pause</button>
      </div>
    </div>
  );
};

export default Tetris; 