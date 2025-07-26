# 🌐 Multiplayer Tic Tac Toe Setup Guide

This guide will help you set up and run the multiplayer Tic Tac Toe game server.

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

## 🚀 Quick Setup

### 1. Install Server Dependencies

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

### 2. Start the Server

Run the development server:

```bash
npm run dev
```

Or start the production server:

```bash
npm start
```

The server will start on `http://localhost:3001`

### 3. Start the Frontend

In a new terminal, navigate to the project root and start the React app:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🎮 How to Play Multiplayer

### For the Host (Player 1):
1. Open the game in your browser
2. Navigate to Arcade → Multiplayer Tic Tac Toe
3. Click "Create New Room"
4. Share the room code with your friend
5. Wait for your friend to join

### For the Guest (Player 2):
1. Open the game in your browser (can be on a different device)
2. Navigate to Arcade → Multiplayer Tic Tac Toe
3. Click on the available room or enter the room code
4. Start playing!

## 🔧 Server Configuration

### Environment Variables

You can configure the server using environment variables:

```bash
PORT=3001  # Server port (default: 3001)
```

### API Endpoints

The server provides the following REST API endpoints:

- `GET /health` - Server health check
- `GET /api/rooms` - List available rooms
- `GET /api/rooms/:roomId` - Get room information

### WebSocket Events

The server handles these WebSocket events:

- `create_room` - Create a new game room
- `join_room` - Join an existing room
- `make_move` - Make a move on the board
- `reset_game` - Reset the current game
- `leave_room` - Leave the current room

## 🌐 Network Configuration

### Local Network Play

To play across devices on the same network:

1. Find your computer's local IP address:
   ```bash
   # On Windows
   ipconfig
   
   # On Mac/Linux
   ifconfig
   ```

2. Update the WebSocket URL in `MultiplayerTicTacToe.tsx`:
   ```typescript
   const SERVER_URL = 'ws://YOUR_LOCAL_IP:3001';
   ```

3. Update the API URL:
   ```typescript
   const response = await fetch('http://YOUR_LOCAL_IP:3001/api/rooms');
   ```

### Internet Play (Advanced)

For playing over the internet, you'll need to:

1. Deploy the server to a cloud platform (Heroku, Railway, etc.)
2. Update the WebSocket and API URLs to point to your deployed server
3. Configure CORS settings if needed

## 🐛 Troubleshooting

### Common Issues

1. **"Connection error" message**
   - Make sure the server is running on port 3001
   - Check if the port is not blocked by firewall

2. **"Room not found" error**
   - The room may have expired (rooms auto-delete after 1 hour of inactivity)
   - Try creating a new room

3. **Players can't join**
   - Ensure both players are using the same server URL
   - Check network connectivity

4. **Game not updating in real-time**
   - Check WebSocket connection status
   - Refresh the page and try again

### Server Logs

The server provides detailed logs for debugging:

```
🚀 Tic Tac Toe Server running on port 3001
📊 Active games: 0, Connected players: 0
Player connected: abc123
Room created: ABC123 by player: abc123
Player def456 joined room: ABC123
Move made in room ABC123: X at position 4
```

## 🔒 Security Notes

- The server is designed for local/development use
- For production deployment, consider adding:
  - Authentication
  - Rate limiting
  - Input validation
  - HTTPS/WSS encryption

## 📝 Development

### Adding New Features

To extend the multiplayer functionality:

1. Add new WebSocket event handlers in `server.js`
2. Update the frontend to send/receive new message types
3. Test thoroughly with multiple clients

### File Structure

```
server/
├── package.json          # Server dependencies
├── server.js            # Main server file
└── node_modules/        # Installed packages

src/components/
├── MultiplayerTicTacToe.tsx    # Multiplayer game component
└── TicTacToe.module.css        # Shared styles
```

## 🎯 Next Steps

- Add player names/avatars
- Implement game chat
- Add spectator mode
- Create tournament brackets
- Add sound effects
- Implement game replays

Happy gaming! 🎮 