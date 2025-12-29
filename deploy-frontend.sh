#!/bin/bash

# Simple Frontend Deployment to Heroku

echo "🚀 Deploying AI Agent Story Book Frontend to Heroku..."

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

# Create frontend app
echo "📦 Creating frontend app..."
APP_NAME="ai-story-frontend-$(date +%s)"
echo "Creating app with name: $APP_NAME"

heroku create $APP_NAME || {
    echo "Enter your desired app name:"
    read APP_NAME
    heroku create $APP_NAME
}

# Set environment variables for frontend
echo "⚙️ Setting frontend environment variables..."
heroku config:set \
    NODE_ENV=production \
    NEXT_PUBLIC_API_URL="https://ai-story-book-backend.herokuapp.com/api" \
    --app $APP_NAME

# Deploy frontend using git subtree  
echo "🚀 Deploying frontend..."

# Add heroku remote if it doesn't exist
git remote remove heroku-frontend 2>/dev/null || true
git remote add heroku-frontend https://git.heroku.com/$APP_NAME.git

# Deploy using subtree
git subtree push --prefix=frontend heroku-frontend main || {
    echo "⚠️  Subtree push failed, trying force push..."
    git push heroku-frontend `git subtree split --prefix=frontend main`:main --force
}

echo ""
echo "✅ Frontend deployment complete!"
echo "🌐 Frontend URL: https://$APP_NAME.herokuapp.com"
echo ""
echo "📝 Next steps:"
echo "1. Check the frontend logs: heroku logs --tail --app $APP_NAME"
echo "2. Test the website: curl https://$APP_NAME.herokuapp.com"
echo "3. Open in browser: heroku open --app $APP_NAME"