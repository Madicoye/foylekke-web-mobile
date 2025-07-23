// Configuration for cuisine types
export const cuisineTypeConfig = {
  senegalese: {
    name: 'Senegalese',
    icon: '🇸🇳',
    color: 'bg-green-500',
    description: 'Traditional Senegalese cuisine'
  },
  french: {
    name: 'French',
    icon: '🇫🇷',
    color: 'bg-blue-500',
    description: 'Classic French cuisine'
  },
  lebanese: {
    name: 'Lebanese',
    icon: '🇱🇧',
    color: 'bg-red-500',
    description: 'Authentic Lebanese dishes'
  },
  italian: {
    name: 'Italian',
    icon: '🇮🇹',
    color: 'bg-red-600',
    description: 'Traditional Italian cuisine'
  },
  moroccan: {
    name: 'Moroccan',
    icon: '🇲🇦',
    color: 'bg-orange-500',
    description: 'Moroccan specialties'
  },
  indian: {
    name: 'Indian',
    icon: '🇮🇳',
    color: 'bg-yellow-500',
    description: 'Spicy Indian cuisine'
  },
  chinese: {
    name: 'Chinese',
    icon: '🇨🇳',
    color: 'bg-red-700',
    description: 'Authentic Chinese dishes'
  },
  american: {
    name: 'American',
    icon: '🇺🇸',
    color: 'bg-blue-600',
    description: 'American classics'
  },
  african: {
    name: 'African',
    icon: '🌍',
    color: 'bg-green-600',
    description: 'Pan-African cuisine'
  },
  seafood: {
    name: 'Seafood',
    icon: '🐟',
    color: 'bg-blue-400',
    description: 'Fresh seafood dishes'
  },
  vegetarian: {
    name: 'Vegetarian',
    icon: '🥗',
    color: 'bg-green-400',
    description: 'Vegetarian options'
  },
  fast_food: {
    name: 'Fast Food',
    icon: '🍔',
    color: 'bg-yellow-600',
    description: 'Quick service meals'
  },
  cafe: {
    name: 'Café',
    icon: '☕',
    color: 'bg-amber-600',
    description: 'Coffee and light meals'
  },
  bakery: {
    name: 'Bakery',
    icon: '🥖',
    color: 'bg-orange-400',
    description: 'Fresh baked goods'
  },
  international: {
    name: 'International',
    icon: '🌐',
    color: 'bg-purple-500',
    description: 'International fusion'
  }
};

// Get all cuisine types
export const getAllCuisineTypes = () => {
  return Object.keys(cuisineTypeConfig);
};

// Get cuisine type configuration
export const getCuisineTypeConfig = (type) => {
  return cuisineTypeConfig[type] || null;
};

// Get all cuisine types with their configurations
export const getCuisineTypeConfigs = () => {
  return cuisineTypeConfig;
};

// Common cuisine types for Senegal (most popular first)
export const getPopularCuisineTypes = () => {
  return [
    'senegalese',
    'french',
    'lebanese',
    'seafood',
    'african',
    'moroccan',
    'italian',
    'fast_food',
    'cafe',
    'international'
  ];
}; 