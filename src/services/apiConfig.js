import { Capacitor } from '@capacitor/core';

// Get the platform (web, ios, or android)
const platform = Capacitor.getPlatform();

// Helper to determine if we're running in a mobile app
const isMobileApp = platform === 'ios' || platform === 'android';

// Helper to get your machine's local IP address
const getLocalIP = () => {
  // Replace this with your actual machine's IP address
  return '192.168.1.5'; // Your development machine's IP
};

// Helper to determine if we're in development
const isDevelopment = () => {
  // Force development mode for now
  return true;
  
  // Original logic (uncomment later)
  // if (process.env.NODE_ENV === 'development') return true;
  // if (isMobileApp) {
  //   const host = window.location.hostname;
  //   return host === 'localhost' || host.startsWith('192.168.') || host === '10.0.2.2';
  // }
  // return false;
};

// Helper to get the appropriate API URL based on environment
const getApiUrl = () => {
  // Force development mode
  if (isDevelopment()) {
    // For mobile apps in development
    if (isMobileApp) {
      const localIP = getLocalIP();
      
      if (platform === 'android') {
        // For Android emulator
        if (window.location.hostname === 'localhost') {
          return 'http://10.0.2.2:9999';
        }
        // For real Android device
        return `http://${localIP}:9999`;
      }
      
      // For iOS
      if (window.location.hostname === 'localhost') {
        // For iOS simulator
        return 'http://localhost:9999';
      }
      // For real iOS device
      return `http://${localIP}:9999`;
    }
    
    // For web development
    return 'http://localhost:9999';
  }

  // In production
  return 'https://api.foylekke.com';
};

// API Configuration
export const apiConfig = {
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // Increased timeout for mobile networks (30 seconds)
  withCredentials: true,
};

// Add debug logging
console.log('🔧 API Configuration:', {
  platform,
  isMobileApp,
  isDevelopment: isDevelopment(),
  baseURL: getApiUrl(),
  hostname: window.location.hostname
});

// Storage configuration (use different storage methods for web/mobile)
export const storage = {
  getItem: async (key) => {
    if (isMobileApp) {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key });
      return value;
    }
    return localStorage.getItem(key);
  },
  setItem: async (key, value) => {
    if (isMobileApp) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  },
  removeItem: async (key) => {
    if (isMobileApp) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  },
};

// Network status monitoring
export const setupNetworkMonitoring = async (onNetworkStatusChange) => {
  if (isMobileApp) {
    const { Network } = await import('@capacitor/network');
    
    // Listen for network status changes
    Network.addListener('networkStatusChange', status => {
      console.log('Network status changed:', status);
      onNetworkStatusChange(status);
    });
    
    // Get initial network status
    const status = await Network.getStatus();
    console.log('Initial network status:', status);
    onNetworkStatusChange(status);
  }
};

// Error messages configuration
export const errorMessages = {
  network: {
    offline: 'You appear to be offline. Please check your internet connection.',
    timeout: 'The request timed out. Please try again.',
    default: 'A network error occurred. Please check your connection and try again.',
  },
  auth: {
    expired: 'Your session has expired. Please log in again.',
    invalid: 'Invalid authentication credentials.',
  },
}; 