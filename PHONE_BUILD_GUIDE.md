# Quick App Store Build Guide (From Your Phone)

Your **Driveaway Shuttle Solutions** app is ready to submit to the App Store!

## What's Already Done ✅

- App icon created and configured
- Bundle ID: `com.dougsullivan.driveawayshuttle`
- Version: 1.0.2
- Privacy policy created
- EAS configuration ready
- Apple Team ID: M4NCBU3DYH
- Apple ID: mr.doug.sullivan@gmail.com

## What You Need to Do on Computer

Since you're on your phone, here's what you'll need to complete on a computer later:

### 1. Host Your Privacy Policy (5 minutes)

**Option A: GitHub Pages (Easiest)**
1. Go to https://github.com
2. Create a new public repository (name it: `driveaway-privacy`)
3. Upload the `PRIVACY_POLICY.md` file from your workspace
4. Go to Settings → Pages
5. Enable GitHub Pages (source: main branch)
6. Your URL will be: `https://[your-username].github.io/driveaway-privacy/PRIVACY_POLICY.md`

**Option B: Any Website**
- Upload PRIVACY_POLICY.md to any web hosting
- Must be accessible via HTTPS

**⚠️ Important:** You need to update line 66 in PRIVACY_POLICY.md with your actual email address before hosting it.

### 2. Register Bundle ID in Apple Developer Portal (5 minutes)

1. Go to https://developer.apple.com
2. Sign in with `mr.doug.sullivan@gmail.com`
3. Go to: Certificates, Identifiers & Profiles
4. Click "Identifiers" → "+"
5. Select "App IDs" → Continue
6. Enter:
   - Description: `Driveaway Shuttle Solutions`
   - Bundle ID: `com.dougsullivan.driveawayshuttle` (explicit)
7. Capabilities: None needed
8. Click Register

### 3. Create App in App Store Connect (10 minutes)

1. Go to https://appstoreconnect.apple.com
2. Sign in with `mr.doug.sullivan@gmail.com`
3. Click "My Apps" → "+" → "New App"
4. Fill in:
   - Platform: iOS
   - Name: `Driveaway Shuttle Solutions`
   - Primary Language: English (U.S.)
   - Bundle ID: Select `com.dougsullivan.driveawayshuttle`
   - SKU: `driveaway-shuttle-001`
   - User Access: Full Access
5. Click "Create"
6. **Copy the App ID** (looks like: 1234567890) - you'll need this

### 4. Build and Submit (30-45 minutes)

Once steps 1-3 are done, you can build from any computer with terminal access:

```bash
# 1. Clone or access your workspace
cd /path/to/workspace

# 2. Login to Expo account
export PATH="/home/user/.bun/bin:$PATH"
eas login

# 3. Update eas.json with your App Store Connect App ID
# Edit line 33 in eas.json: "ascAppId": "YOUR_ACTUAL_APP_ID"

# 4. Build for production (takes 20-30 minutes)
eas build --platform ios --profile production

# 5. Submit to App Store (optional - or do it manually)
eas submit --platform ios --profile production
```

**Alternative:** After the build completes, you can manually upload in App Store Connect:
1. Download the .ipa file from Expo dashboard
2. Upload it in App Store Connect → Your App → Build section

### 5. Fill Out App Store Connect Info (20 minutes)

In App Store Connect, complete:

**App Information:**
- Privacy Policy URL: [Your hosted URL from Step 1]
- Category: Navigation
- Subtitle: Find shuttle drivers nationwide

**Pricing:**
- Price: Free

**App Privacy:**
- Contact Info collected (for driver listings)
- Purpose: App Functionality
- Not linked to user identity

**Version Information:**
- Description:
```
Driveaway Shuttle Solutions helps you find professional shuttle drivers across the United States. With 56+ verified companies in 27 states, quickly locate the nearest shuttle service, calculate trip distances, and contact drivers directly.

Features:
• Browse shuttle companies by state and city
• Distance calculator with automatic closest driver finder
• Direct call and email contact
• 56+ real companies across 27 states
• Admin dashboard for fleet management
```

- Keywords: `driveaway,shuttle,transportation,fleet,drivers,rideshare`
- Support URL: (your website or GitHub profile)
- Screenshots: Need 3-10 iPhone screenshots (see below)

**Build:**
- Select the build uploaded by EAS

**Age Rating:**
- Complete questionnaire (should be 4+)

### 6. Create Screenshots

You need iPhone screenshots. **Easiest method:**
1. Open your app on iPhone
2. Take screenshots (Press Volume Up + Side button)
3. Upload to App Store Connect

**Required sizes:**
- iPhone 6.7" Display: 3-10 screenshots
- Screenshots should show: Home screen, city list, driver details, distance calculator

## Timeline Summary

**Computer work needed:** ~1 hour total
- Hosting privacy policy: 5 min
- Apple Developer Portal: 5 min
- App Store Connect setup: 10 min
- Starting the build: 5 min
- Filling out app details: 20 min
- Creating screenshots: 15 min

**Waiting time:**
- Build completion: 20-30 minutes
- Apple review: 1-3 days

## Important Notes

### Backend Deployment (Do Before Launch!)
Your backend is currently on Vibecode sandbox. Before going live, deploy it to:
- Railway (easiest): See RAILWAY_DEPLOY.md
- Render, Heroku, or AWS

Then update the environment variable in your app with the new backend URL.

### After Apple Approval
1. Click "Release this version"
2. App goes live within 24 hours
3. Share your App Store link!

### Making Updates Later
1. Update version in app.json (1.0.2 → 1.0.3)
2. Run: `eas build --platform ios --profile production`
3. Submit new build in App Store Connect

## Troubleshooting

**Don't have a computer?**
- You can do steps 1-3 from a tablet with a browser
- The build command needs to be run from a terminal (could use a cloud IDE)

**Build fails?**
- Check the build logs in Expo dashboard
- Most issues are configuration-related
- Common fix: Make sure bundle ID matches everywhere

**Need screenshots?**
- You can use your phone screenshots directly
- Or use the Vibecode app to capture them

## Need Help?

If you get stuck on any step, take a screenshot and ask for help. The most common issues are:
1. Bundle ID not matching
2. Privacy policy not accessible
3. Missing screenshots

---

**Ready to publish?** Follow steps 1-6 above when you have computer access!
