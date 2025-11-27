# GitHub Setup Guide

## Why Use GitHub?

1. **Host Privacy Policy** - Free hosting via GitHub Pages (required for App Store)
2. **Backup Your Code** - Never lose your work
3. **Version Control** - Track all changes to your app
4. **Collaboration** - Easy to share with other developers

## Step 1: Create a GitHub Account

1. Go to https://github.com
2. Click "Sign up"
3. Create your account (use your email)
4. Verify your email address

## Step 2: Create a New Repository

1. Once logged in, click the "+" icon in top right
2. Click "New repository"
3. Fill in:
   - **Repository name**: `driveaway-shuttle-solutions`
   - **Description**: "Driveaway Shuttle Solutions - Fleet management app for driveaway transportation companies"
   - **Visibility**: Choose "Public" (required for GitHub Pages) or "Private"
   - **DO NOT** initialize with README (we already have one)
4. Click "Create repository"

## Step 3: Connect Your App to GitHub

After creating the repository, GitHub will show you commands. You'll need to run these in Vibecode:

**Tell me when you've created the repository, and I'll help you push your code to GitHub.**

The commands will look something like:
```bash
git remote add github https://github.com/YOUR_USERNAME/driveaway-shuttle-solutions.git
git push github main
```

## Step 4: Enable GitHub Pages (for Privacy Policy)

Once your code is pushed to GitHub:

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Click "Pages" in left sidebar
4. Under "Source", select:
   - **Branch**: main
   - **Folder**: / (root)
5. Click "Save"
6. Wait 1-2 minutes for it to deploy
7. Your privacy policy will be at:
   `https://YOUR_USERNAME.github.io/driveaway-shuttle-solutions/PRIVACY_POLICY`

**This URL is what you'll use in App Store Connect!**

## Step 5: Update App Store Connect

Once your privacy policy is live:
1. Go to App Store Connect
2. Add the privacy policy URL: `https://YOUR_USERNAME.github.io/driveaway-shuttle-solutions/PRIVACY_POLICY`

## Alternative: Simple GitHub Pages Setup

If you just want to host the privacy policy without the full code:

1. Create a repository called `YOUR_USERNAME.github.io`
2. Upload just the PRIVACY_POLICY.md file
3. Rename it to `index.html` or `privacy.html`
4. Your privacy policy will be at: `https://YOUR_USERNAME.github.io/privacy.html`

## Need Help?

Just let me know once you've:
1. Created your GitHub account
2. Created a repository

I'll help you push your code and set up GitHub Pages!
