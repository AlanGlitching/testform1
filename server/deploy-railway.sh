#!/bin/bash

echo "🚀 Deploying Tic Tac Toe Server to Railway..."

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Deploy to Railway
echo "📦 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your server should be available at: https://testform1-production.up.railway.app"
echo "🔍 Check the deployment logs in Railway dashboard if there are any issues." 