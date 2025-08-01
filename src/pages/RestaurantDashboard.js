import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  BarChart3,
  DollarSign,
  Eye,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  MapPin,
  Star,
  Menu as MenuIcon,
  Settings,
  Bell,
  CreditCard
} from 'lucide-react';
import { restaurantAdminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import RestaurantAnalytics from '../components/restaurant/RestaurantAnalytics';
import MenuManagement from '../components/restaurant/MenuManagement';
import HangoutsManagement from '../components/restaurant/HangoutsManagement';
import SubscriptionManagement from '../components/restaurant/SubscriptionManagement';
import { toast } from 'react-hot-toast';

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Get user's owned places
  const ownedPlaces = user?.ownedPlaces || [];
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(
    ownedPlaces.length > 0 ? ownedPlaces[0]._id : null
  );

  // Update selected restaurant when ownedPlaces changes
  useEffect(() => {
    if (ownedPlaces.length > 0 && !selectedRestaurantId) {
      setSelectedRestaurantId(ownedPlaces[0]._id);
    }
  }, [ownedPlaces, selectedRestaurantId]);

  // Get current restaurant details
  const currentRestaurant = ownedPlaces.find(place => place._id === selectedRestaurantId);

  // Fetch dashboard data for selected restaurant
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    ['restaurant-dashboard', selectedRestaurantId],
    () => restaurantAdminAPI.getDashboard(selectedRestaurantId),
    { 
      enabled: !!selectedRestaurantId && activeTab === 'dashboard',
      refetchInterval: 30000 // Refresh every 30 seconds
    }
  );

  if (ownedPlaces.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-md">
            <div className="text-red-500 mb-4">
              <Settings size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Restaurants Found
            </h3>
            <p className="text-gray-600 mb-4">
              Your account is not associated with any restaurants. Please contact support to set up your restaurant profile.
            </p>
            <button
              onClick={() => window.location.href = 'mailto:support@foylekke.com'}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'menu', label: 'Menu Management', icon: MenuIcon },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'hangouts', label: 'Hangouts', icon: Users },
    { id: 'subscription', label: 'Subscription', icon: CreditCard }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const DashboardOverview = () => {
    if (dashboardLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
              <div className="h-8 w-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      );
    }

    const { 
      overview = {},
      recentActivity = [],
      topDishes = [],
      upcomingHangouts = []
    } = dashboardData || {};

    return (
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Views</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(overview.totalViews || 0)}
                </p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">+{overview.viewsGrowth || 0}%</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {(overview.averageRating || 0).toFixed(1)}
                </p>
                <div className="flex items-center text-sm">
                  <span className="text-gray-600">
                    {overview.totalReviews || 0} reviews
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Hangouts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {overview.activeHangouts || 0}
                </p>
                <div className="flex items-center text-sm">
                  <span className="text-gray-600">
                    {overview.totalParticipants || 0} participants
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MenuIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Menu Items</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {overview.totalMenuItems || 0}
                </p>
                <div className="flex items-center text-sm">
                  <span className={`${overview.menuStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {overview.menuStatus === 'active' ? 'Menu Active' : 'Menu Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Dishes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Dishes</h3>
            <div className="space-y-3">
              {topDishes.length > 0 ? topDishes.map((dish, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {dish.name}
                    </p>
                    <p className="text-xs text-gray-500">{dish.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {dish.views || 0} views
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(dish.price || 0)}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-sm">No data available</p>
              )}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-sm">No recent activity</p>
              )}
            </div>
          </motion.div>

          {/* Upcoming Hangouts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Hangouts</h3>
            <div className="space-y-3">
              {upcomingHangouts.length > 0 ? upcomingHangouts.map((hangout, index) => (
                <div key={index} className="border-l-2 border-primary-500 pl-3">
                  <p className="text-sm font-medium text-gray-900">{hangout.title}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {hangout.date}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="h-3 w-3 mr-1" />
                    {hangout.participants} participants
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-sm">No upcoming hangouts</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Restaurant Dashboard</h1>
              {currentRestaurant && (
                <p className="text-lg font-medium text-primary-600 mt-1">
                  {currentRestaurant.name}
                </p>
              )}
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.name}! Manage your restaurant{ownedPlaces.length > 1 ? 's' : ''} from here.
              </p>
              {/* Restaurant Selector */}
              {ownedPlaces.length > 1 && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Restaurant:
                  </label>
                  <select
                    value={selectedRestaurantId || ''}
                    onChange={(e) => setSelectedRestaurantId(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  >
                    {ownedPlaces.map((place) => (
                      <option key={place._id} value={place._id}>
                        {place.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardOverview />}
        {activeTab === 'menu' && <MenuManagement restaurantId={selectedRestaurantId} />}
        {activeTab === 'analytics' && <RestaurantAnalytics restaurantId={selectedRestaurantId} />}
        {activeTab === 'hangouts' && <HangoutsManagement restaurantId={selectedRestaurantId} />}
        {activeTab === 'subscription' && <SubscriptionManagement restaurantId={selectedRestaurantId} />}
      </div>
    </div>
  );
};

export default RestaurantDashboard; 