import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Heart, 
  Star, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  Shield, 
  LogOut,
  Settings,
  MessageCircle,
  Users,
  Clock,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useQueryClient } from 'react-query';
import { placesAPI, hangoutsAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import PlaceCard from '../components/places/PlaceCard';
import HangoutCard from '../components/hangouts/HangoutCard';
import ReviewsList from '../components/reviews/ReviewsList';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user, updateProfile, logout, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    profilePicture: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Fetch user's favorite places
  const { data: favoritePlaces, isLoading: favoritesLoading, error: favoritesError } = useQuery(
    ['favoritePlaces', user?.favorites],
    async () => {
      if (user?.favorites && user.favorites.length > 0) {
        try {
          const places = await Promise.all(
            user.favorites.map(id => placesAPI.getPlace(id).catch(err => {
              console.warn(`Failed to fetch place ${id}:`, err);
              return null; // Return null for failed requests
            }))
          );
          // Filter out null values (failed requests)
          return places.filter(place => place !== null);
        } catch (error) {
          console.error('Error fetching favorite places:', error);
          return [];
        }
      }
      return [];
    },
    {
      enabled: !!user?.favorites && isAuthenticated,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Fetch user's hangouts
  const { data: userHangouts, isLoading: hangoutsLoading } = useQuery(
    ['userHangouts'],
    () => hangoutsAPI.getMyHangouts(),
    {
      enabled: isAuthenticated
    }
  );

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        profilePicture: user.profilePicture || ''
      });
    }
  }, [user]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (error) {
      // Error handled in AuthContext
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await updateProfile({
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
      toast.success('Password updated successfully');
    } catch (error) {
      // Error handled in AuthContext
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload to a service like Cloudinary
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData(prev => ({
          ...prev,
          profilePicture: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAvatarUrl = (profilePicture, name) => {
    return profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff&size=200`;
  };

  const upcomingHangouts = userHangouts?.filter(h => 
    h.status === 'planned' && new Date(h.dateTime) > new Date()
  ) || [];

  const pastHangouts = userHangouts?.filter(h => 
    h.status === 'completed' || (h.status === 'planned' && new Date(h.dateTime) < new Date())
  ) || [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
          <Link
            to="/login"
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <img
                src={getAvatarUrl(user?.profilePicture, user?.name)}
                alt={user?.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-full cursor-pointer transition-colors duration-200">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                  <p className="text-gray-600">{user?.email}</p>
                  {user?.location && (
                    <div className="flex items-center justify-center md:justify-start mt-2 text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{user.location}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {/* Bio */}
              {user?.bio && (
                <p className="text-gray-700 mb-4">{user.bio}</p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>{user?.favorites?.length || 0} favorites</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{userHangouts?.length || 0} hangouts</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(user?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Edit Profile Form */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Profile</h2>
              
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Change Password
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Password Change Form */}
              {showPasswordForm && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'favorites', label: 'Favorites', icon: Heart },
                { id: 'hangouts', label: 'Hangouts', icon: Users },
                { id: 'reviews', label: 'Reviews', icon: Star }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'favorites' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Favorite Places</h2>
                {favoritesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
                    ))}
                  </div>
                ) : favoritePlaces && favoritePlaces.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoritePlaces.map((place) => (
                      <PlaceCard key={place._id} place={place} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                    <p className="text-gray-600 mb-4">Start exploring and save your favorite places!</p>
                    <Link
                      to="/places"
                      className="inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
                    >
                      Explore Places
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hangouts' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">My Hangouts</h2>
                {hangoutsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse"></div>
                    ))}
                  </div>
                ) : userHangouts && userHangouts.length > 0 ? (
                  <div className="space-y-8">
                    {/* Upcoming Hangouts */}
                    {upcomingHangouts.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                          Upcoming ({upcomingHangouts.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {upcomingHangouts.map((hangout) => (
                            <HangoutCard
                              key={hangout._id}
                              hangout={hangout}
                              onFavorite={() => {}} // Placeholder - could implement hangout favoriting
                              isFavorited={false}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Past Hangouts */}
                    {pastHangouts.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2 text-gray-600" />
                          Past ({pastHangouts.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {pastHangouts.map((hangout) => (
                            <HangoutCard
                              key={hangout._id}
                              hangout={hangout}
                              onFavorite={() => {}} // Placeholder - could implement hangout favoriting
                              isFavorited={false}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hangouts yet</h3>
                    <p className="text-gray-600 mb-4">Join or create hangouts to connect with others!</p>
                    <Link
                      to="/hangouts"
                      className="inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
                    >
                      Browse Hangouts
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <ReviewsList
                  userId={user._id}
                  showPlaceNames={true}
                  title="My Reviews"
                  emptyMessage="You haven't written any reviews yet"
                  compact={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 