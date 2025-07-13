import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:9999',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Places API
export const placesAPI = {
  // Get all places with filters
  getPlaces: (params = {}) => api.get('/api/places', { params }).then(response => response.data),
  
  // Get place types
  getPlaceTypes: () => api.get('/api/places/types').then(response => response.data),
  
  // Get single place
  getPlace: (id) => api.get(`/api/places/${id}`).then(response => response.data),
  
  // Create new place
  createPlace: (data) => api.post('/api/places', data).then(response => response.data),
  
  // Update place
  updatePlace: (id, data) => api.put(`/api/places/${id}`, data).then(response => response.data),
  
  // Delete place
  deletePlace: (id) => api.delete(`/api/places/${id}`).then(response => response.data),
  
  // Get top places by region
  getTopPlaces: (region, type) => api.get(`/api/places/top/${region}`, { params: { type } }).then(response => response.data),
  
  // Sync places from Google
  syncPlaces: (region, type, limit) => api.post(`/api/places/sync/${region}`, {}, { params: { type, limit } }).then(response => response.data),
};

// Auth API
export const authAPI = {
  // Login
  login: (credentials) => api.post('/api/auth/login', credentials).then(response => response.data),
  
  // Register
  register: (userData) => api.post('/api/auth/register', userData).then(response => response.data),
  
  // Get current user
  getCurrentUser: () => api.get('/api/auth/me').then(response => response.data),
  
  // Update profile
  updateProfile: (data) => api.put('/api/auth/me', data).then(response => response.data),
  
  // Toggle favorite
  toggleFavorite: (placeId) => api.post(`/api/auth/favorites/${placeId}`).then(response => response.data),
};

// Reviews API
export const reviewsAPI = {
  // Get reviews for a place
  getPlaceReviews: (placeId) => api.get(`/api/reviews/place/${placeId}`).then(response => response.data),
  
  // Create review
  createReview: (data) => api.post('/api/reviews', data).then(response => response.data),
  
  // Update review
  updateReview: (id, data) => api.put(`/api/reviews/${id}`, data).then(response => response.data),
  
  // Delete review
  deleteReview: (id) => api.delete(`/api/reviews/${id}`).then(response => response.data),
  
  // Toggle like on review
  toggleLike: (id) => api.post(`/api/reviews/${id}/like`).then(response => response.data),
};

// Hangouts API
export const hangoutsAPI = {
  // Get all hangouts
  getHangouts: (params = {}) => api.get('/api/hangouts', { params }).then(response => response.data),
  
  // Get user's hangouts
  getMyHangouts: () => api.get('/api/hangouts/my-hangouts').then(response => response.data),
  
  // Get single hangout
  getHangout: (id) => api.get(`/api/hangouts/${id}`).then(response => response.data),
  
  // Create hangout
  createHangout: (data) => api.post('/api/hangouts', data).then(response => response.data),
  
  // Update hangout
  updateHangout: (id, data) => api.put(`/api/hangouts/${id}`, data).then(response => response.data),
  
  // Join hangout
  joinHangout: (id) => api.post(`/api/hangouts/${id}/join`).then(response => response.data),
  
  // Leave hangout
  leaveHangout: (id) => api.post(`/api/hangouts/${id}/leave`).then(response => response.data),
  
  // Add message to hangout
  addMessage: (id, content) => api.post(`/api/hangouts/${id}/messages`, { content }).then(response => response.data),
};

// Advertisements API
export const adsAPI = {
  // Get ads for specific placement
  getPlacementAds: (placement, params = {}) => 
    api.get(`/api/ads/placement/${placement}`, { params }).then(response => response.data),
  
  // Get advertiser's ads
  getAdvertiserAds: () => 
    api.get('/api/ads/advertiser').then(response => response.data),
  
  // Create new ad
  createAd: (adData) => 
    api.post('/api/ads', adData).then(response => response.data),
  
  // Update ad
  updateAd: (id, adData) => 
    api.put(`/api/ads/${id}`, adData).then(response => response.data),
  
  // Delete ad
  deleteAd: (id) => 
    api.delete(`/api/ads/${id}`).then(response => response.data),
  
  // Submit ad for review
  submitAd: (id) => 
    api.put(`/api/ads/${id}/submit`).then(response => response.data),
  
  // Track ad event
  trackAdEvent: (adId, eventType, eventData = {}) => 
    api.post(`/api/ads/${adId}/track`, { eventType, ...eventData }).then(response => response.data),
  
  // Get ad analytics
  getAdAnalytics: (adId, params = {}) => 
    api.get(`/api/ads/${adId}/analytics`, { params }).then(response => response.data),
  
  // Get advertiser analytics
  getAdvertiserAnalytics: (params = {}) => 
    api.get('/api/ads/advertiser/analytics', { params }).then(response => response.data),

  // Admin endpoints
  getAdminPendingAds: () => 
    api.get('/api/ads/admin/pending').then(response => response.data),
  
  getAdminAllAds: (params = {}) => 
    api.get('/api/ads/admin/all', { params }).then(response => response.data),
  
  getAdminAnalytics: (params = {}) => 
    api.get('/api/ads/admin/analytics', { params }).then(response => response.data),
  
  approveAd: (id, reviewNotes) => 
    api.put(`/api/ads/admin/${id}/approve`, { reviewNotes }).then(response => response.data),
  
  rejectAd: (id, reviewNotes) => 
    api.put(`/api/ads/admin/${id}/reject`, { reviewNotes }).then(response => response.data),

  // Image upload endpoints
  uploadAdImage: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.post('/api/ads/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => response.data);
  },

  uploadAdImages: (imageFiles) => {
    const formData = new FormData();
    imageFiles.forEach(file => {
      formData.append('images', file);
    });
    return api.post('/api/ads/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => response.data);
  },

  deleteAdImage: (publicId) => 
    api.delete(`/api/ads/delete-image/${publicId}`).then(response => response.data),
};

// Payment API
export const paymentAPI = {
  createPaymentRecord: (adData) => 
    api.post('/api/payments/create-payment-record', { adData }).then(response => response.data),
  
  getPaymentInstructions: (amount) => 
    api.get(`/api/payments/payment-instructions/${amount}`).then(response => response.data),
  
  confirmPayment: (paymentId, adId) => 
    api.post('/api/payments/confirm-payment', { paymentId, adId }).then(response => response.data),
  
  markPaymentFailed: (paymentId, adId, reason) => 
    api.post('/api/payments/mark-payment-failed', { paymentId, adId, reason }).then(response => response.data),
  
  getPaymentHistory: (params = {}) => 
    api.get('/api/payments/history', { params }).then(response => response.data),
  
  getAdminPaymentAnalytics: (params = {}) => 
    api.get('/api/payments/admin/analytics', { params }).then(response => response.data),
};

// Legacy Restaurant API (for backward compatibility)
export const restaurantsAPI = {
  getRestaurants: (params = {}) => api.get('/api/restaurants', { params }).then(response => response.data),
  getRestaurant: (id) => api.get(`/api/restaurants/${id}`).then(response => response.data),
  createRestaurant: (data) => api.post('/api/restaurants', data).then(response => response.data),
  updateRestaurant: (id, data) => api.put(`/api/restaurants/${id}`, data).then(response => response.data),
  deleteRestaurant: (id) => api.delete(`/api/restaurants/${id}`).then(response => response.data),
  getTopRestaurants: (region) => api.get(`/api/restaurants/top/${region}`).then(response => response.data),
};

export default api; 