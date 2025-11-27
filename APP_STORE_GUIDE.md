# App Store Submission Guide for Driveaway Shuttle Solutions

## Prerequisites Checklist

- [x] Apple Developer Account ($99/year) ✅
- [x] App configured in app.json ✅
- [x] Privacy Policy created ✅
- [ ] App icon (1024x1024px PNG)
- [ ] App screenshots (iPhone)
- [ ] Expo account created
- [ ] Bundle identifier registered in Apple Developer Portal

## Step 1: Host Your Privacy Policy

You need to host the privacy policy online so Apple can review it. Options:

1. **GitHub Pages** (Free)
   - Create a public GitHub repository
   - Upload PRIVACY_POLICY.md
   - Enable GitHub Pages in settings
   - Use the URL in App Store Connect

2. **Simple website**
   - Any web hosting service
   - Must be accessible via HTTPS

**Action Required:** Host your PRIVACY_POLICY.md file and note the URL.

## Step 2: Create App Icons and Screenshots

### App Icon Requirements:
- Size: 1024x1024 pixels
- Format: PNG (no transparency)
- Place in: `./assets/icon.png`

### App Screenshots (Required for iPhone):
- iPhone 6.7" Display: 1290 x 2796 pixels (3-10 screenshots)
- iPhone 6.5" Display: 1242 x 2688 pixels (3-10 screenshots)

**Action Required:** You can use the IMAGES tab in Vibecode to generate an app icon, or provide your own.

## Step 3: Register Your App in Apple Developer Portal

1. Go to https://developer.apple.com
2. Navigate to Certificates, Identifiers & Profiles
3. Click "Identifiers" → "+" to add new
4. Select "App IDs" → Continue
5. Enter:
   - Description: "Driveaway Shuttle Solutions"
   - Bundle ID: `com.dougsullivan.driveawayshuttle` (explicit)
6. Select capabilities (if needed): None required for basic app
7. Click "Continue" → "Register"

## Step 4: Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Platform**: iOS
   - **Name**: Driveaway Shuttle Solutions
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: Select `com.dougsullivan.driveawayshuttle`
   - **SKU**: Can be anything unique (e.g., `driveaway-001`)
   - **User Access**: Full Access
4. Click "Create"

## Step 5: Set Up Expo Account and EAS

1. Create an Expo account at https://expo.dev
2. Install EAS CLI globally (already available in Vibecode)
3. Run these commands in order:

```bash
# Login to Expo
eas login

# Configure the project
eas build:configure

# Create your first build
eas build --platform ios --profile production
```

**Note:** The build process takes 15-30 minutes and happens on Expo's servers.

## Step 6: Fill Out App Information in App Store Connect

Once your build is complete:

1. Go to App Store Connect → Your App
2. Fill out required information:

### App Information:
- **Privacy Policy URL**: [Your hosted privacy policy URL]
- **Category**: Navigation or Lifestyle
- **Content Rights**: You own the rights

### Pricing and Availability:
- **Price**: Free (or set your price)
- **Availability**: All countries or select specific ones

### App Privacy:
Apple requires you to fill out privacy details:
- Data collection: Contact Info (Name, Email, Phone)
- Purpose: App Functionality
- Linked to user: No (since it's driver data, not user data)

### Version Information:
- **Screenshots**: Upload iPhone screenshots
- **Description**: Write a compelling app description
- **Keywords**: driveaway, shuttle, transportation, fleet
- **Support URL**: Your website or contact page
- **Marketing URL**: (optional)

### Build:
- Select the build uploaded by EAS

### Age Rating:
- Complete the questionnaire (likely 4+)

## Step 7: Submit for Review

1. Once all required fields are filled (green checkmarks)
2. Click "Add for Review"
3. Click "Submit to App Review"

**Review Time:** Typically 1-3 days

## Step 8: After Approval

Once approved:
1. Click "Release this version" (or schedule release)
2. Your app will be live on the App Store within 24 hours
3. Users can download via: https://apps.apple.com/app/[your-app-id]

## Important Notes

### Bundle Identifier
- `com.dougsullivan.driveawayshuttle` is yours forever
- Never change it after submission
- Must match exactly in app.json and Apple Developer Portal

### Backend URL
- Your current backend is running on Vibecode sandbox
- Before launch, you'll need to deploy it to a permanent server
- Options: Railway, Render, Heroku, or AWS

### Updates
To release updates:
```bash
# Increment version in app.json (1.0.0 → 1.0.1)
eas build --platform ios --profile production
# Then submit new build in App Store Connect
```

## Troubleshooting

**Build fails?**
- Check eas.json configuration
- Ensure all native dependencies are compatible
- Review build logs in Expo dashboard

**Rejected by Apple?**
- Common reasons: Missing privacy policy, unclear app purpose, bugs
- Apple provides detailed feedback
- Fix issues and resubmit

## Need Help?

If you run into any issues during this process, just ask! Common questions:
- Generating app icons
- Creating screenshots
- Hosting privacy policy
- Configuring EAS builds
- Responding to Apple review feedback
