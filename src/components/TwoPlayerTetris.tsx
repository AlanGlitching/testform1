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

interface PlayerState {
  board: any[][];
  current: any;
  next: any;
  score: number;
  lines: number;
  level: number;
  gameState: 'playing' | 'paused' | 'gameover';
}

interface TwoPlayerTetrisProps {
  onBack?: () => void;
}

const TwoPlayerTetris = ({ onBack }: TwoPlayerTetrisProps) => {
  const [players, setPlayers] = useState<[PlayerState, PlayerState]>(() => [
    {
      board: Array(BOARD_HEIGHT).fill(0).map(() => Array(BOARD_WIDTH).fill(0)),
      current: randomTetromino(),
      next: randomTetromino(),
      score: 0,
      lines: 0,
      level: 1,
      gameState: 'playing' as const
    },
    {
      board: Array(BOARD_HEIGHT).fill(0).map(() => Array(BOARD_WIDTH).fill(0)),
      current: randomTetromino(),
      next: randomTetromino(),
      score: 0,
      lines: 0,
      level: 1,
      gameState: 'playing' as const
    }
  ]);

  const [gameState, setGameState] = useState<'start' | 'playing' | 'paused' | 'gameover'>('start');
  const [winner, setWinner] = useState<number | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const dropRefs = useRef<[NodeJS.Timeout | null, NodeJS.Timeout | null]>([null, null]);
  const repeatRefs = useRef<[{ [key: string]: NodeJS.Timeout | null }, { [key: string]: NodeJS.Timeout | null }]>([{}, {}]);
  const dasRefs = useRef<[{ [key: string]: NodeJS.Timeout | null }, { [key: string]: NodeJS.Timeout | null }]>([{}, {}]);

  // Player 1 controls: WASD + Space
  const player1Keys = {
    left: ['a', 'A'],
    right: ['d', 'D'],
    down: ['s', 'S'],
    rotate: ['w', 'W'],
    hardDrop: [' ']
  };

  // Player 2 controls: Arrow keys + Enter
  const player2Keys = {
    left: ['ArrowLeft'],
    right: ['ArrowRight'],
    down: ['ArrowDown'],
    rotate: ['ArrowUp'],
    hardDrop: ['Enter']
  };

  // Start or restart the game
  function startGame() {
    setPlayers([
      {
        board: Array(BOARD_HEIGHT).fill(0).map(() => Array(BOARD_WIDTH).fill(0)),
        current: randomTetromino(),
        next: randomTetromino(),
        score: 0,
        lines: 0,
        level: 1,
        gameState: 'playing'
      },
      {
        board: Array(BOARD_HEIGHT).fill(0).map(() => Array(BOARD_WIDTH).fill(0)),
        current: randomTetromino(),
        next: randomTetromino(),
        score: 0,
        lines: 0,
        level: 1,
        gameState: 'playing'
      }
    ]);
    setGameState('playing');
    setWinner(null);
    playSound('levelup');
    if (!musicPlaying) {
      playMusic();
    }
  }

  // Create new audio instance on play
  const playMusic = () => {
    const audio = new Audio('/Original Tetris theme (Tetris Soundtrack).mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().then(() => {
      setAudioInstance(audio);
      setMusicPlaying(true);
    }).catch((error) => {
      console.error('Failed to play audio:', error);
    });
  };

  const stopMusic = () => {
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

  // Sound effect functions
  const playSound = (soundName: string) => {
    if (!soundEnabled) return;
    
    const audio = new Audio();
    audio.volume = 0.4;
    
    // Create different sound effects using Web Audio API for better quality
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    let frequency = 440;
    let duration = 0.1;
    
    switch (soundName) {
      case 'move':
        frequency = 800;
        duration = 0.05;
        break;
      case 'rotate':
        frequency = 1000;
        duration = 0.08;
        break;
      case 'drop':
        frequency = 200;
        duration = 0.15;
        break;
      case 'line':
        frequency = 1200;
        duration = 0.2;
        break;
      case 'tetris':
        frequency = 1500;
        duration = 0.3;
        break;
      case 'gameover':
        frequency = 150;
        duration = 0.5;
        break;
      case 'levelup':
        frequency = 800;
        duration = 0.25;
        break;
    }
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  // Initialize high score and stats from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('tetrisHighScore');
    if (savedHighScore) {
      // Handle high score initialization if needed
    }
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
        audioInstance.currentTime = 0;
      }
    };
  }, [audioInstance]);

  // Game logic functions (declare these first to avoid hoisting issues)
  function move(dx: number, playerIndex: number, dy: number) {
    if (gameState !== 'playing' || players[playerIndex].gameState !== 'playing') return false;
    
    const player = players[playerIndex];
    const moved = { ...player.current, x: player.current.x + dx, y: player.current.y + dy };
    
    if (!checkCollision(player.board, moved)) {
      setPlayers(prev => {
        const newPlayers = [...prev] as [PlayerState, PlayerState];
        newPlayers[playerIndex] = { ...newPlayers[playerIndex], current: moved };
        return newPlayers;
      });
      if (dx !== 0) playSound('move');
      if (dy === 1) playSound('drop');
      return true;
    } else if (dy === 1) {
      // Piece landed
      playSound('drop');
      const merged = merge(player.board, player.current);
      const { newBoard, cleared } = clearLines(merged);
      
      // Enhanced scoring system
      const linePoints = [0, 100, 300, 500, 800];
      const newScore = player.score + linePoints[cleared] * player.level;
      const newLines = player.lines + cleared;
      const newLevel = Math.floor(newLines / 10) + 1;
      
      // Play sound effects for line clearing
      if (cleared > 0) {
        if (cleared === 4) {
          playSound('tetris');
        } else {
          playSound('line');
        }
      }
      
      // Play level up sound
      if (newLevel > player.level) {
        playSound('levelup');
      }
      
      const nextTetro = { ...player.next, x: 3, y: 0 };
      if (checkCollision(newBoard, nextTetro)) {
        // Game over for this player
        setPlayers(prev => {
          const newPlayers = [...prev] as [PlayerState, PlayerState];
          newPlayers[playerIndex] = { 
            ...newPlayers[playerIndex], 
            gameState: 'gameover' as const,
            score: newScore,
            lines: newLines,
            level: newLevel
          };
          return newPlayers;
        });
        
              // End game for both players immediately
      const otherPlayerIndex = playerIndex === 0 ? 1 : 0;
      setPlayers(prev => {
        const newPlayers = [...prev] as [PlayerState, PlayerState];
        newPlayers[otherPlayerIndex] = { 
          ...newPlayers[otherPlayerIndex], 
          gameState: 'gameover' as const
        };
        return newPlayers;
      });
      
      // Determine winner based on final scores
      const player0FinalScore = playerIndex === 0 ? newScore : players[0].score;
      const player1FinalScore = playerIndex === 1 ? newScore : players[1].score;
      
      if (player0FinalScore > player1FinalScore) {
        setWinner(0);
      } else if (player1FinalScore > player0FinalScore) {
        setWinner(1);
      } else {
        setWinner(-1); // Tie
      }
      
      setGameState('gameover');
      playSound('gameover');
      } else {
        setPlayers(prev => {
          const newPlayers = [...prev] as [PlayerState, PlayerState];
          newPlayers[playerIndex] = { 
            ...newPlayers[playerIndex], 
            board: newBoard,
            current: nextTetro,
            next: randomTetromino(),
            score: newScore,
            lines: newLines,
            level: newLevel
          };
          return newPlayers;
        });
        playSound('move'); // Piece spawn sound
      }
    }
    return false;
  }

  function rotateTetro(playerIndex: number) {
    if (gameState !== 'playing' || players[playerIndex].gameState !== 'playing') return;
    const player = players[playerIndex];
    const rotated = { ...player.current, shape: rotate(player.current.shape) };
    if (!checkCollision(player.board, rotated)) {
      setPlayers(prev => {
        const newPlayers = [...prev] as [PlayerState, PlayerState];
        newPlayers[playerIndex] = { ...newPlayers[playerIndex], current: rotated };
        return newPlayers;
      });
      playSound('rotate');
    }
  }

  function hardDrop(playerIndex: number) {
    if (gameState !== 'playing' || players[playerIndex].gameState !== 'playing') return;
    const player = players[playerIndex];
    let dropped = { ...player.current };
    while (!checkCollision(player.board, { ...dropped, y: dropped.y + 1 })) {
      dropped.y++;
    }
    playSound('drop');
    
    // Lock the piece in place and spawn next
    const merged = merge(player.board, dropped);
    const { newBoard, cleared } = clearLines(merged);
    
    // Enhanced scoring system
    const linePoints = [0, 100, 300, 500, 800];
    const newScore = player.score + linePoints[cleared] * player.level;
    const newLines = player.lines + cleared;
    const newLevel = Math.floor(newLines / 10) + 1;
    
    // Play sound effects for line clearing
    if (cleared > 0) {
      if (cleared === 4) {
        playSound('tetris');
      } else {
        playSound('line');
      }
    }
    
    // Play level up sound
    if (newLevel > player.level) {
      playSound('levelup');
    }
    
    const nextTetro = { ...player.next, x: 3, y: 0 };
    if (checkCollision(newBoard, nextTetro)) {
      // Game over for this player
      setPlayers(prev => {
        const newPlayers = [...prev] as [PlayerState, PlayerState];
        newPlayers[playerIndex] = { 
          ...newPlayers[playerIndex], 
          gameState: 'gameover' as const,
          score: newScore,
          lines: newLines,
          level: newLevel
        };
        return newPlayers;
      });
      
      // End game for both players immediately
      const otherPlayerIndex = playerIndex === 0 ? 1 : 0;
      setPlayers(prev => {
        const newPlayers = [...prev] as [PlayerState, PlayerState];
        newPlayers[otherPlayerIndex] = { 
          ...newPlayers[otherPlayerIndex], 
          gameState: 'gameover' as const
        };
        return newPlayers;
      });
      
      // Determine winner based on final scores
      const player0FinalScore = playerIndex === 0 ? newScore : players[0].score;
      const player1FinalScore = playerIndex === 1 ? newScore : players[1].score;
      
      if (player0FinalScore > player1FinalScore) {
        setWinner(0);
      } else if (player1FinalScore > player0FinalScore) {
        setWinner(1);
      } else {
        setWinner(-1); // Tie
      }
      
      setGameState('gameover');
      playSound('gameover');
    } else {
      setPlayers(prev => {
        const newPlayers = [...prev] as [PlayerState, PlayerState];
        newPlayers[playerIndex] = { 
          ...newPlayers[playerIndex], 
          board: newBoard,
          current: nextTetro,
          next: randomTetromino(),
          score: newScore,
          lines: newLines,
          level: newLevel
        };
        
        // Add garbage lines to the other player when clearing 2 or more lines
        if (cleared >= 2) {
          const otherPlayerIndex = playerIndex === 0 ? 1 : 0;
          const otherPlayer = newPlayers[otherPlayerIndex];
          
          // Add garbage lines to the bottom of the other player's board
          const garbageLines = cleared;
          const otherBoard = [...otherPlayer.board];
          
          // Remove lines from the top and add garbage lines at the bottom
          for (let i = 0; i < garbageLines; i++) {
            otherBoard.shift(); // Remove top line
            const garbageLine = Array(BOARD_WIDTH).fill(0).map(() => {
              // Create a garbage line with one random empty cell
              const emptyCell = Math.floor(Math.random() * BOARD_WIDTH);
              return Array(BOARD_WIDTH).fill('#666').map((_, index) => 
                index === emptyCell ? 0 : '#666'
              );
            });
            otherBoard.push(garbageLine[0]); // Add garbage line at bottom
          }
          
          newPlayers[otherPlayerIndex] = {
            ...otherPlayer,
            board: otherBoard
          };
        }
        
        return newPlayers;
      });
      playSound('move'); // Piece spawn sound
    }
  }

  // Drop logic for both players
  useEffect(() => {
    if (gameState !== 'playing') return;

    const dropInterval = 500;
    
    dropRefs.current[0] = setInterval(() => {
      if (players[0].gameState === 'playing') {
        move(0, 0, 1);
      }
    }, dropInterval);
    
    dropRefs.current[1] = setInterval(() => {
      if (players[1].gameState === 'playing') {
        move(0, 1, 1);
      }
    }, dropInterval);

    return () => {
      dropRefs.current.forEach(ref => {
        if (ref) clearInterval(ref);
      });
    };
  }, [gameState, players]);

  function togglePause() {
    setGameState(state => {
      if (state === 'playing') {
        if (audioInstance) {
          audioInstance.pause();
        }
        playSound('move');
        return 'paused';
      } else if (state === 'paused') {
        if (audioInstance && musicPlaying) {
          audioInstance.play();
        }
        playSound('move');
        return 'playing';
      }
      return state;
    });
  }

  // Keyboard controls for both players
  useEffect(() => {
    if (gameState === 'gameover' || gameState === 'start') return;

    const DAS = 200;
    const ARR = 40;

    function startDAS(playerIndex: number, key: string, action: () => void) {
      if (repeatRefs.current[playerIndex][key] || dasRefs.current[playerIndex][key]) return;
      action();
      dasRefs.current[playerIndex][key] = setTimeout(() => {
        repeatRefs.current[playerIndex][key] = setInterval(action, ARR);
      }, DAS);
    }

    function stopDAS(playerIndex: number, key: string) {
      if (dasRefs.current[playerIndex][key]) {
        clearTimeout(dasRefs.current[playerIndex][key]!);
        dasRefs.current[playerIndex][key] = null;
      }
      if (repeatRefs.current[playerIndex][key]) {
        clearInterval(repeatRefs.current[playerIndex][key]!);
        repeatRefs.current[playerIndex][key] = null;
      }
    }

    const handleDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      // Player 1 controls
      if (player1Keys.left.includes(e.key)) {
        e.preventDefault();
        startDAS(0, 'left', () => move(-1, 0, 0));
      }
      if (player1Keys.right.includes(e.key)) {
        e.preventDefault();
        startDAS(0, 'right', () => move(1, 0, 0));
      }
      if (player1Keys.down.includes(e.key)) {
        e.preventDefault();
        startDAS(0, 'down', () => move(0, 0, 1));
      }
      if (player1Keys.rotate.includes(e.key)) {
        e.preventDefault();
        rotateTetro(0);
      }
      if (player1Keys.hardDrop.includes(e.key)) {
        e.preventDefault();
        hardDrop(0);
      }

      // Player 2 controls
      if (player2Keys.left.includes(e.key)) {
        e.preventDefault();
        startDAS(1, 'left', () => move(-1, 1, 0));
      }
      if (player2Keys.right.includes(e.key)) {
        e.preventDefault();
        startDAS(1, 'right', () => move(1, 1, 0));
      }
      if (player2Keys.down.includes(e.key)) {
        e.preventDefault();
        startDAS(1, 'down', () => move(0, 1, 1));
      }
      if (player2Keys.rotate.includes(e.key)) {
        e.preventDefault();
        rotateTetro(1);
      }
      if (player2Keys.hardDrop.includes(e.key)) {
        e.preventDefault();
        hardDrop(1);
      }

      // Pause for both players
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePause();
      }
    };

    const handleUp = (e: KeyboardEvent) => {
      // Player 1
      if (player1Keys.left.includes(e.key)) stopDAS(0, 'left');
      if (player1Keys.right.includes(e.key)) stopDAS(0, 'right');
      if (player1Keys.down.includes(e.key)) stopDAS(0, 'down');

      // Player 2
      if (player2Keys.left.includes(e.key)) stopDAS(1, 'left');
      if (player2Keys.right.includes(e.key)) stopDAS(1, 'right');
      if (player2Keys.down.includes(e.key)) stopDAS(1, 'down');
    };

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);

    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
      repeatRefs.current.forEach(refs => {
        Object.values(refs).forEach(timer => timer && clearInterval(timer));
      });
      dasRefs.current.forEach(refs => {
        Object.values(refs).forEach(timer => timer && clearTimeout(timer));
      });
      repeatRefs.current = [{}, {}];
      dasRefs.current = [{}, {}];
    };
  }, [gameState, players]);

  function renderBoard(playerIndex: number) {
    const player = players[playerIndex];
    // Merge current piece for display
    const display = player.board.map(row => [...row]);
    const { shape, x, y, color } = player.current;
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
              width: 20,
              height: 20,
              background: cell ? cell : '#222',
              border: '1px solid #444',
              borderRadius: 3,
              margin: 0.5
            }}
          />
        ))}
      </div>
    ));
  }

  function renderPlayerInfo(playerIndex: number) {
    const player = players[playerIndex];
    const playerName = playerIndex === 0 ? 'Player 1' : 'Player 2';
    const playerColor = playerIndex === 0 ? '#00f0f0' : '#ff6b6b';
    
    return (
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 16,
        padding: '1rem',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '8px',
        border: `2px solid ${playerColor}`
      }}>
        <div style={{ 
          fontSize: '1.2rem', 
          fontWeight: 'bold', 
          color: playerColor,
          marginBottom: 8
        }}>
          {playerName}
        </div>
        <div style={{ marginBottom: 4 }}>
          <b>Score:</b> {player.score}
        </div>
        <div style={{ marginBottom: 4 }}>
          <b>Lines:</b> {player.lines}
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Level:</b> {player.level}
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Next:</b>
          <div style={{ marginTop: 4 }}>
            {player.next.shape.map((row: any[], y: number) => (
              <div key={y} style={{ display: 'flex', justifyContent: 'center' }}>
                {row.map((cell: any, x: number) => (
                  <div key={x} style={{ 
                    width: 16, 
                    height: 16, 
                    background: cell ? player.next.color : 'transparent', 
                    border: '1px solid #888', 
                    borderRadius: 2, 
                    margin: 0.5 
                  }} />
                ))}
              </div>
            ))}
          </div>
        </div>
        {player.gameState === 'gameover' && (
          <div style={{ 
            color: '#ff4444', 
            fontWeight: 'bold', 
            fontSize: '0.9rem',
            marginTop: 8
          }}>
            GAME OVER
          </div>
        )}
      </div>
    );
  }

  // Overlay for start, pause, and game over
  function renderOverlay() {
    if (gameState === 'start') {
      return (
        <div style={overlayStyle}>
          <div style={popupStyle}>
            <h2 style={{ marginBottom: 16 }}>Two Player Tetris</h2>
            <div style={{ marginBottom: 16, fontSize: '0.9rem', color: '#ccc' }}>
              <div>Player 1: WASD + Space</div>
              <div>Player 2: Arrow Keys + Enter</div>
            </div>
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
      let winnerText = '';
      if (winner === 0) {
        winnerText = 'Player 1 Wins! 🎉';
      } else if (winner === 1) {
        winnerText = 'Player 2 Wins! 🎉';
      } else if (winner === -1) {
        winnerText = "It's a Tie! 🤝";
      }
      
      return (
        <div style={overlayStyle}>
          <div style={popupStyle}>
            <h2 style={{ marginBottom: 16, color: winner === -1 ? '#ffaa00' : '#00ff00' }}>
              {winnerText}
            </h2>
            <div style={{ marginBottom: 16 }}>
              <div>Player 1 Score: {players[0].score}</div>
              <div>Player 2 Score: {players[1].score}</div>
            </div>
            <button onClick={startGame} style={buttonStyle}>Play Again</button>
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
      <h1 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>Two Player Tetris</h1>
      <button onClick={onBack} style={{ marginBottom: 16, padding: '0.5rem 1.5rem', borderRadius: 8, border: 'none', background: '#444', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Back</button>
      <button onClick={startGame} style={{ marginBottom: 16, marginLeft: 8, padding: '0.5rem 1.5rem', borderRadius: 8, border: 'none', background: '#00f0f0', color: '#222', fontWeight: 'bold', cursor: 'pointer' }}>Restart</button>
      <button
        onClick={toggleMusic}
        style={{ marginBottom: 16, marginLeft: 8, padding: '0.5rem 1.5rem', borderRadius: 8, border: 'none', background: musicPlaying ? '#00f0f0' : '#888', color: '#222', fontWeight: 'bold', cursor: 'pointer' }}
      >
        {musicPlaying ? 'Pause Music' : 'Play Music'}
      </button>
      <button
        onClick={toggleSound}
        style={{ marginBottom: 16, marginLeft: 8, padding: '0.5rem 1.5rem', borderRadius: 8, border: 'none', background: soundEnabled ? '#00f0f0' : '#888', color: '#222', fontWeight: 'bold', cursor: 'pointer' }}
      >
        {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
      </button>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flex: 1, justifyContent: 'center' }}>
        {/* Player 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {renderPlayerInfo(0)}
          <div style={{ marginTop: 8 }}>
            {renderBoard(0)}
          </div>
        </div>

        {/* VS indicator */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '300px',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#00f0f0'
        }}>
          VS
        </div>

        {/* Player 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {renderPlayerInfo(1)}
          <div style={{ marginTop: 8 }}>
            {renderBoard(1)}
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: 8, 
        color: '#ccc', 
        fontSize: '0.7rem', 
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <div style={{ marginBottom: 4 }}>
          <b>Player 1:</b> WASD Move & Rotate | Space Hard Drop
        </div>
        <div style={{ marginBottom: 4 }}>
          <b>Player 2:</b> Arrow Keys Move & Rotate | Enter Hard Drop
        </div>
        <div>
          <b>Both:</b> P - Pause/Resume
        </div>
      </div>
    </div>
  );
};

export default TwoPlayerTetris; 