import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

// Check for token in localStorage and set initial authenticated state
const token = localStorage.getItem('token');
const initialState = {
  user: null,
  token: token,
  isAuthenticated: false, // Start as false until we verify the token
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'USER_LOADED':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Set up axios interceptor for token expiration
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401 && state.token) {
          // Token expired or invalid
          dispatch({ type: 'AUTH_ERROR', payload: 'Session expired. Please log in again.' });
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  // Load user on app start or token change
  useEffect(() => {
    const loadUser = async () => {
      if (state.token) {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
          const response = await api.get('/api/auth/me');
          dispatch({ type: 'USER_LOADED', payload: response.data });
        } catch (error) {
          console.error('Error loading user:', error);
          dispatch({
            type: 'AUTH_ERROR',
            payload: error.response?.data?.message || 'Failed to load user profile'
          });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUser();
  }, [state.token]);

  // Register user
  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.post('/api/auth/register', userData);
      dispatch({ type: 'REGISTER_SUCCESS', payload: response.data });
      toast.success('Registration successful! Welcome to Foy Lekke!');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'REGISTER_FAIL', payload: message });
      toast.error(message);
    }
  };

  // Login user
  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.post('/api/auth/login', { email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAIL', payload: message });
      toast.error(message);
    }
  };

  // Logout user
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.put('/api/auth/me', userData);
      dispatch({ type: 'UPDATE_USER', payload: response.data.user });
      toast.success('Profile updated successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await api.post('/api/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      toast.success(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to request password reset';
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Reset password
  const resetPassword = async (resetToken, newPassword) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await api.post('/api/auth/reset-password', { resetToken, newPassword });
      toast.success('Password reset successful! Please log in with your new password.');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Toggle favorite
  const toggleFavorite = async (placeId) => {
    try {
      const response = await api.post(`/api/auth/favorites/${placeId}`);
      dispatch({ type: 'UPDATE_USER', payload: { ...state.user, favorites: response.data.favorites } });
      toast.success(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update favorites';
      toast.error(message);
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    toggleFavorite,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 