import axios from 'axios';
import { apiConfig, storage, errorMessages } from './apiConfig';

// Create axios instance with configuration
const api = axios.create(apiConfig);

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Debug logging
    console.log('🌐 API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
    });

    const token = await storage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Debug logging
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    // Debug logging
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data,
    });

    if (!error.response) {
      return Promise.reject({
        response: {
          data: {
            message: errorMessages.network.default,
          },
        },
      });
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Register new user
  register: (userData) => 
    api.post('/api/auth/register', userData).then(response => response.data),
  
  // Login user
  login: (credentials) => 
    api.post('/api/auth/login', credentials).then(response => response.data),
  
  // Get current user
  getCurrentUser: () => 
    api.get('/api/auth/me').then(response => response.data),
  
  // Update profile
  updateProfile: (data) => 
    api.put('/api/auth/me', data).then(response => response.data),
  
  // Change password
  changePassword: (data) => 
    api.post('/api/auth/change-password', data).then(response => response.data),
  
  // Request password reset
  requestPasswordReset: (email) => 
    api.post('/api/auth/forgot-password', { email }).then(response => response.data),
  
  // Reset password
  resetPassword: (data) => 
    api.post('/api/auth/reset-password', data).then(response => response.data),
  
  // Toggle favorite
  toggleFavorite: (placeId) => 
    api.post(`/api/auth/favorites/${placeId}`).then(response => response.data),
};

// Places API
export const placesAPI = {
  // Get all places with filters
  getPlaces: (params = {}) => 
    api.get('/api/places', { params }).then(response => response.data),
  
  // Get place types
  getPlaceTypes: () => 
    api.get('/api/places/types').then(response => response.data),
  
  // Get single place
  getPlace: (id) => 
    api.get(`/api/places/${id}`).then(response => response.data),
  
  // Create new place
  createPlace: (data) => 
    api.post('/api/places', data).then(response => response.data),
  
  // Update place
  updatePlace: (id, data) => 
    api.put(`/api/places/${id}`, data).then(response => response.data),
  
  // Delete place
  deletePlace: (id) => 
    api.delete(`/api/places/${id}`).then(response => response.data),
  
  // Get top places by region
  getTopPlaces: (region, type) => 
    api.get(`/api/places/top/${region}`, { params: { type } }).then(response => response.data),
  
  // Search suggestions
  searchSuggestions: (query) => 
    api.get('/api/places/search-suggestions', { params: { q: query } }).then(response => response.data),
  
  // Advanced search
  advancedSearch: (searchData) => 
    api.post('/api/places/advanced-search', searchData).then(response => response.data),

  // Get places by location (nearby)
  getNearbyPlaces: (lat, lng, radius, filters = {}) => 
    api.get('/api/places/nearby', { 
      params: { lat, lng, radius, ...filters } 
    }).then(response => response.data),

  // Get places with available menu
  getPlacesWithMenu: (params = {}) => 
    api.get('/api/places/with-menu', { params }).then(response => response.data),

  // Vote on place (upvote/downvote)
  voteOnPlace: (placeId, voteType) => 
    api.post(`/api/places/${placeId}/vote`, { voteType }).then(response => response.data),

  // Get place votes
  getPlaceVotes: (placeId) => 
    api.get(`/api/places/${placeId}/votes`).then(response => response.data),

  // Remove vote from place
  removeVote: (placeId) => 
    api.delete(`/api/places/${placeId}/vote`).then(response => response.data),
};

