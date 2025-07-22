# Demo Ads Guide

## Overview
The demo ads feature allows you to see sample advertisements in different placements throughout the Foy Lekke app without needing real ad data from the backend.

## How to Use Demo Mode

### 1. Enable/Disable Demo Mode
- Look for the **Demo Mode Toggle** in the navigation bar
- Click the toggle button to switch between demo and live mode
- When enabled, you'll see "Demo Ads ON" with a blue sparkle icon
- When disabled, you'll see "Demo Ads OFF" with an eye icon

### 2. Where Demo Ads Appear

#### Homepage
- **Hero Section**: Large banner ads after the main hero content
- **Between Sections**: Medium-sized ads between different content sections
- **Native Ads**: Content-style ads that blend with the page content

#### Places Page
- **Places List**: Ads appear every 6 places in grid view, every 3 in list view
- **Sponsored Places**: Special place cards with "SPONSORED" badges and enhanced styling
- **Banner Ads**: Regular banner advertisements in the content flow

#### Ad Types in Demo Mode

1. **Banner Ads**
   - Restaurant promotions (Teranga Restaurant)
   - Tourist attractions (Goree Island)
   - Shopping centers (Dakar Shopping Center)

2. **Sponsored Places**
   - Featured restaurants (Chez Loutcha)
   - Premium hotels (Radisson Blu Hotel Dakar)
   - Enhanced with golden "SPONSORED" badges

3. **Native Ads**
   - Tourism services (Senegal Discovery Tours)
   - Blend naturally with content

### 3. Demo Mode Features

#### Visual Indicators
- Blue "Demo Mode" indicator appears at the top of ad sections
- Sponsored places have special golden badges
- All ads show "Sponsored" labels

#### Interaction Tracking
- Clicks and impressions are tracked in the browser console
- Look for messages like "📊 Demo: Tracked impression for ad demo-banner-1"
- Click tracking shows "🖱️ Demo: Tracked click for ad demo-banner-1"

#### Realistic Data
- All demo ads include realistic Senegalese businesses and locations
- Proper targeting by region (Dakar, Saint-Louis, etc.)
- Authentic place types (restaurants, hotels, tourist attractions)
- Real-looking metrics (impressions, clicks, CTR)

### 4. Testing Different Scenarios

#### By Page
- **Homepage**: Visit `/` to see hero and section ads
- **Places Page**: Visit `/places` to see list and sponsored place ads
- **Filter by Region**: Use filters to see region-specific ads

#### By Placement
- `homepage_hero`: Large banner ads on homepage
- `homepage_between_sections`: Medium ads between content sections
- `places_list`: Ads integrated into places listings

### 5. Development Usage

#### For Developers
```javascript
import { isDemoMode, enableDemoMode, disableDemoMode } from './services/demoAds';

// Check if demo mode is active
if (isDemoMode()) {
  console.log('Demo mode is active');
}

// Programmatically enable/disable
enableDemoMode();
disableDemoMode();
```

#### For Designers
- Use demo mode to see how ads integrate with the UI
- Test different ad sizes and placements
- Verify sponsored content styling and badges

### 6. Default Behavior
- Demo mode is **enabled by default** for new users
- This allows immediate visualization of ad placements
- Users can disable it via the toggle if they prefer
- Setting is remembered in localStorage

### 7. Switching to Live Mode
- Toggle demo mode OFF to use real backend ads
- If no real ads are available, Google AdSense fallback is shown
- Real ad tracking will use the actual backend API

## Benefits of Demo Mode

1. **Immediate Visualization**: See ad placements without backend setup
2. **Design Testing**: Test UI/UX with realistic ad content
3. **Client Demonstrations**: Show ad capabilities to stakeholders
4. **Development Speed**: No need to create real ads for testing
5. **Realistic Content**: Senegal-specific businesses and locations

## Console Logging
When demo mode is active, you'll see helpful logs:
- `🎭 Demo mode enabled - showing sample ads`
- `📊 Demo: Tracked impression for ad [id]`
- `🖱️ Demo: Tracked click for ad [id]`

This helps developers understand ad interaction flow and debug issues. 