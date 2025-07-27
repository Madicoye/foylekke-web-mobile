/**
 * Utility functions for handling images from backend responses
 */

import { getPlaceTypeConfig } from '../config/placeTypes';

/**
 * Extract image URLs from backend response
 * Backend returns images as array of objects: [{url: "string", caption: "string", isDefault: boolean}]
 * Frontend expects array of strings: ["url1", "url2"]
 */
export const getImageUrls = (place) => {
  if (!place?.images) return [];
  
  // If images is an array of objects with url property
  if (Array.isArray(place.images) && place.images.length > 0) {
    if (typeof place.images[0] === 'object' && place.images[0].url) {
      const validImages = place.images
        .filter(img => img.url && isValidImageUrl(img.url)) // Filter out invalid URLs
        .map(img => img.url);
      
      // Debug logging
      if (place.images.length > 0 && validImages.length === 0) {
        console.log(`🔍 Place "${place.name}" has ${place.images.length} images but none are valid:`, place.images);
      }
      
      return validImages;
    }
    // If images is already an array of strings
    if (typeof place.images[0] === 'string') {
      const validImages = place.images.filter(url => isValidImageUrl(url)); // Filter out invalid URLs
      
      // Debug logging
      if (place.images.length > 0 && validImages.length === 0) {
        console.log(`🔍 Place "${place.name}" has ${place.images.length} images but none are valid:`, place.images);
      }
      
      return validImages;
    }
  }
  
  return [];
};

/**
 * Check if an image URL is valid and not a placeholder
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Filter out common Google API placeholder/broken images
  const invalidPatterns = [
    'maps.googleapis.com/maps/api/place/photo?maxwidth=1&', // Invalid maxwidth
    'googleusercontent.com/places/no-photo', // No photo placeholder
    'maps.gstatic.com/tactile/pane/default', // Default tactile image
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP', // Empty gif
    'placeholder', // Generic placeholder
    'no-image', // No image indicator
    '1x1.png', // 1x1 pixel images
    'blank.gif', // Blank images
    'maps.googleapis.com/maps/api/place/photo?maxwidth=0', // Zero width
    'maps.googleapis.com/maps/api/place/photo?maxheight=0', // Zero height
    'maps.googleapis.com/maps/api/place/photo?maxwidth=1', // One pixel width
    'maps.googleapis.com/maps/api/place/photo?maxheight=1', // One pixel height
    'maps.googleapis.com/maps/api/place/photo?photoreference=', // Empty photo reference
    'maps.googleapis.com/maps/api/place/photo?key=', // Empty API key
    'maps.googleapis.com/maps/api/place/photo?', // Just the base URL without parameters
    'maps.googleapis.com/maps/api/place/photo', // Just the base URL
    'maps.googleapis.com/maps/api/place', // Just the place API base
    'maps.googleapis.com/maps/api', // Just the maps API base
    'maps.googleapis.com/maps', // Just the maps base
    'maps.googleapis.com', // Just the Google APIs base
    'googleusercontent.com/places', // Places without photo
    'googleusercontent.com/place', // Place without photo
    'googleusercontent.com', // Just Google user content without photo
    'maps.gstatic.com/tactile', // Tactile maps
    'maps.gstatic.com', // Static maps without proper image
    'gstatic.com', // Static content without proper image
    'googleapis.com/maps/api/place/photo?maxwidth=1', // One pixel width
    'googleapis.com/maps/api/place/photo?maxheight=1', // One pixel height
    'googleapis.com/maps/api/place/photo?maxwidth=0', // Zero width
    'googleapis.com/maps/api/place/photo?maxheight=0', // Zero height
    'googleapis.com/maps/api/place/photo?photoreference=', // Empty photo reference
    'googleapis.com/maps/api/place/photo?key=', // Empty API key
    'googleapis.com/maps/api/place/photo?', // Just the base URL without parameters
    'googleapis.com/maps/api/place/photo', // Just the base URL
    'googleapis.com/maps/api/place', // Just the place API base
    'googleapis.com/maps/api', // Just the maps API base
    'googleapis.com/maps', // Just the maps base
    'googleapis.com', // Just the Google APIs base
  ];
  
  // Check for invalid patterns
  if (invalidPatterns.some(pattern => url.includes(pattern))) {
    return false;
  }
  
  // Check for valid image extensions or Google image URLs
  const validPatterns = [
    /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i, // Image extensions
    /googleusercontent\.com\/.*\/photo.*maxwidth=[2-9]/i, // Valid Google photos with proper width
    /maps\.googleapis\.com\/maps\/api\/place\/photo.*maxwidth=[2-9]/i, // Valid Google API with proper width
    /maps\.googleapis\.com\/maps\/api\/place\/photo.*maxheight=[2-9]/i, // Valid Google API with proper height
    /maps\.googleapis\.com\/maps\/api\/place\/photo.*photoreference=[a-zA-Z0-9_-]+/i, // Valid Google API with photo reference
    /maps\.googleapis\.com\/maps\/api\/place\/photo.*key=[a-zA-Z0-9_-]+/i, // Valid Google API with API key
  ];
  
  return validPatterns.some(pattern => pattern.test(url));
};

/**
 * Get the first valid image URL from a place
 */
