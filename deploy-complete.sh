#!/bin/bash

# Complete Deployment Script for AI Agent Story Book
# Deploys both backend and frontend to Heroku

echo "🚀 Deploying AI Agent Story Book to Heroku..."
echo "This will deploy both the Node.js backend and Next.js frontend"

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

# Get app names
echo "🏷️  Enter your app names (or press enter for auto-generated names):"
read -p "Backend app name (leave blank for auto): " BACKEND_APP
read -p "Frontend app name (leave blank for auto): " FRONTEND_APP

if [ -z "$BACKEND_APP" ]; then
    BACKEND_APP="ai-story-backend-$(date +%s)"
fi

if [ -z "$FRONTEND_APP" ]; then
    FRONTEND_APP="ai-story-frontend-$(date +%s)"
fi

echo "📦 Will create:"
echo "   Backend: $BACKEND_APP"
echo "   Frontend: $FRONTEND_APP"

# Deploy Backend
echo ""
echo "======================================"
echo "🗄️  DEPLOYING BACKEND"
echo "======================================"

# Create backend app
heroku create $BACKEND_APP || {
    echo "Backend app creation failed. It might already exist."
    read -p "Continue with existing app? (y/n): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

# Add PostgreSQL addon to backend
echo "🗄️ Adding PostgreSQL database..."
heroku addons:create heroku-postgresql:essential-0 --app $BACKEND_APP || echo "Database addon might already exist"

# Ask for OpenAI API key and book PDF path
echo "🔑 Please enter your OpenAI API Key:"
read -s OPENAI_KEY

echo "📚 Please enter the book PDF path (e.g., books/hale-sample-story.pdf):"
read BOOK_PDF_PATH

# Set environment variables for backend
echo "⚙️ Setting backend environment variables..."
heroku config:set \
    NODE_ENV=production \
    OPENAI_API_KEY="$OPENAI_KEY" \
    BOOK_PDF_PATH="$BOOK_PDF_PATH" \
    --app $BACKEND_APP

# Deploy backend using git subtree
echo "🚀 Deploying backend..."

# Add heroku remote if it doesn't exist
git remote remove heroku-backend 2>/dev/null || true
git remote add heroku-backend https://git.heroku.com/$BACKEND_APP.git

# Deploy using subtree
echo "Pushing backend code..."
git subtree push --prefix=backend-nodejs heroku-backend main || {
    echo "⚠️  Subtree push failed, trying force push..."
    git push heroku-backend `git subtree split --prefix=backend-nodejs main`:main --force
}

# Deploy Frontend
echo ""
echo "======================================"
echo "🌐 DEPLOYING FRONTEND"
echo "======================================"

# Create frontend app
heroku create $FRONTEND_APP || {
    echo "Frontend app creation failed. It might already exist."
    read -p "Continue with existing app? (y/n): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Backend deployed successfully at: https://$BACKEND_APP.herokuapp.com"
        exit 1
    fi
}

# Set environment variables for frontend
echo "⚙️ Setting frontend environment variables..."
heroku config:set \
    NODE_ENV=production \
    NEXT_PUBLIC_API_URL="https://$BACKEND_APP.herokuapp.com/api" \
    --app $FRONTEND_APP

# Deploy frontend using git subtree  
echo "🚀 Deploying frontend..."

# Add heroku remote if it doesn't exist
git remote remove heroku-frontend 2>/dev/null || true
git remote add heroku-frontend https://git.heroku.com/$FRONTEND_APP.git

# Deploy using subtree
echo "Pushing frontend code..."
git subtree push --prefix=frontend heroku-frontend main || {
    echo "⚠️  Subtree push failed, trying force push..."
    git push heroku-frontend `git subtree split --prefix=frontend main`:main --force
}

echo ""
echo "======================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================================"
echo ""
echo "🌐 Your applications:"
echo "   Backend:  https://$BACKEND_APP.herokuapp.com"
echo "   Frontend: https://$FRONTEND_APP.herokuapp.com"
echo ""
echo "📝 Useful commands:"
echo "   Backend logs:  heroku logs --tail --app $BACKEND_APP"
echo "   Frontend logs: heroku logs --tail --app $FRONTEND_APP"
echo "   Test backend:  curl https://$BACKEND_APP.herokuapp.com/api/health"
echo "   Open frontend: heroku open --app $FRONTEND_APP"
echo ""
echo "🎉 Your AI Agent Story Book is now live!"