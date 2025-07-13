// Configuration for place types - enable/disable as needed
export const placeTypeConfig = {
  restaurant: {
    enabled: true,
    name: 'Restaurants',
    icon: '🍽️',
    color: 'bg-red-500',
    description: 'Discover amazing restaurants and dining experiences'
  },
  park: {
    enabled: false,
    name: 'Parks',
    icon: '🌳',
    color: 'bg-green-500',
    description: 'Beautiful parks and outdoor spaces'
  },
  museum: {
    enabled: false,
    name: 'Museums',
    icon: '🏛️',
    color: 'bg-blue-500',
    description: 'Cultural museums and art galleries'
  },
  shopping_center: {
    enabled: false,
    name: 'Shopping Centers',
    icon: '🛍️',
    color: 'bg-purple-500',
    description: 'Shopping malls and retail centers'
  },
  hotel: {
    enabled: false,
    name: 'Hotels',
    icon: '🏨',
    color: 'bg-yellow-500',
    description: 'Hotels and accommodation'
  },
  cafe: {
    enabled: false,
    name: 'Cafes',
    icon: '☕',
    color: 'bg-orange-500',
    description: 'Coffee shops and cafes'
  },
  bar: {
    enabled: false,
    name: 'Bars',
    icon: '🍺',
    color: 'bg-pink-500',
    description: 'Bars and nightlife venues'
  },
  entertainment: {
    enabled: false,
    name: 'Entertainment',
    icon: '🎭',
    color: 'bg-indigo-500',
    description: 'Entertainment venues and theaters'
  },
  cultural: {
    enabled: false,
    name: 'Cultural',
    icon: '🎨',
    color: 'bg-teal-500',
    description: 'Cultural centers and venues'
  },
  sports: {
    enabled: false,
    name: 'Sports',
    icon: '⚽',
    color: 'bg-emerald-500',
    description: 'Sports facilities and gyms'
  },
  other: {
    enabled: false,
    name: 'Other',
    icon: '📍',
    color: 'bg-gray-500',
    description: 'Other interesting places'
  }
};

// Get only enabled place types
export const getEnabledPlaceTypes = () => {
  return Object.entries(placeTypeConfig)
    .filter(([key, config]) => config.enabled)
    .map(([key, config]) => key);
};

// Get all place type configurations (enabled and disabled)
export const getAllPlaceTypeConfigs = () => {
  return placeTypeConfig;
};

// Get configuration for a specific place type
export const getPlaceTypeConfig = (type) => {
  return placeTypeConfig[type] || null;
};

// Check if a place type is enabled
export const isPlaceTypeEnabled = (type) => {
  return placeTypeConfig[type]?.enabled || false;
};

// Get enabled place types with their full configuration
export const getEnabledPlaceTypeConfigs = () => {
  return Object.entries(placeTypeConfig)
    .filter(([key, config]) => config.enabled)
    .reduce((acc, [key, config]) => {
      acc[key] = config;
      return acc;
    }, {});
}; 