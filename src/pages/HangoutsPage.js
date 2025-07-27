import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  UsersIcon,
  CalendarIcon,
  MapPinIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { hangoutsAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import HangoutCard from '../components/hangouts/HangoutCard';

const HangoutsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // State for filtering and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [showMyHangouts, setShowMyHangouts] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch hangouts data
  const { 
    data: hangoutsData, 
    isLoading: hangoutsLoading, 
    error: hangoutsError,
    refetch: refetchHangouts 
  } = useQuery(
    ['hangouts', { showMyHangouts }],
    () => showMyHangouts ? hangoutsAPI.getMyHangouts() : hangoutsAPI.getHangouts(),
    {
      enabled: isAuthenticated,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        console.error('Failed to fetch hangouts:', error);
        toast.error('Failed to load hangouts');
      }
    }
  );

  // Process hangouts data
  const hangouts = showMyHangouts 
    ? (hangoutsData || []) 
    : (hangoutsData?.hangouts || []);

  // Filter hangouts
  const filteredHangouts = hangouts.filter(hangout => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        hangout.title.toLowerCase().includes(searchLower) ||
        hangout.description?.toLowerCase().includes(searchLower) ||
        hangout.place?.name.toLowerCase().includes(searchLower) ||
        hangout.creator?.name.toLowerCase().includes(searchLower) ||
        hangout.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (selectedStatus !== 'all' && hangout.status !== selectedStatus) {
      return false;
    }

    // Time filter
    if (selectedTimeFilter !== 'all') {
      const hangoutDate = new Date(hangout.dateTime);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      switch (selectedTimeFilter) {
        case 'today':
          if (hangoutDate < today || hangoutDate >= tomorrow) return false;
          break;
        case 'tomorrow':
          if (hangoutDate < tomorrow || hangoutDate >= new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)) return false;
          break;
        case 'this_week':
          if (hangoutDate < today || hangoutDate >= nextWeek) return false;
          break;
        case 'upcoming':
          if (hangoutDate < now) return false;
          break;
        default:
          break;
      }
    }

    return true;
  });

  // Handle favorite toggle (placeholder - would need backend support)
  const handleFavoriteToggle = (hangoutId) => {
    toast.success('Favorite feature coming soon!');
  };

  // Loading state
  if (hangoutsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hangouts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (hangoutsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to Load Hangouts
          </h3>
          <p className="text-gray-600 mb-4">
            There was an error loading hangouts. Please try again.
          </p>
          <button
            onClick={() => refetchHangouts()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {showMyHangouts ? 'My Hangouts' : 'Discover Hangouts'}
              </h1>
              <p className="text-gray-600">
                {showMyHangouts 
                  ? 'Manage your hangouts and see where you\'re going'
                  : 'Connect with people and discover amazing places together'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              {/* My Hangouts Toggle */}
              <button
                onClick={() => setShowMyHangouts(!showMyHangouts)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showMyHangouts
                    ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {showMyHangouts ? 'All Hangouts' : 'My Hangouts'}
              </button>

              {/* Create Hangout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/hangouts/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Hangout
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search hangouts by title, place, or organizer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4 lg:mb-0">
                {/* Status Filter */}
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="planned">Planned</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Time Filter */}
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4 text-gray-500" />
                  <select
                    value={selectedTimeFilter}
                    onChange={(e) => setSelectedTimeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="this_week">This Week</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-600">
                {filteredHangouts.length} hangout{filteredHangouts.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats (only for authenticated users) */}
        {isAuthenticated && !showMyHangouts && hangouts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{hangouts.length}</div>
                <div className="text-sm text-gray-600">Total Hangouts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {hangouts.filter(h => h.status === 'planned').length}
                </div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {hangouts.filter(h => h.status === 'ongoing').length}
                </div>
                <div className="text-sm text-gray-600">Happening Now</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {hangouts.reduce((total, h) => total + (h.participants?.filter(p => p.status === 'accepted').length || 0) + 1, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Participants</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Hangouts Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {filteredHangouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredHangouts.map((hangout, index) => (
                  <motion.div
                    key={hangout._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <HangoutCard
                      hangout={hangout}
                      onFavorite={handleFavoriteToggle}
                      isFavorited={false} // TODO: Implement favorite tracking
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-gray-400 mb-4">
                <UsersIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedStatus !== 'all' || selectedTimeFilter !== 'all'
                  ? 'No hangouts found'
                  : showMyHangouts 
                    ? 'No hangouts yet' 
                    : 'No public hangouts available'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedStatus !== 'all' || selectedTimeFilter !== 'all'
                  ? 'Try adjusting your search or filters to find more hangouts.'
                  : showMyHangouts
                    ? 'Create your first hangout to get started!'
                    : 'Be the first to create a hangout in your area!'
                }
              </p>
              
              {(!searchTerm && selectedStatus === 'all' && selectedTimeFilter === 'all') && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/hangouts/create')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Hangout
                </motion.button>
              )}
            </motion.div>
          )}
        </motion.div>


      </div>
    </div>
  );
};

export default HangoutsPage; 