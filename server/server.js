import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

// Railway specific configuration
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors({
  origin: [
    'https://testform1-production.up.railway.app',
    'http://localhost:5173', 
    'http://localhost:3000', 
    'https://*.netlify.app',
    'https://testform1.netlify.app',
    'https://testform1-production.netlify.app'
  ],
  credentials: true
}));
app.use(express.json());

// Game state management
const games = new Map();
const players = new Map();

// Game logic
const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6] // Diagonals
];

function checkWinner(board) {
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  
  if (board.every(cell => cell !== null)) {
    return 'draw';
  }
  
  return null;
}

function createGame(roomId) {
  return {
    id: roomId,
    board: Array(9).fill(null),
    currentPlayer: 'X',
    players: [],
    winner: null,
    gameStarted: false,
    createdAt: Date.now()
  };
}

function broadcastToGame(roomId, message) {
  const game = games.get(roomId);
  if (game) {
    game.players.forEach(playerId => {
      const player = players.get(playerId);
      if (player && player.ws.readyState === 1) { // WebSocket.OPEN
        player.ws.send(JSON.stringify(message));
      }
    });
  }
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  const playerId = uuidv4();
  
  console.log(`Player connected: ${playerId}`);
  
  // Store player connection
  players.set(playerId, {
    ws,
    id: playerId,
    roomId: null,
    symbol: null
  });
  
  // Send initial connection confirmation
  ws.send(JSON.stringify({
    type: 'connected',
    playerId: playerId
  }));
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'create_room':
          handleCreateRoom(playerId, message);
          break;
          
        case 'join_room':
          handleJoinRoom(playerId, message);
          break;
          
        case 'make_move':
          handleMakeMove(playerId, message);
          break;
          
        case 'reset_game':
          handleResetGame(playerId, message);
          break;
          
        case 'leave_room':
          handleLeaveRoom(playerId, message);
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
  
  ws.on('close', () => {
    handlePlayerDisconnect(playerId);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    handlePlayerDisconnect(playerId);
  });
});

function handleCreateRoom(playerId, message) {
  const roomId = message.roomId || uuidv4();
  const player = players.get(playerId);
  
  if (!player) return;
  
  // Check if room already exists
  if (games.has(roomId)) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Room already exists'
    }));
    return;
  }
  
  // Create new game
  const game = createGame(roomId);
  game.players.push(playerId);
  game.gameStarted = false;
  games.set(roomId, game);
  
  // Update player info
  player.roomId = roomId;
  player.symbol = 'X';
  
  // Send confirmation
  player.ws.send(JSON.stringify({
    type: 'room_created',
    roomId: roomId,
    playerId: playerId,
    symbol: 'X',
    game: game
  }));
  
  console.log(`Room created: ${roomId} by player: ${playerId}`);
}

function handleJoinRoom(playerId, message) {
  const roomId = message.roomId;
  const player = players.get(playerId);
  
  if (!player) return;
  
  const game = games.get(roomId);
  
  if (!game) {
    player.ws.send(JSON.stringify({
      type: 'error',
      message: 'Room not found'
    }));
    return;
  }
  
  if (game.players.length >= 2) {
    player.ws.send(JSON.stringify({
      type: 'error',
      message: 'Room is full'
    }));
    return;
  }
  
  // Join the game
  game.players.push(playerId);
  game.gameStarted = true;
  
  // Update player info
  player.roomId = roomId;
  player.symbol = 'O';
  
  // Notify both players
  broadcastToGame(roomId, {
    type: 'player_joined',
    game: game,
    newPlayer: {
      id: playerId,
      symbol: 'O'
    }
  });
  
  console.log(`Player ${playerId} joined room: ${roomId}`);
}

function handleMakeMove(playerId, message) {
  const player = players.get(playerId);
  if (!player || !player.roomId) return;
  
  const game = games.get(player.roomId);
  if (!game) return;
  
  // Check if it's the player's turn
  if (game.currentPlayer !== player.symbol) {
    player.ws.send(JSON.stringify({
      type: 'error',
      message: 'Not your turn'
    }));
    return;
  }
  
  const { index } = message;
  
  // Validate move
  if (index < 0 || index > 8 || game.board[index] !== null) {
    player.ws.send(JSON.stringify({
      type: 'error',
      message: 'Invalid move'
    }));
    return;
  }
  
  // Make the move
  game.board[index] = player.symbol;
  
  // Check for winner
  const winner = checkWinner(game.board);
  if (winner) {
    game.winner = winner;
    game.gameStarted = false;
  } else {
    // Switch turns
    game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
  }
  
  // Broadcast the move to all players
  broadcastToGame(player.roomId, {
    type: 'move_made',
    game: game,
    move: {
      index: index,
      symbol: player.symbol,
      playerId: playerId
    }
  });
  
  console.log(`Move made in room ${player.roomId}: ${player.symbol} at position ${index}`);
}

function handleResetGame(playerId, message) {
  const player = players.get(playerId);
  if (!player || !player.roomId) return;
  
  const game = games.get(player.roomId);
  if (!game) return;
  
  // Reset game state
  game.board = Array(9).fill(null);
  game.currentPlayer = 'X';
  game.winner = null;
  game.gameStarted = true;
  
  // Broadcast reset to all players
  broadcastToGame(player.roomId, {
    type: 'game_reset',
    game: game
  });
  
  console.log(`Game reset in room: ${player.roomId}`);
}

function handleLeaveRoom(playerId, message) {
  handlePlayerDisconnect(playerId);
}

function handlePlayerDisconnect(playerId) {
  const player = players.get(playerId);
  if (!player) return;
  
  console.log(`Player disconnected: ${playerId}`);
  
  if (player.roomId) {
    const game = games.get(player.roomId);
    if (game) {
      // Remove player from game
      game.players = game.players.filter(id => id !== playerId);
      
      // Notify remaining players
      broadcastToGame(player.roomId, {
        type: 'player_disconnected',
        playerId: playerId,
        game: game
      });
      
      // Clean up empty games
      if (game.players.length === 0) {
        games.delete(player.roomId);
        console.log(`Game ${player.roomId} deleted (no players)`);
      }
    }
  }
  
  // Remove player
  players.delete(playerId);
}

// REST API endpoints
app.get('/api/rooms', (req, res) => {
  const availableRooms = Array.from(games.values())
    .filter(game => game.players.length < 2)
    .map(game => ({
      id: game.id,
      players: game.players.length,
      createdAt: game.createdAt
    }));
  
  res.json(availableRooms);
});

app.get('/api/rooms/:roomId', (req, res) => {
  const game = games.get(req.params.roomId);
  if (!game) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({
    id: game.id,
    players: game.players.length,
    gameStarted: game.gameStarted,
    createdAt: game.createdAt
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    games: games.size,
    players: players.size,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Root endpoint for Railway
app.get('/', (req, res) => {
  res.json({
    message: 'Tic Tac Toe Multiplayer Server',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 Tic Tac Toe Server running on port ${PORT}`);
  console.log(`🌐 Host: ${HOST}`);
  console.log(`📊 Active games: ${games.size}, Connected players: ${players.size}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Server URL: http://${HOST}:${PORT}`);
}).on('error', (error) => {
  console.error('❌ Server failed to start:', error);
  console.error('❌ Error details:', error.message);
  console.error('❌ Port:', PORT, 'Host:', HOST);
  process.exit(1);
});

// Clean up inactive games (older than 1 hour)
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const [roomId, game] of games.entries()) {
    if (now - game.createdAt > oneHour && game.players.length === 0) {
      games.delete(roomId);
      console.log(`Cleaned up inactive game: ${roomId}`);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes 