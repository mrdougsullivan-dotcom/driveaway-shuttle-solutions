# Enable GitHub Pages for Privacy Policy

Your code is now on GitHub! Now we need to enable GitHub Pages so your privacy policy can be hosted online (required for App Store).

## Steps to Enable GitHub Pages:

1. **Go to your repository:**
   - Visit: https://github.com/mrdougsullivan-dotcom/driveaway-shuttle-solutions

2. **Go to Settings:**
   - Click the "Settings" tab (top of the page)

3. **Find Pages in sidebar:**
   - Scroll down the left sidebar
   - Click "Pages"

4. **Configure GitHub Pages:**
   - Under "Source", select:
     - **Branch**: `main`
     - **Folder**: `/ (root)`
   - Click "Save"

5. **Wait for deployment:**
   - GitHub will show a message: "Your site is ready to be published"
   - Wait 1-2 minutes for it to deploy
   - Refresh the page to see the live URL

## Your Privacy Policy URLs:

Once deployed, your privacy policy will be available at:

**Option 1 (Markdown):**
```
https://mrdougsullivan-dotcom.github.io/driveaway-shuttle-solutions/PRIVACY_POLICY
```

**Option 2 (If GitHub converts to HTML):**
```
https://mrdougsullivan-dotcom.github.io/driveaway-shuttle-solutions/PRIVACY_POLICY.html
```

## For App Store Connect:

When filling out your app information in App Store Connect:
- **Privacy Policy URL**: Use the URL above (test which one works after deployment)

## Verification:

After enabling GitHub Pages:
1. Wait 2 minutes
2. Visit the URL in your browser
3. You should see your privacy policy
4. If you see a 404 error, wait another minute and refresh

## Next Steps After Privacy Policy is Live:

1. ✅ Privacy Policy hosted
2. Register bundle ID at developer.apple.com
3. Create app in App Store Connect
4. Add privacy policy URL
5. Build with EAS: `eas build --platform ios --profile production`

Let me know once you've enabled GitHub Pages and I can help you with the next steps!
