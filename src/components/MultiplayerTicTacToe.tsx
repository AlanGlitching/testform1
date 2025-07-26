import React, { useState, useEffect, useRef } from 'react';
import styles from './TicTacToe.module.css';

interface MultiplayerTicTacToeProps {
  onBack?: () => void;
}

type Player = 'X' | 'O';
type BoardState = (Player | null)[];
type GameState = 'lobby' | 'waiting' | 'playing' | 'finished';

interface Game {
  id: string;
  board: BoardState;
  currentPlayer: Player;
  players: string[];
  winner: Player | 'draw' | null;
  gameStarted: boolean;
}



const MultiplayerTicTacToe: React.FC<MultiplayerTicTacToeProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [roomId, setRoomId] = useState<string>('');
  const [playerSymbol, setPlayerSymbol] = useState<Player>('X');
  const [game, setGame] = useState<Game | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Array<{ id: string; players: number }>>([]);
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<string>('Connecting to server...');
  const [isConnected, setIsConnected] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // For local development
  // const SERVER_URL = 'ws://192.168.31.164:3001';
  
  // For production deployment
  const SERVER_URL = 'wss://testform1-production.up.railway.app';

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(SERVER_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to server');
        setIsConnected(true);
        setStatus('Connected! Create or join a room to start playing.');
        fetchAvailableRooms();
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleServerMessage(message);
      };

      ws.onclose = () => {
        console.log('Disconnected from server');
        setIsConnected(false);
        setStatus('Disconnected from server. Reconnecting...');
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error. Please check if the server is running.');
      };
    } catch (error) {
      console.error('Failed to connect:', error);
      setError('Failed to connect to server. Please check if the server is running.');
    }
  };

  const handleServerMessage = (message: any) => {
    switch (message.type) {
      case 'connected':
        // Player ID received from server (not used in UI)
        break;
        
      case 'room_created':
        setRoomId(message.roomId);
        setPlayerSymbol(message.symbol);
        setGame(message.game);
        setGameState('waiting');
        setStatus(`Room created! Share this code with your friend: ${message.roomId}`);
        break;
        
      case 'player_joined':
        setGame(message.game);
        setGameState('playing');
        setStatus(`Player joined! Game started.`);
        break;
        
      case 'move_made':
        setGame(message.game);
        if (message.game.winner) {
          setGameState('finished');
          setStatus(message.game.winner === 'draw' ? "It's a draw!" : `Player ${message.game.winner} wins!`);
        } else {
          setStatus(`Player ${message.game.currentPlayer}'s turn`);
        }
        break;
        
      case 'game_reset':
        setGame(message.game);
        setGameState('playing');
        setStatus(`Game reset! Player ${message.game.currentPlayer}'s turn`);
        break;
        
      case 'player_disconnected':
        setGameState('waiting');
        setStatus('Other player disconnected. Waiting for them to reconnect...');
        break;
        
      case 'error':
        setError(message.message);
        setTimeout(() => setError(''), 5000);
        break;
    }
  };

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    sendMessage({
      type: 'create_room',
      roomId: newRoomId
    });
  };

  const joinRoom = (roomIdToJoin: string) => {
    sendMessage({
      type: 'join_room',
      roomId: roomIdToJoin
    });
  };

  const makeMove = (index: number) => {
    if (gameState !== 'playing' || !game || game.board[index] !== null) return;
    
    sendMessage({
      type: 'make_move',
      roomId: roomId,
      index: index
    });
  };

  const resetGame = () => {
    sendMessage({
      type: 'reset_game',
      roomId: roomId
    });
  };

  const leaveRoom = () => {
    if (roomId) {
      sendMessage({
        type: 'leave_room',
        roomId: roomId
      });
    }
    setGameState('lobby');
    setRoomId('');
    setGame(null);
    setStatus('Back to lobby. Create or join a room to start playing.');
  };

  const fetchAvailableRooms = async () => {
    try {
      // For local development
      // const response = await fetch('http://192.168.31.164:3001/api/rooms');
      
      // For production deployment
      const response = await fetch('https://testform1-production.up.railway.app/api/rooms');
      const rooms = await response.json();
      setAvailableRooms(rooms);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  const getStatusMessage = () => {
    if (gameState === 'waiting') {
      return `Waiting for opponent to join...\nRoom Code: ${roomId}`;
    } else if (gameState === 'playing' && game) {
      if (game.winner) {
        return game.winner === 'draw' ? "It's a Draw!" : `Player ${game.winner} Wins!`;
      } else {
        return `Player ${game.currentPlayer}'s Turn`;
      }
    } else if (gameState === 'finished' && game) {
      return game.winner === 'draw' ? "It's a Draw!" : `Player ${game.winner} Wins!`;
    }
    return status;
  };

  const renderCell = (index: number) => {
    if (!game) return null;
    
    const value = game.board[index];
    const isWinningCell = game.winner && game.winner !== 'draw' && 
      [0, 1, 2, 3, 4, 5, 6, 7, 8].some(combination => 
        combination === index && game.board[combination] === game.winner
      );

    return (
      <button
        key={index}
        className={`${styles.cell} ${isWinningCell ? styles.winningCell : ''}`}
        onClick={() => makeMove(index)}
        disabled={gameState !== 'playing' || !!value || game.currentPlayer !== playerSymbol}
      >
        {value && (
          <span className={`${styles.player} ${value === 'X' ? styles.playerX : styles.playerO}`}>
            {value}
          </span>
        )}
      </button>
    );
  };

  const renderLobby = () => (
    <div className={styles.lobby}>
      <h2>🎮 Multiplayer Tic Tac Toe</h2>
      <p>Play with friends across different devices!</p>
      
      <div className={styles.connectionStatus}>
        <div className={`${styles.statusIndicator} ${isConnected ? styles.connected : styles.disconnected}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>

      <div className={styles.roomActions}>
        <button className={styles.createButton} onClick={createRoom}>
          🏠 Create New Room
        </button>
        
        <div className={styles.joinSection}>
          <h3>Join Existing Room:</h3>
          <div className={styles.roomList}>
            {availableRooms.length > 0 ? (
              availableRooms.map(room => (
                <button
                  key={room.id}
                  className={styles.roomButton}
                  onClick={() => joinRoom(room.id)}
                >
                  Room {room.id} ({room.players}/2 players)
                </button>
              ))
            ) : (
              <p>No available rooms. Create one!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGame = () => (
    <div className={styles.gameContainer}>
      <div className={styles.gameHeader}>
        <h2>⭕ Multiplayer Tic Tac Toe</h2>
        <div className={styles.roomInfo}>
          <span>Room: {roomId}</span>
          <span>You are: {playerSymbol}</span>
        </div>
      </div>

      <div className={styles.gameInfo}>
        <div className={styles.status}>{getStatusMessage()}</div>
      </div>

      <div className={styles.gameBoard}>
        <div className={styles.board}>
          {Array(9).fill(null).map((_, index) => renderCell(index))}
        </div>
      </div>

      <div className={styles.controls}>
        {gameState === 'finished' && (
          <button className={styles.resetButton} onClick={resetGame}>
            🎯 Play Again
          </button>
        )}
        <button className={styles.leaveButton} onClick={leaveRoom}>
          🚪 Leave Room
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🌐 Multiplayer Tic Tac Toe</h1>
        <button className={styles.backButton} onClick={onBack}>
          🎮 Back to Arcade
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          {error.includes('Connection error') && (
            <div className={styles.deploymentInfo}>
              <h4>🌐 To play multiplayer online:</h4>
              <ol>
                <li>Deploy the server to Railway (see DEPLOYMENT_GUIDE.md)</li>
                <li>Update the SERVER_URL in this component</li>
                <li>Redeploy the frontend to Netlify</li>
              </ol>
              <p><strong>For local testing:</strong> Make sure the server is running on your computer.</p>
            </div>
          )}
        </div>
      )}

      {gameState === 'lobby' ? renderLobby() : renderGame()}

      <div className={styles.instructions}>
        <h3>How to Play Multiplayer:</h3>
        <ul>
          <li>Create a room and share the room code with your friend</li>
          <li>Your friend can join using the room code</li>
          <li>Play in real-time across different devices!</li>
          <li>Make sure the server is running on localhost:3001</li>
        </ul>
      </div>
    </div>
  );
};

export default MultiplayerTicTacToe; 