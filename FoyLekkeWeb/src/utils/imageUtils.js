/**
 * Utility functions for handling images from backend responses
 */

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
      return place.images.map(img => img.url);
    }
    // If images is already an array of strings
    if (typeof place.images[0] === 'string') {
      return place.images;
    }
  }
  
  return [];
};

/**
 * Get the first image URL from a place
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