import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  StarIcon, 
  HeartIcon, 
  FlagIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  CalendarIcon,
  PhotoIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarSolidIcon, 
  HeartIcon as HeartSolidIcon 
} from '@heroicons/react/24/solid';
import { useMutation, useQueryClient } from 'react-query';
import { reviewsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import StarRating from '../ui/StarRating';
import BusinessResponseForm from './BusinessResponseForm';

const ReviewCard = ({ 
  review, 
  onEdit, 
  onDelete, 
  showPlaceName = false,
  compact = false 
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showImages, setShowImages] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showResponseForm, setShowResponseForm] = useState(false);

  const isOwner = user?._id === review.user._id;
  const hasLiked = review.userReaction === 'like';
  
  // Check if user can respond as business (business owner, admin, or place manager)
  const canRespondAsBusiness = user && (
    user.role === 'admin' || 
    user.role === 'business' ||
    (review.place && review.place.managers?.includes(user._id))
  );

  // Like review mutation
  const likeReviewMutation = useMutation(reviewsAPI.likeReview, {
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews']);
      queryClient.invalidateQueries(['placeReviews']);
      queryClient.invalidateQueries(['myReviews']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to like review');
    }
  });

  // Flag review mutation
  const flagReviewMutation = useMutation(
    ({ reviewId, reason }) => reviewsAPI.flagReview(reviewId, reason),
    {
      onSuccess: () => {
        toast.success('Review flagged for moderation');
        queryClient.invalidateQueries(['reviews']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to flag review');
      }
    }
  );

  const handleLike = () => {
    if (likeReviewMutation.isLoading) return;
    likeReviewMutation.mutate(review._id);
  };

  const handleFlag = () => {
    const reason = prompt('Please specify the reason for flagging this review:');
    if (reason && reason.trim()) {
      flagReviewMutation.mutate({ reviewId: review._id, reason: reason.trim() });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const ImageGallery = () => {
    if (!review.images || review.images.length === 0) return null;

    return (
      <div className="mt-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {review.images.slice(0, 6).map((image, index) => (
            <div key={index} className="relative">
              <motion.img
                whileHover={{ scale: 1.02 }}
                src={image}
                alt={`Review image ${index + 1}`}
                className="w-full h-20 sm:h-24 object-cover rounded-lg cursor-pointer"
                onClick={() => {
                  setSelectedImageIndex(index);
                  setShowImages(true);
                }}
              />
              {index === 5 && review.images.length > 6 && (
                <div 
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    setSelectedImageIndex(index);
                    setShowImages(true);
                  }}
                >
                  <span className="text-white font-semibold">
                    +{review.images.length - 6}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const BusinessResponse = () => {
    if (!review.businessResponse) return null;

    return (
      <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
              <ChatBubbleLeftEllipsisIcon className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-900">Business Response</span>
                <span className="text-xs text-blue-600">
                  {formatDate(review.businessResponse.createdAt)}
                </span>
              </div>
              {canRespondAsBusiness && (
                <button
                  onClick={() => setShowResponseForm(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Edit
                </button>
              )}
            </div>
            <p className="text-sm text-blue-800">{review.businessResponse.content}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-lg shadow-sm border border-gray-200 ${
          compact ? 'p-4' : 'p-6'
        } hover:shadow-md transition-shadow duration-200`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            {/* User Avatar */}
            <div className="flex-shrink-0">
              {review.user.profilePicture ? (
                <img
                  src={review.user.profilePicture}
                  alt={review.user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                {review.user.isVerified && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Verified
                  </span>
                )}
              </div>
              
              {/* Place name (if showing in profile) */}
              {showPlaceName && review.place && (
                <p className="text-sm text-gray-600 mt-1">
                  Reviewed {review.place.name}
                </p>
              )}

              {/* Rating and Date */}
              <div className="flex items-center space-x-3 mt-1">
                <StarRating rating={review.rating} size="sm" readOnly />
                <div className="flex items-center text-sm text-gray-500 space-x-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formatDate(review.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {isOwner && (
              <>
                <button
                  onClick={() => onEdit(review)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                  title="Edit review"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(review._id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                  title="Delete review"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </>
            )}
            {!isOwner && user && (
              <button
                onClick={handleFlag}
                disabled={flagReviewMutation.isLoading}
                className="p-1.5 text-gray-400 hover:text-orange-600 rounded-full hover:bg-orange-50 transition-colors"
                title="Flag review"
              >
                <FlagIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Review Content */}
        <div className="mb-4">
          {review.title && (
            <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
          )}
          <p className="text-gray-700 leading-relaxed">{review.content}</p>
        </div>

        {/* Images */}
        <ImageGallery />

        {/* Business Response */}
        <BusinessResponse />

        {/* Business Response Button */}
        {canRespondAsBusiness && !review.businessResponse && (
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowResponseForm(true)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
              <span>Respond as Business</span>
            </button>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              disabled={likeReviewMutation.isLoading || !user}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
                hasLiked
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              {hasLiked ? (
                <HeartSolidIcon className="h-4 w-4" />
              ) : (
                <HeartIcon className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {review.likesCount || 0}
              </span>
            </motion.button>

            {/* Images count */}
            {review.images && review.images.length > 0 && (
              <div className="flex items-center space-x-1 text-gray-500">
                <PhotoIcon className="h-4 w-4" />
                <span className="text-sm">{review.images.length}</span>
              </div>
            )}
          </div>

          {/* Review helpful indicator */}
          {review.isHelpful && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Helpful
            </span>
          )}
        </div>
      </motion.div>

      {/* Image Modal */}
      {showImages && review.images && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setShowImages(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <img
              src={review.images[selectedImageIndex]}
              alt={`Review image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {review.images.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {review.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-3 h-3 rounded-full ${
                      index === selectedImageIndex ? 'bg-white' : 'bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Business Response Form Modal */}
      {showResponseForm && (
        <BusinessResponseForm
          reviewId={review._id}
          existingResponse={review.businessResponse}
          onSuccess={() => setShowResponseForm(false)}
          onCancel={() => setShowResponseForm(false)}
          isModal={true}
        />
      )}
    </>
  );
};

export default ReviewCard; 