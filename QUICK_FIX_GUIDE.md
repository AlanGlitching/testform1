# Quick Fix for Multiplayer Tic Tac Toe

## The Problem
The multiplayer server is currently offline, causing the "Connection error" message.

## Immediate Solution: Test Locally

### Option 1: Use the Batch File (Windows)
1. Double-click `start-local-server.bat` in the project root
2. Wait for the server to start (you'll see "🚀 Tic Tac Toe Server running on port 3001")
3. Open your app in another browser window/tab
4. Try the multiplayer game - it should work!

### Option 2: Manual Start
```bash
cd server
npm install
npm start
```

## Fix the Online Server

### Option 1: Railway (Current)
1. Go to [Railway Dashboard](https://railway.app/)
2. Find project `testform1-production`
3. Go to Deployments → Click "Deploy"
4. Check logs for errors

### Option 2: Render (Alternative)
1. Go to [Render.com](https://render.com/)
2. Create new Web Service
3. Connect GitHub repo
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Deploy

### Option 3: Heroku (Alternative)
1. Go to [Heroku.com](https://heroku.com/)
2. Create new app
3. Connect GitHub repo
4. Deploy

## After Deployment
1. Update the server URL in `src/components/MultiplayerTicTacToe.tsx`
2. Redeploy the frontend to Netlify
3. Test the multiplayer functionality

## Test Server Health
```bash
curl https://your-server-url.com/health
```

Should return: `{"status":"ok","games":0,"players":0,...}` 