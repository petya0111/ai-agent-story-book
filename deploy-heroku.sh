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

# Create backend app
echo "📦 Creating backend app..."
cd backend
heroku create ai-story-book-backend || echo "Backend app might already exist"

# Add PostgreSQL addon
echo "🗄️ Adding PostgreSQL database..."
heroku addons:create heroku-postgresql:essential-0 --app ai-story-book-backend || echo "Database addon might already exist"

# Set environment variables for backend
echo "⚙️ Setting backend environment variables..."
heroku config:set SPRING_PROFILES_ACTIVE=heroku --app ai-story-book-backend
heroku config:set OPENAI_API_KEY="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" --app ai-story-book-backend

# Deploy backend
echo "🚀 Deploying backend..."
git add .
git commit -m "Prepare backend for Heroku deployment" || echo "No changes to commit"
git push heroku main || git subtree push --prefix=backend heroku main

cd ..

# Create frontend app
echo "📦 Creating frontend app..."
cd frontend
heroku create ai-story-book-frontend || echo "Frontend app might already exist"

# Set environment variables for frontend
echo "⚙️ Setting frontend environment variables..."
heroku config:set NEXT_PUBLIC_API_URL="https://ai-story-book-backend.herokuapp.com/api" --app ai-story-book-frontend

# Deploy frontend
echo "🚀 Deploying frontend..."
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