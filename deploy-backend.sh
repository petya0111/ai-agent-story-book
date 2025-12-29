#!/bin/bash

# Simple Backend Deployment to Heroku (Node.js)

echo "🚀 Deploying AI Agent Story Book Backend to Heroku..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Please install it first:"
    echo "   brew install heroku/brew/heroku"
    exit 1
fi

# Login to Heroku (if not already logged in)
echo "🔐 Checking Heroku login..."
heroku auth:whoami || heroku login

# Ensure we're in the root directory
cd "$(dirname "$0")"

# Create backend app
echo "📦 Creating backend app..."
BACKEND_APP="ai-story-backend-$(date +%s)"
echo "Creating backend app with name: $BACKEND_APP"

heroku create $BACKEND_APP || {
    echo "Enter your desired backend app name:"
    read BACKEND_APP
    heroku create $BACKEND_APP
}

# Add PostgreSQL addon to backend
echo "🗄️ Adding PostgreSQL database..."
heroku addons:create heroku-postgresql:essential-0 --app $BACKEND_APP || echo "Database addon might already exist"

# Ask for OpenAI API key
echo "🔑 Please enter your OpenAI API Key:"
read -s OPENAI_KEY

# Set environment variables for backend
echo "⚙️ Setting backend environment variables..."
heroku config:set \
    NODE_ENV=production \
    PORT=8080 \
    OPENAI_API_KEY="$OPENAI_KEY" \
    --app $BACKEND_APP

# Deploy backend using git subtree
echo "🚀 Deploying backend..."

# Add heroku remote if it doesn't exist
git remote remove heroku-backend 2>/dev/null || true
git remote add heroku-backend https://git.heroku.com/$BACKEND_APP.git

# Deploy using subtree
git subtree push --prefix=backend-nodejs heroku-backend main || {
    echo "⚠️  Subtree push failed, trying force push..."
    git push heroku-backend `git subtree split --prefix=backend-nodejs main`:main --force
}

echo ""
echo "✅ Backend deployment complete!"
echo "🌐 Backend URL: https://$BACKEND_APP.herokuapp.com"
echo ""
echo "📝 Next steps:"
echo "1. Check the backend logs: heroku logs --tail --app $BACKEND_APP"
echo "2. Test the API: curl https://$BACKEND_APP.herokuapp.com/api/health"
echo "3. Update frontend to use this backend URL: $BACKEND_APP.herokuapp.com"