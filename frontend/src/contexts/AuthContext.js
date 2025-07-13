import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'USER_LOADED':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      if (state.token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
          const response = await api.get('/api/auth/me');
          dispatch({ type: 'USER_LOADED', payload: response.data });
        } catch (error) {
          localStorage.removeItem('token');
          dispatch({ type: 'LOGIN_FAIL' });
        }
      } else {
        dispatch({ type: 'LOGIN_FAIL' });
      }
    };

    loadUser();
  }, [state.token]);

  // Login user
  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      dispatch({ type: 'LOGIN_FAIL' });
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      dispatch({ type: 'LOGIN_FAIL' });
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/api/auth/me', userData);
      dispatch({ type: 'UPDATE_USER', payload: response.data });
      toast.success('Profile updated successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
    }
  };

  // Toggle favorite place
  const toggleFavorite = async (placeId) => {
    try {
      const response = await api.post(`/api/auth/favorites/${placeId}`);
      dispatch({ type: 'UPDATE_USER', payload: { ...state.user, favorites: response.data } });
      toast.success('Favorites updated!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update favorites';
      toast.error(message);
    }
  };

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    login,
    register,
    logout,
    updateProfile,
    toggleFavorite,
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