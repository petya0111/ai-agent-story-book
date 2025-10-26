# 🚀 GitHub Actions CI/CD Setup Guide

This guide will help you set up one-button deployment from GitHub to Heroku.

## 📋 Prerequisites

1. **Heroku Account** with apps already created:
   - Backend: `ai-story-book-backend`
   - Frontend: `ai-story-book-frontend`

2. **GitHub Repository** with your code

## 🔧 Setup Instructions

### Step 1: Get Your Heroku API Key

1. Go to [Heroku Account Settings](https://dashboard.heroku.com/account)
2. Scroll down to "API Key" section
3. Click "Reveal" and copy your API key

### Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** and add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `HEROKU_API_KEY` | Your Heroku API key | Used to authenticate with Heroku |
| `HEROKU_EMAIL` | Your Heroku account email | Your Heroku login email |

### Step 3: Enable GitHub Actions

1. Go to your repository
2. Click on the **"Actions"** tab
3. If prompted, click **"I understand my workflows, go ahead and enable them"**

## 🎯 How to Deploy

### 🔄 Automatic Deployment
- **Trigger**: Every push to `main` branch
- **What happens**: Automatically deploys both frontend and backend
- **Process**: Tests → Build → Deploy → Health Check

### 🎮 Manual Deployment (One-Button Deploy)

1. Go to your repository
2. Click **"Actions"** tab
3. Select **"Manual Deploy"** workflow
4. Click **"Run workflow"** button
5. Choose your options:
   - **Environment**: Production or Staging
   - **Deploy Target**: Both, Backend-only, or Frontend-only
   - **Force Deploy**: Skip tests (use with caution)
6. Click **"Run workflow"**

### 📊 Deployment Features

✅ **Testing**: Runs tests before deployment  
✅ **Health Checks**: Verifies apps are running after deployment  
✅ **Parallel Jobs**: Optimized for speed  
✅ **Selective Deployment**: Deploy just backend or frontend  
✅ **Status Reports**: Detailed deployment summaries  
✅ **Error Handling**: Clear error messages and rollback info  

## 🔍 Monitoring Deployments

### View Deployment Status
1. Go to **Actions** tab in GitHub
2. Click on any workflow run to see:
   - ✅ Build status
   - 📊 Test results
   - 🚀 Deployment progress
   - 🔗 Live app URLs

### Deployment URLs
- **Frontend**: https://ai-story-book-frontend-543348ab1276.herokuapp.com
- **Backend**: https://ai-story-book-backend-366deb5178f1.herokuapp.com

## 🆘 Troubleshooting

### Common Issues

**❌ Secret not found errors**
- Solution: Double-check that `HEROKU_API_KEY` and `HEROKU_EMAIL` are set correctly in GitHub Secrets

**❌ App not found errors**  
- Solution: Ensure your Heroku app names match exactly:
  - `ai-story-book-backend`
  - `ai-story-book-frontend`

**❌ Build failures**
- Solution: Check the logs in the Actions tab for specific error messages

**❌ Health check failures**
- Solution: Apps might be slow to start. Check Heroku logs: `heroku logs --app your-app-name`

### Manual Rollback
If you need to rollback a deployment:
```bash
heroku rollback --app ai-story-book-backend
heroku rollback --app ai-story-book-frontend
```

## 🎉 Quick Start

1. Set up secrets (Steps 1-2 above)
2. Push code to `main` branch → **Automatic deployment**
3. Or use **Actions** → **Manual Deploy** → **Run workflow** → **One-button deploy**

Your AI Story Book will be live in minutes! 🌟