import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FunnelIcon,
  ArrowUpDownIcon,
  StarIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { reviewsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

const ReviewsList = ({ 
  placeId = null, 
  userId = null, 
  showPlaceNames = false,
  allowWriteReview = false,
  placeName = '',
  title = 'Reviews',
  emptyMessage = 'No reviews yet',
  compact = false
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State
  const [filters, setFilters] = useState({
    rating: '',
    sortBy: 'newest', // newest, oldest, highest, lowest, helpful
    withPhotos: false,
    verified: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Build query parameters
  const queryParams = {
    page,
    limit,
    ...(placeId && { placeId }),
    ...(userId && { userId }),
    ...(filters.rating && { rating: filters.rating }),
    ...(filters.withPhotos && { withPhotos: true }),
    ...(filters.verified && { verified: true }),
    sortBy: filters.sortBy
  };

  // Fetch reviews
  const { data: reviewsData, isLoading, error } = useQuery(
    [placeId ? 'placeReviews' : userId ? 'userReviews' : 'reviews', queryParams],
    () => {
      if (placeId) {
        return reviewsAPI.getPlaceReviews(placeId, queryParams);
      } else if (userId) {
        return reviewsAPI.getMyReviews(queryParams);
      } else {
        return reviewsAPI.getReviews(queryParams);
      }
    },
    {
      keepPreviousData: true,
    }
  );

  // Delete review mutation
  const deleteReviewMutation = useMutation(reviewsAPI.deleteReview, {
    onSuccess: () => {
      toast.success('Review deleted successfully');
      queryClient.invalidateQueries(['reviews']);
      queryClient.invalidateQueries(['placeReviews']);
      queryClient.invalidateQueries(['myReviews']);
      queryClient.invalidateQueries(['place', placeId]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  });

  const reviews = reviewsData?.reviews || [];
  const totalReviews = reviewsData?.total || 0;
  const totalPages = Math.ceil(totalReviews / limit);
  const averageRating = reviewsData?.averageRating || 0;
  const ratingBreakdown = reviewsData?.ratingBreakdown || {};

  // Check if user already has a review for this place
  const userHasReview = placeId && user && reviews.some(review => review.user._id === user._id);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const handleDeleteReview = (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleReviewFormSuccess = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const handleReviewFormCancel = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const RatingBreakdown = () => {
    if (!placeId || !ratingBreakdown || Object.keys(ratingBreakdown).length === 0) return null;

    const maxCount = Math.max(...Object.values(ratingBreakdown));

    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Rating Breakdown</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = ratingBreakdown[rating] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm text-gray-600">{rating}</span>
                  <StarSolidIcon className="h-3 w-3 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const FilterBar = () => (
    <div className="bg-white border-b border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <FunnelIcon className="h-5 w-5" />
          <span>Filters</span>
        </button>
        
        <div className="flex items-center space-x-4">
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200"
          >
            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Any Rating</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
            </div>

            {/* Photos Filter */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.withPhotos}
                  onChange={(e) => handleFilterChange('withPhotos', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">With Photos</span>
              </label>
            </div>

            {/* Verified Filter */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => handleFilterChange('verified', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Verified Reviewers</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load reviews</h3>
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {totalReviews > 0 && (
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarSolidIcon
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {averageRating.toFixed(1)} ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Write Review Button */}
        {allowWriteReview && user && !userHasReview && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Write Review
          </button>
        )}
      </div>

      {/* Rating Breakdown */}
      <RatingBreakdown />

      {/* Filter Bar */}
      {totalReviews > 0 && <FilterBar />}

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <StarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
          <p className="text-gray-600 mb-6">
            {allowWriteReview && user && !userHasReview
              ? 'Be the first to share your experience!'
              : 'Check back later for reviews from other users.'}
          </p>
          {allowWriteReview && user && !userHasReview && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Write the First Review
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
              showPlaceName={showPlaceNames}
              compact={compact}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex space-x-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
              const isActive = pageNum === page;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 text-sm border rounded-lg ${
                    isActive
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <ReviewForm
            placeId={placeId}
            placeName={placeName}
            existingReview={editingReview}
            onSuccess={handleReviewFormSuccess}
            onCancel={handleReviewFormCancel}
            isModal={true}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewsList; 