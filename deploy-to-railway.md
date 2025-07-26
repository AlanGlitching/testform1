# 🚀 Quick Railway Deployment Guide

## Step 1: Deploy Server to Railway

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**
6. **Select the `server` folder** (not the root folder)
7. **Click "Deploy"**

## Step 2: Get Your Railway URL

1. **Wait for deployment to complete** (green checkmark)
2. **Click on your service**
3. **Go to "Settings" tab**
4. **Copy the Domain URL** (e.g., `https://your-app-name.railway.app`)

## Step 3: Update Frontend Code

Replace `YOUR_RAILWAY_URL` with your actual Railway URL:

1. **Open `src/components/MultiplayerTicTacToe.tsx`**
2. **Find line with `const SERVER_URL`**
3. **Replace the localhost URL with your Railway URL:**
   ```typescript
   const SERVER_URL = 'wss://your-app-name.railway.app';
   ```
4. **Find the fetch URL and update it:**
   ```typescript
   const response = await fetch('https://your-app-name.railway.app/api/rooms');
   ```

## Step 4: Update CORS in Server

1. **Go back to Railway dashboard**
2. **Click on your service**
3. **Go to "Variables" tab**
4. **Add environment variable:**
   - Key: `NODE_ENV`
   - Value: `production`

## Step 5: Redeploy Frontend

1. **Commit and push your changes to GitHub**
2. **Netlify will automatically redeploy**
3. **Test the multiplayer functionality**

## 🎯 That's it!

Your multiplayer Tic Tac Toe should now work on Netlify! 🎮

---

**Need help?** Check the full `DEPLOYMENT_GUIDE.md` for detailed instructions. 