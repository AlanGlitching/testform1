const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? "https://your-netlify-app.netlify.app" 
      : "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// 中間件
app.use(cors());
app.use(express.json());

// 簡單的狀態管理
const gameState = {
  connectedUsers: 0,
  messages: [],
  lastUpdate: new Date().toISOString()
};

// 路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'Socket.IO Server is running!',
    connectedUsers: gameState.connectedUsers,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO 連接處理
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  gameState.connectedUsers++;
  
  // 發送當前狀態給新連接的用戶
  socket.emit('stateUpdate', gameState);
  
  // 廣播用戶連接消息
  socket.broadcast.emit('userJoined', {
    userId: socket.id,
    connectedUsers: gameState.connectedUsers,
    timestamp: new Date().toISOString()
  });

  // 處理聊天消息
  socket.on('sendMessage', (messageData) => {
    const message = {
      id: Date.now(),
      userId: socket.id,
      text: messageData.text,
      timestamp: new Date().toISOString()
    };
    
    gameState.messages.push(message);
    gameState.lastUpdate = new Date().toISOString();
    
    // 廣播消息給所有用戶
    io.emit('newMessage', message);
    io.emit('stateUpdate', gameState);
    
    console.log('Message received:', message);
  });

  // 處理狀態同步請求
  socket.on('requestState', () => {
    socket.emit('stateUpdate', gameState);
  });

  // 處理斷線
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    gameState.connectedUsers = Math.max(0, gameState.connectedUsers - 1);
    
    // 廣播用戶斷線消息
    socket.broadcast.emit('userLeft', {
      userId: socket.id,
      connectedUsers: gameState.connectedUsers,
      timestamp: new Date().toISOString()
    });
  });
});

// 啟動伺服器
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 