// Reviews API
export const reviewsAPI = {
  // Get all reviews with filters
  getReviews: (params = {}) => 
    api.get('/api/reviews', { params }).then(response => response.data),
  
  // Get reviews for a specific place
  getPlaceReviews: (placeId, params = {}) => 
    api.get(`/api/reviews/place/${placeId}`, { params }).then(response => response.data),
  
  // Get user's reviews
  getMyReviews: (params = {}) => 
    api.get('/api/reviews/my-reviews', { params }).then(response => response.data),
  
  // Get single review
  getReview: (id) => 
    api.get(`/api/reviews/${id}`).then(response => response.data),
  
  // Create review
  createReview: (formData) => 
    api.post('/api/reviews', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => response.data),
  
  // Update review
  updateReview: (id, formData) => 
    api.put(`/api/reviews/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => response.data),
  
  // Delete review
  deleteReview: (id) => 
    api.delete(`/api/reviews/${id}`).then(response => response.data),
  
  // Toggle reaction (like/dislike)
  toggleReaction: (id, reactionType) => 
    api.post(`/api/reviews/${id}/reaction`, { reactionType }).then(response => response.data),
  
  // Flag review
  flagReview: (id, reason) => 
    api.post(`/api/reviews/${id}/flag`, { reason }).then(response => response.data),
  
  // Business response to review
  respondToReview: (id, content) => 
    api.post(`/api/reviews/${id}/respond`, { content }).then(response => response.data),
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
  
  // Delete hangout
  deleteHangout: (id) => api.delete(`/api/hangouts/${id}`).then(response => response.data),
  
  // Join hangout
  joinHangout: (id) => api.post(`/api/hangouts/${id}/join`).then(response => response.data),
  
  // Leave hangout
  leaveHangout: (id) => api.post(`/api/hangouts/${id}/leave`).then(response => response.data),
  
  // Request to join public hangout
  requestToJoin: (id, message) => api.post(`/api/hangouts/${id}/request`, { message }).then(response => response.data),

  // Approve join request
  approveJoinRequest: (hangoutId, requestId) => 
    api.post(`/api/hangouts/${hangoutId}/approve/${requestId}`).then(response => response.data),

  // Reject join request
  rejectJoinRequest: (hangoutId, requestId) => 
    api.post(`/api/hangouts/${hangoutId}/reject/${requestId}`).then(response => response.data),

  // Send invitations
  sendInvitations: (hangoutId, invitations) => 
    api.post(`/api/hangouts/${hangoutId}/invite`, { invitations }).then(response => response.data),

  // Respond to invitation
  respondToInvitation: (invitationId, response, message) => 
    api.post(`/api/hangouts/invitations/${invitationId}/respond`, { response, message }).then(response => response.data),

  // Get hangout invitations
  getMyInvitations: (status) => 
    api.get('/api/hangouts/invitations', { params: { status } }).then(response => response.data),

  // Get hangout statistics
  getHangoutStats: (id) => 
    api.get(`/api/hangouts/${id}/stats`).then(response => response.data),

  // Get public hangouts
  getPublicHangouts: (params = {}) => 
    api.get('/api/hangouts/public', { params }).then(response => response.data),

  // Get join requests for a hangout (organizer only)
  getJoinRequests: (hangoutId) => 
    api.get(`/api/hangouts/${hangoutId}/requests`).then(response => response.data),
  
  // Add message to hangout
  addMessage: (id, content) => api.post(`/api/hangouts/${id}/messages`, { content }).then(response => response.data),

  // Add place to hangout
  addPlaceToHangout: (hangoutId, placeId, isManual, manualAddress) => 
    api.post(`/api/hangouts/${hangoutId}/places`, { 
      placeId, 
      isManual, 
      manualAddress 
    }).then(response => response.data),

  // Remove place from hangout
  removePlaceFromHangout: (hangoutId, placeId) => 
    api.delete(`/api/hangouts/${hangoutId}/places/${placeId}`).then(response => response.data),
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
  // Get available payment providers
  getProviders: () => 
    api.get('/api/payments/providers').then(response => response.data),
  
  // Create Orange Money payment
  createOrangeMoneyPayment: (data) => 
    api.post('/api/payments/orange-money/create', data).then(response => response.data),
  
  // Create Wave payment
  createWavePayment: (data) => 
    api.post('/api/payments/wave/create', data).then(response => response.data),
  
  // Verify payment status
  verifyPayment: (paymentId, provider) => 
    api.post('/api/payments/verify', { paymentId, provider }).then(response => response.data),
  
  // Get payment instructions
  getPaymentInstructions: (provider, amount, phoneNumber, reference) => 
    api.get(`/api/payments/instructions/${provider}`, {
      params: { amount, phoneNumber, reference }
    }).then(response => response.data),
  
  // Validate phone number
  validatePhone: (data) => 
    api.post('/api/payments/validate-phone', data).then(response => response.data),
  
  // Get payment history
  getPaymentHistory: (params = {}) => 
    api.get('/api/payments/history', { params }).then(response => response.data),
  
  // Get payment statistics
  getPaymentStatistics: () => 
    api.get('/api/payments/statistics').then(response => response.data)
};

// Legacy Restaurant API (for backward compatibility)
export const restaurantsAPI = {
  getRestaurants: (params = {}) => api.get('/api/restaurants', { params }).then(response => response.data),
  getRestaurant: (id) => api.get(`/api/restaurants/${id}`).then(response => response.data),
  createRestaurant: (data) => api.post('/api/restaurants', data).then(response => response.data),
  updateRestaurant: (id, data) => api.put(`/api/restaurants/${id}`, data).then(response => response.data),
  deleteRestaurant: (id) => api.delete(`/api/restaurants/${id}`).then(response => response.data),
};

export default api;