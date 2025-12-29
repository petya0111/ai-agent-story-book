#!/bin/bash

# Deploy AI Agent Story Book to Heroku

echo "🚀 Deploying AI Agent Story Book to Heroku..."

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
BACKEND_APP="ai-story-book-backend-$(date +%s)"
heroku create $BACKEND_APP || {
    echo "Enter your backend app name:"
    read BACKEND_APP
}

# Add PostgreSQL addon to backend
echo "🗄️ Adding PostgreSQL database..."
heroku addons:create heroku-postgresql:essential-0 --app $BACKEND_APP || echo "Database addon might already exist"

# Set environment variables for backend
echo "⚙️ Setting backend environment variables..."
heroku config:set \
    SPRING_PROFILES_ACTIVE=production \
    PORT=8080 \
    --app $BACKEND_APP

# Ask for OpenAI API key
echo "🔑 Please enter your OpenAI API Key:"
read -s OPENAI_KEY
heroku config:set OPENAI_API_KEY="$OPENAI_KEY" --app $BACKEND_APP

# Deploy backend using git subtree
echo "🚀 Deploying backend..."
git subtree push --prefix=backend heroku-backend main 2>/dev/null || {
    echo "Setting up backend remote..."
    git remote add heroku-backend https://git.heroku.com/$BACKEND_APP.git
    git subtree push --prefix=backend heroku-backend main
}

# Create frontend app
echo "📦 Creating frontend app..."
FRONTEND_APP="ai-story-book-frontend-$(date +%s)"
heroku create $FRONTEND_APP || {
    echo "Enter your frontend app name:"
    read FRONTEND_APP
}

# Set environment variables for frontend
echo "⚙️ Setting frontend environment variables..."
heroku config:set \
    NEXT_PUBLIC_API_URL="https://$BACKEND_APP.herokuapp.com/api" \
    NODE_ENV=production \
    --app $FRONTEND_APP

# Deploy frontend using git subtree  
echo "🚀 Deploying frontend..."
git subtree push --prefix=frontend heroku-frontend main 2>/dev/null || {
    echo "Setting up frontend remote..."
    git remote add heroku-frontend https://git.heroku.com/$FRONTEND_APP.git
    git subtree push --prefix=frontend heroku-frontend main
}

echo ""
echo "✅ Deployment complete!"
echo "🌐 Backend URL: https://$BACKEND_APP.herokuapp.com"
echo "🌐 Frontend URL: https://$FRONTEND_APP.herokuapp.com"
echo ""
echo "� Next steps:"
echo "1. Check the backend logs: heroku logs --tail --app $BACKEND_APP"
echo "2. Check the frontend logs: heroku logs --tail --app $FRONTEND_APP"
echo "3. Test the API: curl https://$BACKEND_APP.herokuapp.com/api/health"
git add .
git commit -m "Prepare frontend for Heroku deployment" || echo "No changes to commit"
git push heroku main || git subtree push --prefix=frontend heroku main

cd ..

echo "✅ Deployment complete!"
echo "🌐 Backend URL: https://ai-story-book-backend.herokuapp.com"
echo "🌐 Frontend URL: https://ai-story-book-frontend.herokuapp.com"
echo ""
echo "📝 Next steps:"
echo "1. Check the backend logs: heroku logs --tail --app ai-story-book-backend"
echo "2. Check the frontend logs: heroku logs --tail --app ai-story-book-frontend"
echo "3. Test the API: curl https://ai-story-book-backend.herokuapp.com/api/book/metadata"