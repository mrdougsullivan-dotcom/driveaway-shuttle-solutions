# Railway Deployment Guide

## 🚀 Deploy Your Backend to Railway (Free Tier)

Your backend needs to be deployed to production before submitting to the App Store. Follow these steps:

### Step 1: Sign Up for Railway

1. Go to **https://railway.app**
2. Click **"Login"** and sign up with GitHub
3. You get **$5 free credit** (no credit card required initially)

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Connect your GitHub account if not already connected
4. Select your repository: `mrdougsullivan-dotcom/driveaway-shuttle-solutions`
5. Railway will detect it's a Node.js project

### Step 3: Configure the Backend Service

1. Railway will try to deploy the root folder - you need to change this
2. Click on your service → **Settings**
3. Under **"Root Directory"**, set it to: `backend`
4. Under **"Start Command"**, set it to: `bun run start:prod`
5. Click **"Save Changes"**

### Step 4: Set Environment Variables

1. Click on your service → **Variables** tab
2. Add these environment variables:

```
NODE_ENV=production
DATABASE_URL=file:./dev.db
PORT=3000
BETTER_AUTH_SECRET=your-secret-here-change-this-to-random-string
BETTER_AUTH_URL=https://your-app.up.railway.app
ANTHROPIC_API_KEY=your-anthropic-key-if-using-ocr
```

**IMPORTANT:** For `BETTER_AUTH_SECRET`, generate a random string. You can use:
```bash
openssl rand -base64 32
```

**For `BETTER_AUTH_URL`:** Railway will give you a URL after deployment. You'll need to update this after first deploy.

### Step 5: Deploy

1. Click **"Deploy"** or it will auto-deploy
2. Wait 3-5 minutes for build to complete
3. Railway will give you a public URL like: `https://driveaway-shuttle-solutions-production.up.railway.app`

### Step 6: Update BETTER_AUTH_URL

1. Copy your Railway URL
2. Go back to **Variables** tab
3. Update `BETTER_AUTH_URL` with your actual Railway URL
4. Save (this will trigger a redeploy)

### Step 7: Test Your Backend

Visit these URLs in your browser (replace with your actual URL):
- Health check: `https://your-app.up.railway.app/health`
- Get drivers: `https://your-app.up.railway.app/api/drivers`

You should see your 51 companies!

---

## ✅ After Backend is Deployed

### Update Your Mobile App

1. Copy your Railway backend URL
2. In your Vibecode app, go to **ENV** tab
3. Update or add: `EXPO_PUBLIC_VIBECODE_BACKEND_URL=https://your-app.up.railway.app`
4. The app will automatically use the new backend

### Update Your Web App

Your web app will also automatically use the new backend URL from the environment variable.

---

## 💡 Tips

- **Free Tier Limits**: $5/month credit, enough for small apps
- **Database**: SQLite file persists on Railway's disk
- **Monitoring**: Check logs in Railway dashboard
- **Custom Domain**: You can add your own domain in Railway settings

---

## 🆘 Troubleshooting

### Build Fails
- Check Railway logs in the dashboard
- Make sure root directory is set to `backend`
- Verify environment variables are set

### 500 Errors
- Check that DATABASE_URL is set correctly
- Ensure BETTER_AUTH_SECRET and BETTER_AUTH_URL are set
- Check Railway logs for error details

### Database Empty
- The database will start fresh on Railway
- You'll need to run the seed script to add companies
- Option 1: Use the Admin Dashboard in your app to add companies
- Option 2: SSH into Railway and run: `bunx prisma db seed`

---

## 📋 Next Steps After Backend Deployed

1. ✅ Deploy backend to Railway
2. ✅ Update environment variables in your app
3. ✅ Test that app connects to production backend
4. ✅ Wait for Apple Developer approval
5. ✅ Build app with EAS: `eas build --platform ios --profile production`
6. ✅ Submit to App Store

---

## Alternative Deployment Options

If Railway doesn't work for you, here are alternatives:

- **Render.com** (Free tier available)
- **Fly.io** (Free tier available)
- **Vercel** (Free tier, but requires some config changes)
- **AWS EC2** (More complex, but scalable)
- **DigitalOcean App Platform** ($5/month minimum)

All of these support Node.js/Bun and SQLite.

---

**Need help?** Let me know if you run into any issues during deployment!
