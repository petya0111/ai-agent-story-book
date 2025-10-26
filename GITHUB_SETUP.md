# 🔐 Quick Setup: GitHub Secrets for One-Button Deploy

## Step 1: Get Your Heroku API Key 🔑

1. **Login to Heroku**: Go to [dashboard.heroku.com](https://dashboard.heroku.com)
2. **Account Settings**: Click your profile → Account Settings
3. **API Key**: Scroll to "API Key" section → Click "Reveal"
4. **Copy the key**: It looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

## Step 2: Add Secrets to GitHub 🛡️

1. **Go to your repo**: https://github.com/petya0111/ai-agent-story-book
2. **Settings tab**: Click "Settings" (top menu)
3. **Secrets**: Left sidebar → "Secrets and variables" → "Actions"
4. **Add secrets**: Click "New repository secret" for each:

### Secret 1: HEROKU_API_KEY
- **Name**: `HEROKU_API_KEY`
- **Value**: Your Heroku API key (from Step 1)

### Secret 2: HEROKU_EMAIL  
- **Name**: `HEROKU_EMAIL`
- **Value**: `pmarinova0111@gmail.com` (your Heroku login email)

## Step 3: Test One-Button Deploy 🚀

1. **Actions Tab**: Go to https://github.com/petya0111/ai-agent-story-book/actions
2. **Manual Deploy**: Click "Manual Deploy" workflow
3. **Run Workflow**: Green "Run workflow" button
4. **Choose Options**:
   - Environment: `production`
   - Deploy target: `both`
   - Force deploy: `false`
5. **Deploy**: Click "Run workflow"

## 🎯 Expected Result

✅ **Automatic Testing**: Tests run first  
✅ **Backend Deploy**: Deploys to Heroku  
✅ **Frontend Deploy**: Deploys to Heroku  
✅ **Health Checks**: Verifies apps are running  
✅ **Status Report**: Shows deployment summary with live URLs  

## 🔗 Your Live URLs
- **Frontend**: https://ai-story-book-frontend-543348ab1276.herokuapp.com
- **Backend**: https://ai-story-book-backend-366deb5178f1.herokuapp.com

---

**⚡ Pro Tip**: After setup, every push to `main` branch will automatically deploy! No button needed for regular updates.