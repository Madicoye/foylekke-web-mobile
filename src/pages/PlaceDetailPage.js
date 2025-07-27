import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from 'react-query';
import { 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Star, 
  Heart,
  Share2,
  Camera,
  Navigation,
  DollarSign,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Mail,
  Utensils,
  Wifi,
  Car,
  CreditCard,
  ShoppingBag,
  Music,
  Coffee,
  ThumbsUp,
  ThumbsDown,
  Menu,
  Plus,
  UserPlus
} from 'lucide-react';
import { placesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AdManager from '../components/ads/AdManager';
import PlaceCard from '../components/places/PlaceCard';
import { getCuisineTypeConfig } from '../config/cuisineTypes';
import { getPlaceTypeConfig } from '../config/placeTypes';
import { 
  getImageUrls, 
  hasValidImages, 
  getDefaultImageConfig, 
  createImageErrorHandler 
} from '../utils/imageUtils';
import { toast } from 'react-hot-toast';
import ReviewsList from '../components/reviews/ReviewsList';

const PlaceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, toggleFavorite } = useAuth();
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0, userVote: null });
  const [isVoting, setIsVoting] = useState(false);
  const [showCreateHangoutModal, setShowCreateHangoutModal] = useState(false);

  // Fetch place details
  const { data: place, isLoading, error } = useQuery(
    ['place', id],
    () => placesAPI.getPlace(id),
    {
      enabled: !!id,
      onSuccess: (data) => {
        // Update votes when place data is loaded
        setVotes({
          upvotes: data.upvoteCount || 0,
          downvotes: data.downvoteCount || 0,
          userVote: data.userVote || null
        });
      }
    }
  );

  // Fetch related places
  const { data: relatedPlaces } = useQuery(
    ['relatedPlaces', place?.type, place?.address?.region],
    () => placesAPI.getPlaces({ 
      type: place?.type, 
      region: place?.address?.region, 
      limit: 6 
    }),
    {
      enabled: !!place
    }
  );



  const handleVote = async (voteType) => {
    if (!user) {
      toast.error('Please log in to vote');
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    try {
      if (votes.userVote === voteType) {
        await placesAPI.voteOnPlace(place._id, 'remove');
        setVotes(prev => ({
          ...prev,
          [voteType === 'upvote' ? 'upvotes' : 'downvotes']: prev[voteType === 'upvote' ? 'upvotes' : 'downvotes'] - 1,
          userVote: null
        }));
        toast.success('Vote removed');
      } else {
        await placesAPI.voteOnPlace(place._id, voteType);
        
        // Update local state optimistically
        setVotes(prev => {
          const newVotes = { ...prev };
          
          // Remove previous vote if exists
          if (prev.userVote) {
            const prevVoteKey = prev.userVote === 'upvote' ? 'upvotes' : 'downvotes';
            newVotes[prevVoteKey] = prev[prevVoteKey] - 1;
          }
          
          // Add new vote
          const newVoteKey = voteType === 'upvote' ? 'upvotes' : 'downvotes';
          newVotes[newVoteKey] = prev[newVoteKey] + 1;
          newVotes.userVote = voteType;
          
          return newVotes;
        });
        
        toast.success(`${voteType === 'upvote' ? 'Upvoted' : 'Downvoted'} successfully`);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save favorites');
      return;
    }
    await toggleFavorite(id);
    // Invalidate favorites query to refresh the profile page
    queryClient.invalidateQueries(['favoritePlaces']);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: place?.name,
          text: place?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleCreateHangout = () => {
    if (!user) {
      toast.error('Please log in to create hangouts');
      return;
    }
    // Navigate to hangout creation with this place pre-selected
    navigate('/hangouts/create', { 
      state: { 
        preSelectedPlace: {
          _id: place._id,
          name: place.name,
          address: place.address,
          type: place.type
        }
      }
    });
  };

  const getDirectionsUrl = () => {
    if (place?.address?.coordinates?.coordinates) {
      const [lng, lat] = place.address.coordinates.coordinates;
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place?.name + ' ' + place?.address?.street)}`;
  };

  const formatRating = (rating) => {
    if (!rating) return 'No ratings';
    return rating.toFixed(1);
  };

  const formatPriceLevel = (priceLevel) => {
    if (!priceLevel) return null;
    const levels = {
      'low': { text: 'Budget-friendly', icon: '$', color: 'text-green-600' },
      'medium': { text: 'Moderate', icon: '$$', color: 'text-yellow-600' },
      'high': { text: 'Expensive', icon: '$$$', color: 'text-red-600' }
    };
    return levels[priceLevel.toLowerCase()] || { text: priceLevel, icon: '$', color: 'text-gray-600' };
  };

  const getFeatureIcon = (feature) => {
    const icons = {
      'wifi': Wifi,
      'parking': Car,
      'delivery': ShoppingBag,
      'takeout': Coffee,
      'outdoor_seating': Users,
      'live_music': Music,
      'reservations': Calendar,
      'wheelchair_accessible': Users,
      'family_friendly': Users,
      'credit_cards': CreditCard,
      'breakfast': Coffee,
      'lunch': Utensils,
      'dinner': Utensils
    };
    return icons[feature] || Users;
  };

  const formatOpeningHours = (hours) => {
    if (!hours) return null;
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return days.map((day, index) => ({
      day: dayNames[index],
      hours: hours[day]
    }));
  };

  const imageUrls = getImageUrls(place);
  const hasImages = hasValidImages(place);
  const defaultImageConfig = getDefaultImageConfig(place?.type);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading place details...</p>
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Place Not Found</h1>
          <p className="text-gray-600 mb-6">The place you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/places')}
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Browse All Places
          </button>
        </div>
      </div>
    );
  }

  const isFavorite = user?.favorites?.includes(id);
  const rating = place.ratings?.appRating || place.ratings?.googleRating || 0;
  const reviewCount = place.ratings?.reviewCount || 0;
  const priceInfo = formatPriceLevel(place.priceRange);
  const cuisineConfig = getCuisineTypeConfig(place.cuisine?.[0]);
  const typeConfig = getPlaceTypeConfig(place.type);
  const openingHours = formatOpeningHours(place.openingHours);
  const filteredRelatedPlaces = relatedPlaces?.places?.filter(p => p._id !== id) || [];
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to="/places" className="text-gray-500 hover:text-gray-700">Places</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{place.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section with Images */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {hasImages && imageUrls.length > 0 ? (
                <>
                  <div className="relative aspect-video rounded-xl overflow-hidden">
                    <img
                      src={imageUrls[selectedImageIndex]}
                      alt={place.name}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setShowImageModal(true)}
                      onError={createImageErrorHandler(place.type)}
                    />
                    <div 
                      className={`fallback-image absolute inset-0 bg-gradient-to-br ${defaultImageConfig.gradient} flex items-center justify-center cursor-pointer hidden`}
                      onClick={() => setShowImageModal(true)}
                    >
                      <div className="text-center">
                        <div className="text-6xl">{defaultImageConfig.icon}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowImageModal(true)}
                      className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-lg hover:bg-black/70 transition-colors duration-200"
                    >
                      <Camera size={20} />
                    </button>
                  </div>
                  
                  {imageUrls.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {imageUrls.slice(0, 4).map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                            selectedImageIndex === index ? 'border-primary-500' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${place.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={createImageErrorHandler(place.type)}
                          />
                          <div 
                            className={`fallback-image w-full h-full bg-gradient-to-br ${defaultImageConfig.gradient} flex items-center justify-center hidden`}
                          >
                            <span className="text-2xl">{defaultImageConfig.icon}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className={`aspect-video bg-gradient-to-br ${defaultImageConfig.gradient} rounded-xl flex items-center justify-center`}>
                  <div className="text-center">
                    <div className="text-6xl">{defaultImageConfig.icon}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Place Info */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{place.name}</h1>
                    <div className="flex items-center space-x-4">
                      {/* Type Badge */}
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        <span className="mr-2">{typeConfig?.icon || '📍'}</span>
                        {typeConfig?.name || place.type}
                      </span>
                      
                      {/* Cuisine Badge */}
                      {place.cuisine && place.cuisine.length > 0 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          <span className="mr-2">{cuisineConfig?.icon || '🍽️'}</span>
                          {cuisineConfig?.name || place.cuisine[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleFavoriteClick}
                      className={`p-3 rounded-lg border transition-colors duration-200 ${
                        isFavorite 
                          ? 'bg-red-50 border-red-200 text-red-600' 
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                    </button>
                    
                    <button
                      onClick={handleShare}
                      className="p-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Rating, Price, and Voting */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star size={20} className="text-yellow-400 fill-current" />
                        <span className="text-lg font-semibold text-gray-900">
                          {formatRating(rating)}
                        </span>
                      </div>
                      <span className="text-gray-500">
                        ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
                      </span>
                    </div>
                    
                    {priceInfo && (
                      <div className="flex items-center space-x-1">
                        <DollarSign size={16} className={priceInfo.color} />
                        <span className={`font-medium ${priceInfo.color}`}>
                          {priceInfo.text}
                        </span>
                      </div>
                    )}

                    {/* Menu Available Badge */}
                    {place.menu && place.menu.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Menu size={16} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">Menu Available</span>
                      </div>
                    )}
                  </div>

                  {/* Voting Section */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVote('upvote')}
                        disabled={isVoting}
                        className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                          votes.userVote === 'upvote' 
                            ? 'bg-green-100 text-green-600' 
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <ThumbsUp size={18} className={votes.userVote === 'upvote' ? 'fill-current' : ''} />
                      </button>
                      <span className="text-sm font-medium text-green-600 min-w-[1.5rem] text-center">
                        {votes.upvotes || 0}
                      </span>
                      
                      <button
                        onClick={() => handleVote('downvote')}
                        disabled={isVoting}
                        className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                          votes.userVote === 'downvote' 
                            ? 'bg-red-100 text-red-600' 
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <ThumbsDown size={18} className={votes.userVote === 'downvote' ? 'fill-current' : ''} />
                      </button>
                      <span className="text-sm font-medium text-red-600 min-w-[1.5rem] text-center">
                        {votes.downvotes || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-600 leading-relaxed">{place.description}</p>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Address */}
                <div className="flex items-start space-x-3">
                  <MapPin size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Address</h4>
                    <p className="text-gray-600">
                      {place.address?.street && `${place.address.street}, `}
                      {place.address?.city && `${place.address.city}, `}
                      {place.address?.region}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                {place.contact?.phone && (
                  <div className="flex items-start space-x-3">
                    <Phone size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Phone</h4>
                      <a 
                        href={`tel:${place.contact.phone}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {place.contact.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Website */}
                {place.contact?.website && (
                  <div className="flex items-start space-x-3">
                    <Globe size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Website</h4>
                      <a 
                        href={place.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                      >
                        <span>Visit website</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                {place.contact?.email && (
                  <div className="flex items-start space-x-3">
                    <Mail size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Email</h4>
                      <a 
                        href={`mailto:${place.contact.email}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {place.contact.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={getDirectionsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  <Navigation size={20} />
                  <span>Get Directions</span>
                </a>
                
                <button
                  onClick={handleCreateHangout}
                  className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  <UserPlus size={20} />
                  <span>Create Hangout</span>
                </button>
                
                {place.contact?.phone && (
                  <a
                    href={`tel:${place.contact.phone}`}
                    className="flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Phone size={20} />
                    <span>Call Now</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdManager
            placement="place_detail"
            region={place.address?.region || 'Dakar'}
            placeType={place.type}
            size="large"
            className="w-full"
          />
        </div>
      </section>

      {/* Detailed Information Tabs */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: MapPin },
                { id: 'menu', label: 'Menu', icon: Menu, show: place.menu && place.menu.length > 0 },
                { id: 'hours', label: 'Hours & Info', icon: Clock },
                { id: 'features', label: 'Features', icon: Star },
                { id: 'reviews', label: 'Reviews', icon: Users }
              ].filter(tab => tab.show !== false).map(tab => {
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
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">About {place.name}</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{place.description}</p>
                </div>

                {place.cuisine && place.cuisine.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Cuisine Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {place.cuisine.map((cuisine, index) => {
                        const config = getCuisineTypeConfig(cuisine);
                        return (
                          <span
                            key={index}
                            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            <span className="mr-2">{config?.icon || '🍽️'}</span>
                            {config?.name || cuisine}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'menu' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Menu</h3>
                  {place.menu && place.menu.length > 0 ? (
                    <div className="space-y-6">
                      {place.menu.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="bg-gray-50 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <Utensils size={20} className="text-primary-600" />
                            <span>{category.category || 'Menu Items'}</span>
                          </h4>
                          <div className="grid gap-4">
                            {category.items?.map((item, itemIndex) => (
                              <div key={itemIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900">{item.name}</h5>
                                    {item.description && (
                                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                    )}
                                    {item.ingredients && item.ingredients.length > 0 && (
                                      <div className="mt-2">
                                        <p className="text-xs text-gray-500">
                                          Ingredients: {item.ingredients.join(', ')}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  {item.price && (
                                    <div className="ml-4 flex-shrink-0">
                                      <span className="text-lg font-semibold text-primary-600">
                                        {typeof item.price === 'number' 
                                          ? `${item.price.toLocaleString()} FCFA` 
                                          : item.price
                                        }
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {item.tags && item.tags.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-1">
                                    {item.tags.map((tag, tagIndex) => (
                                      <span
                                        key={tagIndex}
                                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Menu size={48} className="text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No Menu Available</h4>
                      <p className="text-gray-600">
                        This place hasn't uploaded their menu yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'hours' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Opening Hours</h3>
                  {openingHours ? (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="space-y-3">
                        {openingHours.map((day, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">{day.day}</span>
                            <span className="text-gray-600">
                              {day.hours?.open && day.hours?.close 
                                ? `${day.hours.open} - ${day.hours.close}`
                                : 'Closed'
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Opening hours not available</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Features & Amenities</h3>
                  {place.features && place.features.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {place.features.map((feature, index) => {
                        const Icon = getFeatureIcon(feature);
                        return (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg"
                          >
                            <Icon size={20} className="text-primary-600" />
                            <span className="font-medium text-gray-900 capitalize">
                              {feature.replace('_', ' ')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">No features listed</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <ReviewsList
                  placeId={id}
                  placeName={place?.name}
                  allowWriteReview={true}
                  title="Customer Reviews"
                  emptyMessage="No reviews yet for this place"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Places */}
      {filteredRelatedPlaces.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                More {typeConfig?.name || 'Places'} in {place.address?.region}
              </h2>
              <Link
                to={`/places?type=${place.type}&region=${place.address?.region}`}
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
              >
                <span>View all</span>
                <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRelatedPlaces.slice(0, 6).map((relatedPlace) => (
                <PlaceCard key={relatedPlace._id} place={relatedPlace} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Image Modal */}
      {showImageModal && imageUrls && imageUrls.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-lg transition-colors duration-200 z-10"
            >
              <X size={24} />
            </button>
            
            <div className="relative">
              <img
                src={imageUrls[selectedImageIndex]}
                alt={place.name}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              
              {imageUrls.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(prev => 
                      prev === 0 ? imageUrls.length - 1 : prev - 1
                    )}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  
                  <button
                    onClick={() => setSelectedImageIndex(prev => 
                      prev === imageUrls.length - 1 ? 0 : prev + 1
                    )}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
            
            <div className="text-center mt-4">
              <span className="text-white text-sm">
                {selectedImageIndex + 1} of {imageUrls.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceDetailPage; 