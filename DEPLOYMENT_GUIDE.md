# 🚀 Deployment Guide for Multiplayer Tic Tac Toe

This guide will help you deploy both the frontend (Netlify) and backend (Railway) for the multiplayer Tic Tac Toe game.

## 📋 Prerequisites

- GitHub account
- Netlify account (free)
- Railway account (free)

## 🌐 Backend Deployment (Railway)

### Step 1: Deploy to Railway

1. **Go to [Railway.app](https://railway.app)** and sign up/login
2. **Create a new project** → "Deploy from GitHub repo"
3. **Select your repository** and choose the `server` folder
4. **Railway will automatically detect** it's a Node.js app and deploy it

### Step 2: Get Your Railway URL

1. Once deployed, go to your project dashboard
2. Click on your service
3. Go to the "Settings" tab
4. Copy the **Domain** URL (e.g., `https://your-app-name.railway.app`)

### Step 3: Update Frontend Configuration

Replace `your-railway-url` with your actual Railway URL in the following files:

1. **Update MultiplayerTicTacToe.tsx:**
   ```typescript
   const SERVER_URL = 'wss://your-railway-url';
   ```

2. **Update the API fetch URL:**
   ```typescript
   const response = await fetch('https://your-railway-url/api/rooms');
   ```

## 🎨 Frontend Deployment (Netlify)

### Step 1: Deploy to Netlify

1. **Go to [Netlify.com](https://netlify.com)** and sign up/login
2. **Click "New site from Git"**
3. **Connect to GitHub** and select your repository
4. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Click "Deploy site"**

### Step 2: Update CORS Settings

In your Railway server, update the CORS origins to include your Netlify URL:

```javascript
app.use(cors({
  origin: [
    'https://your-netlify-app.netlify.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

## 🔧 Environment Variables

### Railway Environment Variables

You can set these in your Railway project settings:

```bash
PORT=3001
NODE_ENV=production
```

### Netlify Environment Variables

If you need to use environment variables in your frontend, add them in Netlify:

1. Go to Site settings → Environment variables
2. Add any variables you need

## 🎮 Testing the Deployment

### Local Testing

1. **Start the Railway server** (it should be running automatically)
2. **Start the frontend locally:**
   ```bash
   npm run dev
   ```
3. **Test multiplayer** by opening two browser tabs

### Production Testing

1. **Deploy both frontend and backend**
2. **Open your Netlify URL** in two different devices
3. **Test the multiplayer functionality**

## 🐛 Troubleshooting

### Common Issues

1. **"Connection failed" error:**
   - Check if Railway server is running
   - Verify the WebSocket URL is correct
   - Ensure CORS is properly configured

2. **"CORS error" in browser console:**
   - Update CORS origins in server.js
   - Make sure your Netlify URL is included

3. **"WebSocket connection failed":**
   - Check if Railway domain is accessible
   - Verify the protocol (wss:// for production)

### Railway Logs

Check Railway logs for server errors:
1. Go to your Railway project
2. Click on your service
3. Go to "Deployments" tab
4. Click on the latest deployment
5. Check the logs for any errors

### Netlify Logs

Check Netlify build logs:
1. Go to your Netlify dashboard
2. Click on your site
3. Go to "Deploys" tab
4. Click on the latest deploy
5. Check the build logs

## 🔄 Updating Deployments

### Backend Updates

1. **Push changes to GitHub**
2. **Railway will automatically redeploy**

### Frontend Updates

1. **Push changes to GitHub**
2. **Netlify will automatically redeploy**

## 💰 Cost Considerations

- **Railway:** Free tier includes 500 hours/month
- **Netlify:** Free tier includes 100GB bandwidth/month
- **Both are sufficient for personal projects**

## 🔒 Security Notes

For production use, consider:
- Adding authentication
- Rate limiting
- Input validation
- HTTPS/WSS encryption (Railway provides this automatically)

## 📱 Mobile Testing

Test on mobile devices:
1. **Open your Netlify URL on mobile**
2. **Create a room on desktop**
3. **Join the room on mobile**
4. **Test the gameplay**

## 🎯 Next Steps

After successful deployment:
- Add player names/avatars
- Implement game chat
- Add spectator mode
- Create tournament brackets

Happy deploying! 🚀 