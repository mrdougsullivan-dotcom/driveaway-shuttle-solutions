# Deploy Web App to Vercel (FREE)

Your web app is built and ready to deploy! Follow these simple steps:

## Option 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with your GitHub account (easiest)

### Step 2: Import Your GitHub Repository
1. Once logged in, click "Add New..." → "Project"
2. Click "Import Git Repository"
3. Select your GitHub repository: `mrdougsullivan-dotcom/driveaway-shuttle-solutions`
4. Click "Import"

### Step 3: Configure Project
Vercel will auto-detect settings, but verify:
- **Framework Preset**: Vite
- **Root Directory**: `web`
- **Build Command**: `bun install && bun run build`
- **Output Directory**: `dist`
- **Install Command**: `bun install`

### Step 4: Add Environment Variable
Click "Environment Variables" and add:
- **Name**: `VITE_BACKEND_URL`
- **Value**: `https://preview-zgdvxfmlompr.share.sandbox.dev`

### Step 5: Deploy!
1. Click "Deploy"
2. Wait 2-3 minutes
3. Your app will be live at: `https://driveaway-shuttle-solutions.vercel.app` (or similar)

## Option 2: Deploy via CLI (Advanced)

If you prefer command line:

```bash
# Install Vercel CLI
bun add -g vercel

# Login to Vercel
vercel login

# Navigate to web directory
cd /home/user/workspace/web

# Deploy
vercel --prod
```

## After Deployment

Your web app will be live at a URL like:
- `https://driveaway-shuttle-solutions.vercel.app`
- OR a custom domain if you set one up

### Features of Your Live App:
✅ **Free hosting forever** (Vercel free tier)
✅ **Automatic HTTPS** (secure)
✅ **Fast global CDN** (loads quickly everywhere)
✅ **Auto-deploys** when you push to GitHub (continuous deployment)

### Share With Transporters:
Once deployed, you can share the URL with:
- Truck drivers
- Transportation companies
- Anyone who needs shuttle services

They can:
- Open it in any mobile browser (Safari, Chrome)
- Add it to their home screen (works like an app!)
- Search for shuttles by location
- Call/email instantly

## Important Note About Backend

Your backend is currently running on Vibecode's sandbox:
`https://preview-zgdvxfmlompr.share.sandbox.dev`

**For production, you'll need to deploy your backend to a permanent server:**

### Free Backend Hosting Options:
1. **Railway** - https://railway.app (easiest)
2. **Render** - https://render.com
3. **Fly.io** - https://fly.io

Once you deploy your backend, update the `VITE_BACKEND_URL` environment variable in Vercel.

## Next Steps

1. Deploy to Vercel following Option 1 above
2. Get your live URL
3. Test it on your phone
4. Share with transporters!

Let me know once you've deployed and I can help with:
- Custom domain setup
- Backend deployment
- Any issues you encounter
