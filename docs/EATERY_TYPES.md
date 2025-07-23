# Eatery Types in Foy Lekke

## Overview

Foy Lekke's "restaurant" category includes eateries based on **confirmed Google Places API types**. This document outlines the official eatery types that are automatically classified as "restaurants" in our system.

## 🍽️ Confirmed Google Places API Eatery Types

### **General Categories**
- `restaurant` - General restaurants
- `food` - Food establishments
- `meal_takeaway` - Takeaway restaurants
- `bakery` - Bakeries
- `fast_food` - Fast food restaurants
- `cafe` - Cafés
- `bar` - Bars

### **Specific Cuisine Types**

#### **Asian Cuisines**
- `chinese_restaurant` - Chinese restaurants
- `japanese_restaurant` - Japanese restaurants
- `indian_restaurant` - Indian restaurants
- `thai_restaurant` - Thai restaurants
- `korean_restaurant` - Korean restaurants
- `asian_restaurant` - General Asian restaurants

#### **European Cuisines**
- `italian_restaurant` - Italian restaurants
- `french_restaurant` - French restaurants
- `greek_restaurant` - Greek restaurants
- `spanish_restaurant` - Spanish restaurants
- `portuguese_restaurant` - Portuguese restaurants
- `european_restaurant` - General European restaurants

#### **American & Latin Cuisines**
- `mexican_restaurant` - Mexican restaurants
- `brazilian_restaurant` - Brazilian restaurants
- `american_restaurant` - American restaurants
- `latin_american_restaurant` - Latin American restaurants

#### **African & Middle Eastern Cuisines**
- `lebanese_restaurant` - Lebanese restaurants
- `turkish_restaurant` - Turkish restaurants
- `african_restaurant` - African restaurants
- `caribbean_restaurant` - Caribbean restaurants
- `mediterranean_restaurant` - Mediterranean restaurants
- `middle_eastern_restaurant` - Middle Eastern restaurants

#### **Specialty Restaurants**
- `pizza_restaurant` - Pizza restaurants
- `seafood_restaurant` - Seafood restaurants
- `fusion_restaurant` - Fusion restaurants

## 🏷️ Cuisine Classification

When an eatery is synced, it's automatically classified with specific cuisine types:

```javascript
// Examples of cuisine mapping
'pizza_restaurant' → ['italian']
'chinese_restaurant' → ['chinese']
'fast_food' → ['fast_food']
'cafe' → ['coffee']
'bar' → ['bar']
```

## 📚 Source

All types are from the **official Google Places API documentation**:
- **Source**: https://developers.google.com/maps/documentation/places/web-service/supported_types
- **Status**: Confirmed to work with Google Places API
- **Coverage**: Comprehensive but limited to official types

## ⚠️ Important Note

Some eatery types that might seem logical (like `ice_cream_shop`, `dessert_shop`, `food_truck`, etc.) are **not official Google Places API types** and were removed to ensure compatibility.

## 🔍 Search & Filtering

All these eatery types can be:
- **Searched** using the general "restaurant" category
- **Filtered** by specific cuisine types
- **Displayed** with appropriate icons and descriptions
- **Reviewed** and rated by users

## 📊 Data Extraction

For each eatery, the system extracts:
- **Basic Info**: Name, address, phone, website
- **Ratings**: Google ratings and review counts
- **Photos**: Up to 5 images from Google Places
- **Hours**: Opening hours (if available)
- **Price Level**: Low, medium, or high
- **Cuisine Type**: Specific cuisine classification
- **Features**: Delivery, takeout, outdoor seating, etc.

## 🚀 Usage Examples

### **Sync All Eateries in Dakar**
```bash
npm run sync-places "Dakar" 100
```

### **Search for Specific Types**
```javascript
// Find all Italian restaurants
GET /api/places?cuisine=italian

// Find all fast food
GET /api/places?cuisine=fast_food

// Find all Asian restaurants
GET /api/places?cuisine=asian
```

## 🌍 Regional Coverage

The system covers eateries across all 14 Senegal regions:
- Dakar, Thiès, Saint-Louis, Ziguinchor
- Kaolack, Louga, Fatick, Kolda
- Matam, Kaffrine, Tambacounda, Kédougou
- Sédhiou, Diourbel

## 📈 Benefits

1. **Official Compatibility**: Uses only confirmed Google Places API types
2. **Accurate Classification**: Proper cuisine type detection
3. **User-Friendly**: Easy to search and filter
4. **Reliable**: No risk of API errors from non-standard types
5. **Comprehensive**: Covers major cuisine types and categories

## 🔧 Technical Implementation

The eatery classification happens in:
- `services/placesSync.js` - During sync process
- `models/placeTypes/index.js` - Type definitions
- `models/Place.js` - Database schema

All eatery types are stored in the same `Place` collection with `type: 'restaurant'` and specific `cuisine` arrays. 