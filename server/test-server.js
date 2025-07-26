import { WebSocket } from 'ws';

const SERVER_URL = 'wss://testform1-production.up.railway.app';

console.log('🧪 Testing server connection...');

try {
  const ws = new WebSocket(SERVER_URL);
  
  ws.on('open', () => {
    console.log('✅ Connected to server successfully!');
    ws.close();
  });
  
  ws.on('error', (error) => {
    console.error('❌ Connection failed:', error.message);
  });
  
  ws.on('close', () => {
    console.log('🔌 Connection closed');
  });
  
} catch (error) {
  console.error('❌ Failed to create WebSocket connection:', error.message);
} 