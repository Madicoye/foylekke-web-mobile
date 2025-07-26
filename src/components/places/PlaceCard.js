import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Heart,
  TrendingUp,
  Globe,
  Star,
  DollarSign,
  ThumbsUp,
  ThumbsDown,
  Menu
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { placesAPI } from '../../services/api';
import StarRating from '../ui/StarRating';
import { getPlaceTypeConfig } from '../../config/placeTypes';
import { getImageUrls } from '../../utils/imageUtils';
import { toast } from 'react-hot-toast';

const PlaceCard = ({ place, viewMode = 'grid' }) => {
  const { user, toggleFavorite } = useAuth();
  const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0, userVote: null });
  const [isVoting, setIsVoting] = useState(false);
  const isFavorite = user?.favorites?.includes(place._id);

  // Load votes on component mount
  useEffect(() => {
    if (place._id) {
      loadVotes();
    }
  }, [place._id]);

  const loadVotes = async () => {
    try {
      const votesData = await placesAPI.getPlaceVotes(place._id);
      setVotes(votesData);
    } catch (error) {
      console.error('Error loading votes:', error);
      // Set default values if API call fails
      setVotes({ upvotes: 0, downvotes: 0, userVote: null });
    }
  };

  const handleVote = async (voteType, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please log in to vote');
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    try {
      // If user already voted the same way, remove the vote
      if (votes.userVote === voteType) {
        await placesAPI.removeVote(place._id);
        await loadVotes();
        toast.success('Vote removed');
      } else {
        // Otherwise, add/change the vote
        await placesAPI.voteOnPlace(place._id, voteType);
        await loadVotes();
        toast.success(`${voteType === 'upvote' ? 'Upvoted' : 'Downvoted'} successfully`);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const getTypeColor = (type) => {
    const config = getPlaceTypeConfig(type);
    if (!config) return 'bg-gray-100 text-gray-800';
    
    const colorMap = {
      'bg-red-500': 'bg-red-100 text-red-800',
      'bg-green-500': 'bg-green-100 text-green-800',
      'bg-blue-500': 'bg-blue-100 text-blue-800',
      'bg-purple-500': 'bg-purple-100 text-purple-800',
      'bg-yellow-500': 'bg-yellow-100 text-yellow-800',
      'bg-orange-500': 'bg-orange-100 text-orange-800',
      'bg-pink-500': 'bg-pink-100 text-pink-800',
      'bg-indigo-500': 'bg-indigo-100 text-indigo-800',
      'bg-teal-500': 'bg-teal-100 text-teal-800',
      'bg-emerald-500': 'bg-emerald-100 text-emerald-800',
      'bg-gray-500': 'bg-gray-100 text-gray-800'
    };
    return colorMap[config.color] || 'bg-gray-100 text-gray-800';
  };

  const imageUrls = getImageUrls(place);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      toggleFavorite(place._id);
    }
  };

  const formatRating = (rating) => {
    if (!rating) return 'No ratings';
    return rating.toFixed(1);
  };

  const formatReviewCount = (count) => {
    if (!count || count === 0) return '0 reviews';
    if (count === 1) return '1 review';
    return `${count} reviews`;
  };

  const formatPriceLevel = (priceLevel) => {
    if (!priceLevel) return 'N/A';
    const levels = {
      'low': { text: 'Budget', color: 'text-green-600', icon: '$' },
      'medium': { text: 'Moderate', color: 'text-yellow-600', icon: '$$' },
      'high': { text: 'Expensive', color: 'text-red-600', icon: '$$$' }
    };
    return levels[priceLevel.toLowerCase()] || { text: priceLevel, color: 'text-gray-600', icon: '$' };
  };

  const getDefaultImage = (type) => {
    const config = getPlaceTypeConfig(type);
    return {
      icon: config?.icon || '📍',
      gradient: 'from-primary-100 to-accent-100'
    };
  };

  const hasMenu = place.menu && place.menu.length > 0;
  const rating = place.ratings?.appRating || place.ratings?.googleRating || 0;
  const reviewCount = place.ratings?.reviewCount || 0;
  const priceInfo = formatPriceLevel(place.priceRange);
  const defaultImg = getDefaultImage(place.type);

  // Voting component for reuse
  const VotingSection = ({ className = "" }) => (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={(e) => handleVote('upvote', e)}
        disabled={isVoting}
        className={`p-1 rounded-full transition-all duration-200 hover:scale-110 ${
          votes.userVote === 'upvote' 
            ? 'bg-green-100 text-green-600' 
            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
        } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <ThumbsUp size={16} className={votes.userVote === 'upvote' ? 'fill-current' : ''} />
      </button>
      <span className="text-xs text-green-600 font-medium min-w-[1rem]">
        {votes.upvotes || 0}
      </span>
      
      <button
        onClick={(e) => handleVote('downvote', e)}
        disabled={isVoting}
        className={`p-1 rounded-full transition-all duration-200 hover:scale-110 ${
          votes.userVote === 'downvote' 
            ? 'bg-red-100 text-red-600' 
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
        } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <ThumbsDown size={16} className={votes.userVote === 'downvote' ? 'fill-current' : ''} />
      </button>
      <span className="text-xs text-red-600 font-medium min-w-[1rem]">
        {votes.downvotes || 0}
      </span>
    </div>
  );

  // List view layout
  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ x: 5 }}
        className="group"
      >
        <Link to={`/places/${place._id}`} className="block">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100">
            <div className="flex">
              {/* Image Section - List View */}
              <div className="relative w-48 h-32 overflow-hidden flex-shrink-0">
                {imageUrls && imageUrls.length > 0 ? (
                  <img
                    src={imageUrls[0]}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                <div 
                  className={`w-full h-full bg-gradient-to-br ${defaultImg.gradient} flex items-center justify-center ${imageUrls && imageUrls.length > 0 ? 'hidden' : 'flex'}`}
                >
                  <span className="text-2xl">{defaultImg.icon}</span>
                </div>
                
                {/* Type Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(place.type)}`}>
                    {place.type ? place.type.replace('_', ' ').toUpperCase() : 'PLACE'}
                  </span>
                </div>

                {/* Menu Available Badge */}
                {hasMenu && (
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center space-x-1">
                      <Menu size={12} />
                      <span>Menu</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Content Section - List View */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-1">
                      {place.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <VotingSection />
                      {user && (
                        <button
                          onClick={handleFavoriteClick}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        >
                          <Heart
                            size={18}
                            className={`${
                              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                            } hover:text-red-500 transition-colors duration-200`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star size={16} className="text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatRating(rating)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        ({formatReviewCount(reviewCount)})
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <DollarSign size={14} className={priceInfo.color} />
                      <span className={`text-sm font-medium ${priceInfo.color}`}>
                        {priceInfo.text}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2 mb-2">
                    <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {place.address?.street || place.description || 'Location not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone size={14} className="text-gray-400" />
                    <span>{place.contact?.phone || 'N/A'}</span>
                  </div>
                  
                  {place.cuisine && place.cuisine.length > 0 && (
                    <div className="flex space-x-1">
                      {place.cuisine.slice(0, 2).map((cuisine, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                        >
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Grid view layout (default)
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group h-full"
    >
      <Link to={`/places/${place._id}`} className="block h-full">
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 h-full flex flex-col">
          {/* Image Section - Fixed Height */}
          <div className="relative h-48 overflow-hidden flex-shrink-0">
            {imageUrls && imageUrls.length > 0 ? (
              <img
                src={imageUrls[0]}
                alt={place.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            
            {/* Default Image Placeholder */}
            <div 
              className={`w-full h-full bg-gradient-to-br ${defaultImg.gradient} flex items-center justify-center ${imageUrls && imageUrls.length > 0 ? 'hidden' : 'flex'}`}
            >
              <span className="text-4xl">{defaultImg.icon}</span>
            </div>
            
            {/* Favorite Button */}
            {user && (
              <button
                onClick={handleFavoriteClick}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors duration-200"
              >
                <Heart
                  size={18}
                  className={`${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                  } hover:text-red-500 transition-colors duration-200`}
                />
              </button>
            )}

            {/* Type Badge */}
            <div className="absolute top-3 left-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(place.type)}`}>
                {place.type ? place.type.replace('_', ' ').toUpperCase() : 'PLACE'}
              </span>
            </div>

            {/* Menu Available Badge */}
            {hasMenu && (
              <div className="absolute bottom-3 right-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center space-x-1">
                  <Menu size={12} />
                  <span>Menu</span>
                </span>
              </div>
            )}

            {/* Featured Badge */}
            {place.featured && (
              <div className="absolute bottom-3 left-3">
                <span className="px-2 py-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full text-xs font-medium flex items-center space-x-1">
                  <TrendingUp size={12} />
                  <span>FEATURED</span>
                </span>
              </div>
            )}
          </div>

          {/* Content Section - Flexible Height */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Title and Voting */}
            <div className="mb-3">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2 flex-1 mr-2">
                  {place.name}
                </h3>
                <VotingSection className="flex-shrink-0" />
              </div>
              
              {/* Rating and Price Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star size={16} className="text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatRating(rating)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    ({formatReviewCount(reviewCount)})
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <DollarSign size={14} className={priceInfo.color} />
                  <span className={`text-sm font-medium ${priceInfo.color}`}>
                    {priceInfo.text}
                  </span>
                </div>
              </div>
            </div>

            {/* Location - Fixed Height */}
            <div className="flex items-start space-x-2 mb-3 min-h-[2.5rem]">
              <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 line-clamp-2">
                {place.address?.street || place.description || 'Location not specified'}
              </p>
            </div>

            {/* Contact Info - Fixed Height */}
            <div className="space-y-2 mb-3 min-h-[4rem]">
              {/* Phone */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone size={14} className="text-gray-400" />
                <span>{place.contact?.phone || 'Phone not available'}</span>
              </div>

              {/* Website */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Globe size={14} className="text-gray-400" />
                <span>{place.contact?.website ? 'Website available' : 'No website'}</span>
              </div>
            </div>

            {/* Tags/Cuisine - Fixed Height */}
            <div className="min-h-[2.5rem] mb-3">
              {place.cuisine && place.cuisine.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {place.cuisine.slice(0, 2).map((cuisine, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                    >
                      {cuisine}
                    </span>
                  ))}
                  {place.cuisine.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{place.cuisine.length - 2} more
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-gray-400">No cuisine info</span>
              )}
            </div>

            {/* Bottom Section - Type Specific Info */}
            <div className="mt-auto pt-3 border-t border-gray-100">
              {place.type === 'restaurant' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Cuisine: {place.cuisine?.length > 0 ? place.cuisine.slice(0, 2).join(', ') : 'Various'}
                  </span>
                  <div className="flex items-center space-x-2">
                    {hasMenu && (
                      <span className="text-blue-600 font-medium text-xs bg-blue-100 px-2 py-1 rounded">
                        Menu
                      </span>
                    )}
                    {place.features?.includes('delivery') && (
                      <span className="text-green-600 font-medium text-xs bg-green-100 px-2 py-1 rounded">
                        Delivery
                      </span>
                    )}
                  </div>
                </div>
              )}

              {place.type === 'park' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Size: {place.parkData?.size || 'N/A'}
                  </span>
                  {place.parkData?.hasPlayground && (
                    <span className="text-blue-600 font-medium text-xs bg-blue-100 px-2 py-1 rounded">
                      Playground
                    </span>
                  )}
                </div>
              )}

              {place.type === 'museum' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Type: {place.museumData?.museumType || 'General'}
                  </span>
                  {place.museumData?.hasGuidedTours && (
                    <span className="text-purple-600 font-medium text-xs bg-purple-100 px-2 py-1 rounded">
                      Guided Tours
                    </span>
                  )}
                </div>
              )}

              {!['restaurant', 'park', 'museum'].includes(place.type) && (
                <div className="text-sm text-gray-600">
                  <span>Hours: {place.openingHours ? 'Available' : 'Not specified'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PlaceCard; 