export const getFirstImageUrl = (place) => {
  const imageUrls = getImageUrls(place);
  return imageUrls.length > 0 ? imageUrls[0] : null;
};

/**
 * Get image caption if available
 */
export const getImageCaption = (place, index = 0) => {
  if (!place?.images || !Array.isArray(place.images) || index >= place.images.length) {
    return null;
  }
  
  const image = place.images[index];
  if (typeof image === 'object' && image.caption) {
    return image.caption;
  }
  
  return null;
};

/**
 * Get default image configuration for a place type
 */
export const getDefaultImageConfig = (placeType) => {
  const config = getPlaceTypeConfig(placeType);
  return {
    icon: config?.icon || '📍',
    gradient: 'from-primary-100 to-accent-100',
    color: config?.color || 'bg-gray-500'
  };
};

/**
 * Create an image error handler that shows default image
 */
export const createImageErrorHandler = (placeType, onError) => {
  return (event) => {
    const img = event.target;
    const fallbackDiv = img.nextElementSibling;
    
    // Hide the broken image
    img.style.display = 'none';
    
    // Show the fallback div if it exists
    if (fallbackDiv && fallbackDiv.classList.contains('fallback-image')) {
      fallbackDiv.style.display = 'flex';
    }
    
    // Call custom error handler if provided
    if (onError) {
      onError(event);
    }
    
    console.warn(`Image failed to load, showing default for place type: ${placeType}`);
  };
};

/**
 * Check if a place has valid images
 */
export const hasValidImages = (place) => {
  const imageUrls = getImageUrls(place);
  return imageUrls.length > 0;
};

/**
 * Get fallback image URL for a place type (if you have default images stored)
 */
export const getFallbackImageUrl = (placeType) => {
  const fallbackImages = {
    'restaurant': '/images/defaults/restaurant-placeholder.jpg',
    'cafe': '/images/defaults/cafe-placeholder.jpg',
    'bar': '/images/defaults/bar-placeholder.jpg',
    'hotel': '/images/defaults/hotel-placeholder.jpg',
    'museum': '/images/defaults/museum-placeholder.jpg',
    'park': '/images/defaults/park-placeholder.jpg',
    'shopping_mall': '/images/defaults/shopping-placeholder.jpg'
    // Add more as needed
  };
  
  return fallbackImages[placeType] || '/images/defaults/place-placeholder.jpg';
};

/**
 * Preload an image and return a promise
 */
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    if (!isValidImageUrl(url)) {
      reject(new Error('Invalid image URL'));
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}; 