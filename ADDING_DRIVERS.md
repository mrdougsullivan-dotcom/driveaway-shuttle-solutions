# Adding Real Driveaway Companies

All fake data has been removed! Here's how to add real companies from driveawayguide.com:

## Method 1: Using Admin Dashboard (Easiest)

1. **Open your app** and go to **Admin Dashboard**
2. Tap **"Add New Driver"**
3. Go to https://driveawayguide.com on your computer/phone
4. Click on a **map pin** to see company details
5. **Fill in the form** with the info from the pin:

### Form Fields:

| Field | Example | Notes |
|-------|---------|-------|
| **Name** | "Blythe to Ehrenburg Shuttle" | Exact name from map pin |
| **Phone** | "Melo: (928) 315-8777, Sonia: (951) 349-2449" | All contact numbers |
| **Email** | Leave blank if not shown | Optional |
| **State** | "AZ" | Use 2-letter code |
| **City** | "Ehrenberg" | Primary city |
| **Status** | "Available" | Usually available |
| **Vehicle Type** | "Personal Shuttle Service" | From pin description |
| **Service Locations** | "Ehrenberg, AZ, Blythe, CA" | Comma-separated |

6. Tap **"Add Driver"** - Done! ✅

## Method 2: Taking Screenshots (With OCR Setup)

If you have an Anthropic API key set up:

1. Go to driveawayguide.com map
2. Take a **screenshot of the map pin popup** (like the images you showed me)
3. In Admin Dashboard, tap **"Upload Screenshot"**
4. Select your screenshot
5. The app will auto-fill most fields! Just verify and submit

## Method 3: Bulk Add via Seed File

For adding many companies at once:

1. Open `/home/user/workspace/backend/prisma/seed.ts`
2. Copy this template for each company:

```typescript
{
  name: "Company Name from Pin",
  phoneNumber: "(XXX) XXX-XXXX or Name: (XXX) XXX-XXXX",
  email: "email@domain.com", // Leave "" if none
  state: "STATE", // 2-letter code
  city: "City Name",
  status: "available" as const,
  vehicleType: "Van/SUV/Bus/Personal Shuttle",
  serviceLocations: JSON.stringify(["City1, State", "City2, State"])
},
```

3. Add to the `realDrivers` array
4. Run: `bun run prisma/seed.ts`

## Tips for Finding Companies

1. **Use the map on driveawayguide.com** - most detailed
2. **Look for red pins** - those are driveaway companies
3. **Click each pin** to see full details
4. **Check multiple states** - companies often service multiple areas
5. **Note service areas** - some pins show routes (e.g., "Blythe to Ehrenburg")

## Current Status

- ✅ Fake data removed
- ✅ 1 real company added (Blythe to Ehrenburg Shuttle)
- ✅ Admin Dashboard ready to add more
- ✅ OCR ready (once you add API key)

**Ready to add real driveaway companies!** 🚗
