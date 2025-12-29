# 🚀 Heroku Deployment Guide

## Quick Deploy (Recommended)

Run the complete deployment script:
```bash
./deploy-complete.sh
```

This will:
1. Deploy the Node.js backend with PostgreSQL
2. Deploy the Next.js frontend 
3. Connect them together
4. Set up environment variables

## Individual Deployment

### Backend Only
```bash
./deploy-backend.sh
```

### Frontend Only  
```bash
./deploy-frontend.sh
```

## Prerequisites

1. **Install Heroku CLI**:
   ```bash
   brew install heroku/brew/heroku
   ```

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Have your OpenAI API Key ready**

## What Gets Deployed

- **Backend**: Node.js/Express server with PostgreSQL database
- **Frontend**: Next.js app with premium dark fantasy UI
- **Features**: Hero creation, Oracle wisdom, story interaction

## After Deployment

1. Check logs:
   ```bash
   heroku logs --tail --app your-backend-app
   heroku logs --tail --app your-frontend-app
   ```

2. Test the API:
   ```bash
   curl https://your-backend-app.herokuapp.com/api/health
   ```

3. Open your app:
   ```bash
   heroku open --app your-frontend-app
   ```

## Troubleshooting

- If subtree push fails, the script will try a force push
- Make sure your git repo is up to date
- Check that you have the latest changes committed

## Notes

- Uses the stable Node.js backend instead of the Kotlin backend
- Frontend build is optimized for production
- All premium styling and animations are included
- Oracle questions remain persistent as requested