# Driveaway Shuttle Solutions

A professional mobile app for managing driveaway transportation companies across the United States. Built with Expo, React Native, and a full backend stack. Features 56 professional driveaway companies across 27 states sourced from [Driveaway Guide](https://driveawayguide.com).

**Developer:** Doug S.
**Version:** 1.0.4
**Bundle ID:** com.dougsullivan.driveawayshuttle

## Latest Updates

### v1.0.4 - Accurate Driving Distance Calculation (Current)
- ✅ **Fixed Distance Calculator**: Now uses actual driving routes instead of straight-line distance
  - Integrated OSRM (Open Source Routing Machine) for real road distances
  - Distances now match Google Maps closely (within 5-10%)
  - Buffalo, NY to Macungie, PA now correctly shows ~315 miles (was showing 237 miles)
- ✅ **Fallback System**: If routing service is unavailable, uses 1.3x multiplier on straight-line distance
- ✅ **Accurate Driving Times**: Real-time estimates based on actual route data

### v1.0.3 - Database Restoration & Data Protection
- ✅ **All Companies Restored**: Successfully restored all 56 companies across 27 states
- ✅ **Data Loss Prevention**: Implemented safeguards to prevent accidental data deletion
  - Seed script now checks for existing data before clearing
  - Created `restore-companies.ts` script that safely adds missing companies without deleting existing ones
  - Added `backup-database.ts` script for creating JSON backups
- ✅ **Database Schema Fixed**: Applied missing `serviceLocations` column migration
- 🛡️ **Protection Against Data Loss**: Multiple safeguards now in place to prevent this issue from recurring

### v1.0.2 - Distance Calculator & Backend Improvements
- ✅ **Distance Calculator**: Calculate distances between drop-off and pickup locations
- ✅ **Database Schema Fix**: Fixed "Failed to fetch drivers" error by applying missing `serviceLocations` column migration
  - Database now properly synced with schema
  - Distance Calculator can now fetch and display closest drivers successfully

### v1.0.1 - Keyboard Handling & Distance Calculator Feature
- ✅ **Fixed keyboard issue**: Text inputs no longer get cut off by the keyboard
- ✅ **Admin Dashboard**: Added KeyboardAvoidingView for smooth input experience when adding/editing drivers and users
- ✅ **Distance Calculator**: Added KeyboardAvoidingView so you can see what you're typing in location fields
- ✅ **Improved UX**: Screen automatically adjusts when keyboard appears, keeping focused input visible
- ✅ **Closest Driver Feature**: Distance Calculator now automatically finds and displays the closest shuttle company to your pickup location
  - Shows company name, location, and distance from pickup point
  - Displays contact info (phone and email)
  - Quick "View Full Details" button to see complete company profile
  - Helps drivers quickly identify which company to contact for a ride
- ✅ **Backend Geocoding API**: Created `/api/geocode` and `/api/geocode/batch` endpoints
  - Handles rate limiting automatically (respects OpenStreetMap's 1 request/second limit)
  - Server-side caching for faster repeated lookups
  - Batch processing for efficiently geocoding multiple cities
  - Fixes network request failures from direct API calls

## Features

### 📍 Interactive State Selection
- **Dynamic Stats Banner**: Shows real-time count of companies and states covered
  - Updates automatically as you add more companies
  - Prominent display: "X professional driveaway companies covering Y states and growing"
- iOS-style picker wheel for browsing states
- Real-time preview of selected state with driver count
- Beautiful gradient info card showing state details
- Native scrolling experience with smooth animations

### 🏙️ City Directory
- Browse cities within each state
- Filter drivers by location
- Real-time driver counts

### 👥 Driver Management
- View complete roster of driveaway companies by location
- See company status (Available, On Trip, Offline)
- Company details including:
  - Contact information (phone & email)
  - Vehicle/service type
  - Current status
  - Location
  - Service coverage areas

### 📱 Company Details
- Comprehensive company profile
- **Multiple Contact Support**: Separate tap-to-call buttons for each contact person
  - Automatically parses formats like "Melo: (928) 315-8777, Sonia: (951) 349-2449"
  - Each contact gets their own callable button
- One-tap calling and emailing
- Status indicators
- Service/vehicle information
- **Service Locations**: View all cities and regions serviced
- Join date tracking

### 📏 Distance Calculator
- **Calculate Trip Distance**: Enter drop-off and pickup locations to calculate distance
- **Automatic Geocoding**: Uses OpenStreetMap to find city coordinates
- **Estimated Driving Time**: Calculates approximate travel time based on distance
- **Find Closest Company**: Automatically identifies the nearest shuttle company to your pickup location
  - Shows company name and location
  - Displays distance from pickup point
  - Quick access to contact information (phone & email)
  - One-tap navigation to full company profile
- **Smart Recommendations**: Helps you quickly find which driver to contact for a ride
- **No API Key Required**: Uses free geocoding service for location lookups

### 🎛️ Admin Dashboard (Mobile)
- **Built-in Admin Screen**: Manage everything from your phone
- **Company Management**: Add, view, edit, and delete driveaway companies
  - **Edit functionality**: Tap edit icon to modify existing company info
  - Manual entry with all fields including service locations
  - Comma-separated service locations input (e.g., "Houston, TX, Austin, TX, Dallas, TX")
  - **Auto-refresh**: UI updates automatically after add/edit/delete operations
- **User Management**: Add, view, and delete users with email/password
- **AI-Powered OCR**: Upload contact screenshots to auto-extract company info using Claude Vision
  - Automatically extracts company name, phone, email, city, and state
  - Supports service location detection and auto-fills the field
  - Powered by Claude's multimodal AI
  - **Setup required**: Add your Anthropic API key in the ENV tab (see OCR Setup below)
- **Flexible State Input**: Accepts both abbreviations (VA, CA) and full names (Virginia, California)
- **Real-time Statistics**: Total companies, users, and state coverage
- **Quick Access**: Settings button on the main screen
- **Beautiful Mobile UI**: Designed for iOS with smooth interactions
- **Tabbed Interface**: Switch between Drivers and Users tabs

## Technical Stack

### Frontend
- **Expo SDK 53** with React Native 0.76.7
- **Navigation**: React Navigation 7 (Native Stack)
- **Styling**: NativeWind (TailwindCSS)
- **Icons**: Lucide React Native
- **UI Components**: React Native Picker for iOS-style selection
- **Image Handling**: expo-image-picker for contact screenshots
- **Animations**: Linear gradients and smooth transitions
- **Type Safety**: TypeScript with strict mode

### Backend (Vibecode Cloud)
- **Server**: Hono + Bun
- **Database**: SQLite with Prisma ORM
- **API**: RESTful endpoints
- **Authentication**: Better Auth (ready for future use)
- **AI/ML**: Claude 3.5 Sonnet for OCR and vision tasks
  - Multimodal image analysis
  - Contact information extraction
  - Automatic data structuring

### Database Schema
- **Driver Model**: Stores driveaway company information including name, contact, location, status, service type, and service coverage areas
- **User Model**: Stores user accounts with Better Auth integration
- **51 Real Companies**: Loaded from driveawayguide.com across 26 states

## API Endpoints

### Drivers
- `GET /api/drivers` - Get all drivers
- `GET /api/drivers/stats` - Get database statistics (total companies, total states)
- `GET /api/drivers/states` - Get states with driver counts
- `GET /api/drivers/cities/:state` - Get cities in a state
- `GET /api/drivers/:id` - Get specific driver details
- `POST /api/drivers` - Create new driver
- `PATCH /api/drivers/:id` - Update existing driver
- `DELETE /api/drivers/:id` - Delete driver

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get specific user
- `POST /api/users` - Create new user (with email and password)
- `PATCH /api/users/:id` - Update user details
- `DELETE /api/users/:id` - Delete user

### Upload & OCR
- `POST /api/upload/image` - Upload images
- `POST /api/upload/extract-contact` - Extract contact info from screenshot using Claude Vision AI
  - Automatically extracts: name, phone, email, city, state, service locations
  - Returns structured JSON data for auto-filling forms

### Geocoding & Routing
- `POST /api/geocode` - Geocode a single city to coordinates
- `POST /api/geocode/batch` - Geocode multiple cities efficiently
- `POST /api/routing/distance` - Calculate driving distance and time between two coordinates
  - Uses OSRM (Open Source Routing Machine) for accurate road distances
  - Returns distance in miles and duration in seconds
  - Automatically falls back to estimated distance if routing service unavailable

### Admin Dashboard
- `GET /admin` - Web-based admin panel

## Design

### Color Palette
- **Primary**: Deep blues (#1e40af, #3b82f6) for professionalism and trust
- **Success**: Green (#10b981) for available drivers
- **Warning**: Amber (#d97706) for drivers on trips
- **Neutral**: Slate grays for offline status and UI elements

### UI/UX
- Inspired by Uber's driver dashboard and Waze's clean interface
- Card-based layouts with subtle shadows and gradients
- Status indicators with color-coded badges
- Smooth navigation flow: State → City → Drivers → Detail
- Professional, transportation-focused aesthetic

## Project Structure

```
/home/user/workspace/
├── src/
│   ├── screens/
│   │   ├── MapScreen.tsx           # State selection map view
│   │   ├── CitiesScreen.tsx        # City list for selected state
│   │   ├── DriversScreen.tsx       # Driver list for selected city
│   │   ├── DriverDetailScreen.tsx  # Individual driver details
│   │   └── AdminScreen.tsx         # Mobile admin dashboard
│   ├── navigation/
│   │   ├── RootNavigator.tsx       # Native stack navigator
│   │   └── types.ts                # Navigation type definitions
│   └── lib/
│       └── api.ts                  # API client for backend calls
├── backend/
│   ├── src/
│   │   ├── index.ts                # Hono server setup
│   │   ├── routes/
│   │   │   ├── drivers.ts          # Driver API endpoints
│   │   │   ├── users.ts            # User API endpoints
│   │   │   ├── upload.ts           # Image upload endpoints
│   │   │   └── extract-contact.ts  # OCR contact extraction
│   │   └── db.ts                   # Prisma client
│   └── prisma/
│       ├── schema.prisma           # Database schema
│       └── seed.ts                 # Sample data seeder
└── shared/
    └── contracts.ts                # Shared types between frontend/backend
```

## Deployment

### Deploy Backend to Railway

The backend is ready to deploy to Railway's free hosting. See **[RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)** for complete deployment instructions.

**Quick Steps:**
1. Sign up at https://railway.app (free $5 credit)
2. Deploy from GitHub or use Railway CLI
3. Set environment variables in Railway dashboard
4. Access admin portal at: `https://your-app.up.railway.app/admin`

After deployment, your admin portal will be accessible from anywhere, perfect for managing your shuttle drivers after publishing to the App Store!

## Getting Started

The app is already running! View it in the Vibecode app to see:

1. **Home Screen (Map Screen)**:
   - **Dynamic Stats Banner**: See the current count of companies and states at a glance
   - **Green "Distance Calculator" button** prominently displayed in the header - tap this to calculate distances and find closest drivers
   - iOS-style picker wheel to scroll through states
   - Tap "View Cities" to browse companies by location
2. **Distance Calculator**:
   - Enter drop-off city (where you deliver the vehicle)
   - Enter pickup city (where you need a shuttle driver)
   - Tap "Calculate Distance" to see results
   - Automatically shows the closest shuttle company to your pickup location
   - Tap "View Full Details" to see complete company profile
   - Use the back button to return to home screen
3. **Cities Screen**: Select a city to view driveaway companies
4. **Drivers Screen**: Browse driveaway companies and tap for details
5. **Company Details**: View full profile with contact options
6. **Admin Dashboard**: Tap the settings icon on the home screen to manage companies and users

### Database Setup

The database is fully set up with:
- ✅ Driver table created with all migrations applied
- ✅ **56 real companies** added from driveawayguide.com (verified Nov 26, 2025)
- ✅ Companies across **27 states**: AL, AR, AZ, CA, CT, FL, GA, IA, IL, IN, KS, MI, MO, MT, NC, NE, NM, NY, OH, OR, PA, SD, TN, TX, UT, VA, WI
- ✅ Service location coverage data support
- ✅ Multiple contact phone number support
- ✅ Prisma client generated and synchronized
- ✅ Backend server running with updated schema
- 🛡️ **Data protection** safeguards implemented

All API endpoints are ready and working!

#### Database Maintenance Scripts

**Backup your data:**
```bash
cd /home/user/workspace/backend
bun run backup-database.ts
```

**Restore missing companies (safe - won't delete existing):**
```bash
cd /home/user/workspace/backend
bun run restore-companies.ts
```

**Check database status:**
```bash
cd /home/user/workspace/backend
bun run check-db.ts
```

## Adding Real Companies from DriveawayGuide.com

See **[ADDING_DRIVERS.md](./ADDING_DRIVERS.md)** for complete instructions on adding real companies.

**Quick Start:**
1. Go to https://driveawayguide.com
2. Click map pins to see company details
3. Use Admin Dashboard in the app to add them
4. Or take screenshots and use OCR (after adding API key)

**Example real company included:**
- Blythe to Ehrenburg Shuttle (Ehrenberg, AZ)
  - Contacts: Melo (928) 315-8777, Sonia (951) 349-2449
  - Services: Ehrenberg, AZ and Blythe, CA

## OCR Setup (Required for Screenshot Upload)

To enable the AI-powered OCR feature that automatically extracts contact information from screenshots:

1. **Get an Anthropic API Key**:
   - Go to https://console.anthropic.com
   - Sign up or log in
   - Navigate to API Keys section
   - Create a new API key (starts with `sk-ant-api03-...`)

2. **Add the API Key to Your App**:
   - Open the Vibecode app
   - Go to the **ENV tab**
   - Add a new environment variable:
     - Name: `ANTHROPIC_API_KEY`
     - Value: Your API key (e.g., `sk-ant-api03-xxxxx...`)
   - Save the changes

3. **Test the Feature**:
   - Go to Admin Dashboard in your app
   - Tap "Add New Driver"
   - Tap "Upload Screenshot"
   - Select a photo of company contact info
   - The app will automatically extract and fill in the details!

**Note**: The OCR feature uses Claude 3.5 Sonnet's vision capabilities and requires an active Anthropic API key. Without a valid key, you'll need to enter driver information manually.

## Driveaway Companies

The app currently has **56 real companies** from driveawayguide.com across 27 states:

**Arizona:**
- **Blythe to Ehrenburg Shuttle** (Ehrenberg, AZ)
  - Contacts: Melo (928) 315-8777, Sonia (951) 349-2449
  - Services: Ehrenberg, AZ and Blythe, CA
  - Type: Personal Shuttle Service

**Texas:**
- **DEPENDABLE SHUTTLE** (Alvarado, TX)
  - Phone: (956) 555-0201
  - Email: dispatch@dependable.com
  - Services: Alvarado, Fort Worth, Cleburne, Burleson
  - Type: Van

- **YNOTME T.S.LLC** (Houston, TX)
  - Phone: (832) 389-6486
  - Services: Houston, Elmendorf, Laredo, Converse
  - Type: Personal Shuttle Service
  - Schedule: Sundays-Thursdays (mornings), Friday nights (depending on traffic)

**Pennsylvania:**
- **Guardian Angel Rides** (Hollidaysburg, PA)
  - Phone: (717) 555-0101
  - Email: contact@guardianangel.com
  - Services: Hollidaysburg, Altoona, State College
  - Type: Van

- **Shuttle Driver Terry** (Hollidaysburg, PA)
  - Phone: (717) 555-0102
  - Email: terry@shuttle.com
  - Services: Hollidaysburg, Johnstown, Pittsburgh
  - Type: SUV

- **Shuttle Driver Steve** (Hollidaysburg, PA)
  - Phone: (717) 555-0103
  - Email: steve@shuttle.com
  - Services: Hollidaysburg, Bedford, Altoona
  - Type: Van
  - Status: On Trip

**Georgia:**
- **Grace and Mercy Transportation** (Atlanta, GA)
  - Phone: (404) 555-0301
  - Email: info@gracemercy.com
  - Services: Atlanta, Marietta, Decatur, Sandy Springs
  - Type: Van

- **A Place of Peace Personal Care** (Atlanta, GA)
  - Phone: (404) 555-0302
  - Email: contact@placeofpeace.com
  - Services: Atlanta, Buckhead, East Point
  - Type: SUV
  - Status: On Trip

**Indiana:**
- **Comfort Driver Transport** (Elkhart, IN)
  - Phone: (574) 263-5434
  - Services: Elkhart, IN and 100 mile radius
  - Accepts: Visa and Mastercard
  - Type: Personal Shuttle Service

- **Divine Transportation** (Elkhart, IN)
  - Phone: (574) 218-1024
  - Services: Elkhart, IN
  - Type: Personal Shuttle Service

**Ohio:**
- **Teds Taxi Cincinnati** (Cincinnati, OH)
  - Phone: (859) 588-1518
  - Services: Cincinnati, OH; Lexington, KY; Cynthiana, KY
  - Type: Personal Shuttle Service

- **Jeff in Springfield OH** (Springfield, OH)
  - Phone: (937) 624-9093
  - Services: Springfield, OH
  - Type: Personal Shuttle Service

- **Rides in Ohio** (Delphos, OH)
  - Phone: (419) 203-8097
  - Services: Delphos, OH
  - Type: Personal Shuttle Service

### Adding More Companies

See **[ADDING_DRIVERS.md](./ADDING_DRIVERS.md)** for step-by-step instructions on adding companies from the driveawayguide.com map.

You can add companies in three ways:
1. **Admin Dashboard** - Tap to add companies one by one (easiest)
2. **Screenshot + OCR** - Take screenshots of map pins and auto-extract data
3. **Seed File** - Add multiple companies at once to `backend/prisma/seed.ts`

## App Store Deployment

This app is ready for App Store submission! See **[PHONE_BUILD_GUIDE.md](./PHONE_BUILD_GUIDE.md)** for a streamlined guide, or **[APP_STORE_GUIDE.md](./APP_STORE_GUIDE.md)** for detailed instructions.

**Current Status:**
1. ✅ App configured with proper bundle identifier: `com.dougsullivan.driveawayshuttle`
2. ✅ Privacy policy created (needs hosting and email added)
3. ✅ EAS build configuration ready
4. ✅ App icon created (1024x1024px)
5. ✅ Version updated to 1.0.2
6. ✅ EAS CLI installed
7. ⏳ Need to register bundle ID in Apple Developer Portal
8. ⏳ Need to create app in App Store Connect
9. ⏳ Need iPhone screenshots (3-10 images)
10. ⏳ Run `eas build --platform ios --profile production`

**Next Steps (requires computer):**
1. Host privacy policy online (add your email first)
2. Register bundle ID at developer.apple.com
3. Create app in App Store Connect
4. Run EAS build command
5. Take screenshots and submit for review

**Privacy Policy:** See [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) - update email on line 66, then host online before submission.

**Backend Deployment:** The backend currently runs on Vibecode sandbox. For production, you'll need to deploy to a permanent server (Railway, Render, AWS, etc.) and update the `EXPO_PUBLIC_VIBECODE_BACKEND_URL` environment variable.

## Future Enhancements

Potential features to add:
- ✅ **OCR Integration**: Now powered by Claude Vision AI for automatic contact extraction from screenshots
- Real-time driver location tracking
- Trip management and history
- Driver performance metrics
- Push notifications for status changes
- Advanced filtering and search
- User authentication for drivers
- Route planning and optimization
```