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
import useTranslation from '../../hooks/useTranslation';

const ReviewCard = ({ 
  review, 
  onEdit, 
  onDelete, 
  showPlaceName = false,
  compact = false 
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [showImages, setShowImages] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showResponseForm, setShowResponseForm] = useState(false);

  // Like review mutation - must be called before any conditional returns
  const likeReviewMutation = useMutation(reviewsAPI.likeReview, {
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews']);
      queryClient.invalidateQueries(['placeReviews']);
      queryClient.invalidateQueries(['myReviews']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('reviews.failedToLike'));
    }
  });

  // Flag review mutation - must be called before any conditional returns
  const flagReviewMutation = useMutation(
    ({ reviewId, reason }) => reviewsAPI.flagReview(reviewId, reason),
    {
      onSuccess: () => {
        toast.success(t('reviews.reviewFlagged'));
        queryClient.invalidateQueries(['reviews']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || t('reviews.failedToFlag'));
      }
    }
  );

  // Guard clause to handle null/undefined review - after all hooks
  if (!review) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 text-center">
        <p className="text-gray-500">{t('reviews.reviewDataNotAvailable')}</p>
      </div>
    );
  }

  // Determine review type and extract common fields
  const isGoogleReview = review.reviewType === 'google' || review.source === 'google_places';
  const reviewText = review.text || review.content || '';
  const authorName = review.authorName || review.user?.name || t('reviews.anonymousUser');
  const authorPhoto = review.authorPhotoUrl || review.user?.profilePicture;
  const reviewDate = review.timeCreated || review.createdAt;
  const isVerified = review.user?.isVerified || isGoogleReview; // Google reviews are always "verified"
  
  // For user reviews, check ownership
  const isOwner = !isGoogleReview && user?._id === review.user?._id;
  const hasLiked = review.userReaction === 'like';
  
  // Check if user can respond as business (business owner, admin, or place manager)
  const canRespondAsBusiness = user && (
    user.role === 'admin' || 
    user.role === 'business' ||
    (review.place && review.place.managers?.includes(user._id))
  );

  const handleLike = () => {
    if (likeReviewMutation.isLoading) return;
    likeReviewMutation.mutate(review._id);
  };

  const handleFlag = () => {
    const reason = prompt(t('reviews.flagReason'));
    if (reason && reason.trim()) {
      flagReviewMutation.mutate({ reviewId: review._id, reason: reason.trim() });
    }
  };

  const formatDate = (dateString, relativeDescription = null) => {
    // For Google reviews, use their relative time description if available
    if (relativeDescription) {
      return relativeDescription;
    }
    
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return t('common.today');
    if (diffInDays === 1) return t('common.yesterday');
    if (diffInDays < 7) return `${diffInDays} ${t('reviews.timeAgo.daysAgo')}`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} ${t('reviews.timeAgo.weeksAgo')}`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} ${t('reviews.timeAgo.monthsAgo')}`;
    return date.toLocaleDateString('fr-FR');
  };

  const ImageGallery = () => {
    // Handle both Google reviews (mainPhoto) and user reviews (images array)
    const images = [];
    
    if (review.mainPhoto?.url) {
      images.push(review.mainPhoto.url);
    }
    
    if (review.images && Array.isArray(review.images)) {
      images.push(...review.images);
    }
    
    if (images.length === 0) return null;

    return (
      <div className="mb-3">
        <div className="grid grid-cols-3 gap-1.5">
          {images.slice(0, 3).map((image, index) => (
            <div key={index} className="relative">
              <motion.img
                whileHover={{ scale: 1.02 }}
                src={image}
                alt={`${t('reviews.reviewImage')} ${index + 1}`}
                className="w-full h-16 object-cover rounded-lg cursor-pointer"
                onClick={() => {
                  setSelectedImageIndex(index);
                  setShowImages(true);
                }}
              />
              {index === 2 && images.length > 3 && (
                <div 
                  className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    setSelectedImageIndex(index);
                    setShowImages(true);
                  }}
                >
                  <span className="text-white font-medium text-xs">
                    +{images.length - 3}
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
                <span className="text-sm font-medium text-blue-900">{t('reviews.businessResponse')}</span>
                <span className="text-xs text-blue-600">
                  {formatDate(review.businessResponse.createdAt)}
                </span>
              </div>
              {canRespondAsBusiness && (
                <button
                  onClick={() => setShowResponseForm(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t('common.edit')}
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1">
            {/* User Avatar */}
            <div className="flex-shrink-0">
              {authorPhoto ? (
                <img
                  src={authorPhoto}
                  alt={authorName}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-100"
                />
              ) : (
                <div className="h-8 w-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                </div>
              )}
            </div>

            {/* User Info and Rating */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm truncate">{authorName}</h4>
                  {isGoogleReview ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                      G
                    </span>
                  ) : isVerified && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
                      ✓
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarSolidIcon
                      key={star}
                      className={`h-3.5 w-3.5 ${
                        star <= review.rating ? 'text-amber-400' : 'text-gray-200'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1 font-medium">{review.rating}</span>
                </div>
              </div>
              
              {/* Place name and Date */}
              <div className="flex items-center justify-between mt-1">
                                  {showPlaceName && review.place ? (
                  <p className="text-xs text-gray-500 truncate">
                    {t('reviews.reviewedAt')} {review.place.name}
                  </p>
                ) : (
                  <div></div>
                )}
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {formatDate(reviewDate, review.relativeTimeDescription)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isOwner && !isGoogleReview && (
              <>
                <button
                  onClick={() => onEdit(review)}
                  className="p-1 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                  title={t('reviews.editReview')}
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDelete(review._id)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                  title={t('reviews.deleteReview')}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            {!isOwner && user && !isGoogleReview && (
              <button
                onClick={handleFlag}
                disabled={flagReviewMutation.isLoading}
                className="p-1 text-gray-400 hover:text-orange-600 rounded-md hover:bg-orange-50 transition-colors"
                title={t('reviews.flagReview')}
              >
                <FlagIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Review Content */}
        <div className="mb-3">
          {review.title && (
            <h5 className="font-medium text-gray-900 mb-1.5 text-sm">{review.title}</h5>
          )}
          <p 
            className="text-gray-600 text-sm leading-relaxed" 
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {reviewText}
          </p>
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
              <span>{t('reviews.respondAsBusiness')}</span>
            </button>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center space-x-3">
            {/* Like Button - only for user reviews */}
            {!isGoogleReview && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                disabled={likeReviewMutation.isLoading || !user}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                  hasLiked
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                {hasLiked ? (
                  <HeartSolidIcon className="h-3.5 w-3.5" />
                ) : (
                  <HeartIcon className="h-3.5 w-3.5" />
                )}
                <span>{review.likesCount || 0}</span>
              </motion.button>
            )}

            {/* Images count - unified for both review types */}
            {(() => {
              const imageCount = (review.mainPhoto ? 1 : 0) + (review.images?.length || 0);
              return imageCount > 0 ? (
                <div className="flex items-center space-x-1 text-gray-400 text-xs">
                  <PhotoIcon className="h-3.5 w-3.5" />
                  <span>{imageCount} {imageCount === 1 ? t('reviews.photo') : t('reviews.photos')}</span>
                </div>
              ) : null;
            })()}
          </div>

          <div className="flex items-center space-x-2">
            {/* Google Reviews source indicator */}
            {isGoogleReview && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                {t('reviews.googleReviews')}
              </span>
            )}
            
            {/* Review helpful indicator */}
            {review.isHelpful && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-600 border border-green-200">
                {t('reviews.helpful')}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Image Modal */}
      {showImages && (() => {
        // Build unified images array for modal
        const modalImages = [];
        if (review.mainPhoto?.url) modalImages.push(review.mainPhoto.url);
        if (review.images && Array.isArray(review.images)) modalImages.push(...review.images);
        
        return modalImages.length > 0 && (
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
                src={modalImages[selectedImageIndex]}
                alt={`${t('reviews.reviewImage')} ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
              
              {modalImages.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {modalImages.map((_, index) => (
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
        );
      })()}

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