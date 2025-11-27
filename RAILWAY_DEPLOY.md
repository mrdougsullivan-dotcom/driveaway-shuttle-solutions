# Deploy to Railway - Quick Start Guide

Your backend is now ready to deploy to Railway! Follow these steps:

## 1. Create a Railway Account
- Go to https://railway.app
- Sign up with your GitHub account (free trial includes $5 credit)

## 2. Deploy Your Backend

### Option A: Deploy from GitHub (Recommended)
1. Push your code to GitHub
2. Go to Railway dashboard: https://railway.app/dashboard
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Railway will automatically detect the configuration

### Option B: Deploy with Railway CLI
1. Install Railway CLI: `npm i -g @railway/cli` (with sudo if needed)
2. Login: `railway login`
3. Initialize: `railway init`
4. Deploy: `railway up`

## 3. Configure Environment Variables

In your Railway project dashboard, go to **Variables** tab and add:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=file:./prisma/dev.db
BETTER_AUTH_SECRET=<generate-a-random-secret>
BETTER_AUTH_URL=https://your-app.up.railway.app
```

To generate a secret:
```bash
openssl rand -base64 32
```

## 4. Get Your Production URL

After deployment, Railway will provide a URL like:
`https://your-app-name.up.railway.app`

## 5. Access Your Admin Portal

Your admin dashboard will be available at:
`https://your-app-name.up.railway.app/admin`

## 6. Update Your Mobile App (Optional)

If you want to use the production backend in your published app:

1. Go to the ENV tab in Vibecode app
2. Update `EXPO_PUBLIC_VIBECODE_BACKEND_URL` to your Railway URL
3. Rebuild your app

---

## Railway Free Tier Details

✅ **$5 credit** per month (free trial)
✅ **500 hours** of execution time
✅ **Custom domains** supported
✅ **Automatic SSL** certificates
✅ **GitHub integration** for auto-deploys

This is perfect for your shuttle driver app!

---

## Troubleshooting

**Database issues?**
- Railway uses ephemeral storage, so SQLite resets on redeploys
- For production, consider upgrading to Railway's PostgreSQL addon
- Or use a persistent volume for SQLite

**Can't access admin?**
- Make sure CORS is configured (already done ✅)
- Check Railway logs for errors
- Verify environment variables are set

**Need help?**
- Railway docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

---

## Files Created for Deployment

✅ `railway.json` - Railway configuration
✅ `backend/Dockerfile` - Container setup
✅ `.railwayignore` - Files to exclude from deployment
✅ Updated `backend/package.json` with production scripts

You're all set to deploy! 🚀
