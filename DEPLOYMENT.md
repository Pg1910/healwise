# 🚀 HealWise Vercel Deployment Guide

## ✅ Files Updated & Ready for Deployment

I've updated all the necessary files for Vercel deployment:

### 📁 Updated Files:
- ✅ `vercel.json` - Optimized Vercel configuration
- ✅ `frontend/src/services/api.js` - Environment-aware API configuration  
- ✅ `README.md` - Professional project documentation
- ✅ `frontend/.gitignore` - Proper file exclusions

---

## 🔧 Complete Deployment Steps

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Authorize Vercel to access your repositories

### Step 2: Deploy via Vercel Dashboard (Easiest)
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your `healwise` repository from GitHub
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `cd frontend && npm install`
4. Click **Deploy**

### Step 3: Alternative - CLI Deployment
```bash
# In your project directory
npx vercel login
# Follow the browser login flow

npx vercel --prod
# Follow the prompts:
# - Set up and deploy? → Yes  
# - Which scope? → Your account
# - Link to existing project? → No
# - Project name? → healwise
# - Directory? → ./ (current directory)
```

---

## 🌐 Your Live URLs

After deployment, you'll get:
- **Preview**: `https://healwise-[random].vercel.app`
- **Production**: `https://healwise.vercel.app` (if available)

---

## 🔗 Backend Deployment (Next Step)

To make your app fully functional, deploy your FastAPI backend:

### Option 1: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repo
3. Deploy from `backend/` folder
4. Add environment variables if needed
5. Get your backend URL

### Option 2: Render
1. Go to [render.com](https://render.com)  
2. Create new Web Service
3. Connect your repo
4. Set:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`

### Step 3: Update Frontend API URL
Once backend is deployed, update `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-actual-backend-url.railway.app'  // Replace with real URL
  : 'http://127.0.0.1:8000';
```

---

## 📋 Deployment Checklist

- ✅ Files configured for Vercel
- ⏳ Vercel account setup
- ⏳ Frontend deployed to Vercel  
- ⏳ Backend deployed to Railway/Render
- ⏳ API URL updated in frontend
- ⏳ Test live application

---

## 🎯 Quick Start Commands

```bash
# Test your build locally first
cd frontend
npm run build
npm run preview

# Deploy to Vercel
npx vercel --prod

# Check deployment status
npx vercel ls
```

---

**🚀 You're all set! Follow the steps above and your HealWise app will be live on Vercel!**

**Need help?** The fallback API responses are already configured, so your frontend will work even without the backend initially.
