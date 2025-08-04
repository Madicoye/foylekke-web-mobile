import React from 'react';
import { useQuery } from 'react-query';
import { reviewsAPI } from '../../services/api';

const ReviewsDebug = ({ placeId = null }) => {
  // Test general reviews
  const { data: allReviewsData, isLoading: allLoading, error: allError } = useQuery(
    'debug-all-reviews',
    () => reviewsAPI.getReviews({ limit: 5 }),
    {
      onSuccess: (data) => {
        console.log('✅ All Reviews API Success:', data);
      },
      onError: (error) => {
        console.error('❌ All Reviews API Error:', error);
      }
    }
  );

  // Test place-specific reviews if placeId provided
  const { data: placeReviewsData, isLoading: placeLoading, error: placeError } = useQuery(
    ['debug-place-reviews', placeId],
    () => reviewsAPI.getPlaceReviews(placeId, { limit: 5 }),
    {
      enabled: !!placeId,
      onSuccess: (data) => {
        console.log('✅ Place Reviews API Success:', data);
      },
      onError: (error) => {
        console.error('❌ Place Reviews API Error:', error);
      }
    }
  );

  console.log('🔍 ReviewsDebug State:', {
    allReviews: allReviewsData,
    placeReviews: placeReviewsData,
    allLoading,
    placeLoading,
    allError,
    placeError,
    allReviewsCount: allReviewsData?.reviews?.length || allReviewsData?.length || 0,
    placeReviewsCount: placeReviewsData?.reviews?.length || placeReviewsData?.length || 0,
    averageRating: placeReviewsData?.averageRating || allReviewsData?.averageRating
  });

  const renderReviewsSection = (title, data, loading, error) => {
    if (loading) {
      return (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded mb-3">
          <h4 className="font-bold text-blue-800">🔄 Loading {title}...</h4>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-3 bg-red-50 border border-red-200 rounded mb-3">
          <h4 className="font-bold text-red-800">❌ Error Loading {title}</h4>
          <p className="text-red-600 text-sm">{error.message}</p>
        </div>
      );
    }

    const reviews = data?.reviews || data || [];
    const averageRating = data?.averageRating;
    const totalReviews = data?.total || reviews.length;

    if (reviews.length === 0) {
      return (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded mb-3">
          <h4 className="font-bold text-yellow-800">⚠️ No {title} Found</h4>
          <p className="text-yellow-600 text-sm">No reviews data returned from API</p>
        </div>
      );
    }

    return (
      <div className="p-3 bg-green-50 border border-green-200 rounded mb-3">
        <h4 className="font-bold text-green-800 mb-2">
          ✅ {title} ({reviews.length} reviews)
        </h4>
        
        <div className="space-y-1 text-sm">
          <div><strong>Total Reviews:</strong> {totalReviews}</div>
          {averageRating && (
            <div><strong>Average Rating:</strong> {averageRating.toFixed(1)}⭐</div>
          )}
          
          {reviews.length > 0 && (
            <div>
              <strong>Sample Reviews:</strong>
              <ul className="list-disc list-inside ml-2 mt-1">
                {reviews.slice(0, 3).map((review, index) => (
                  <li key={index} className="text-xs">
                    {review.rating}⭐ - "{review.title || review.content?.substring(0, 40)}..." 
                    {review.user?.name && ` by ${review.user.name}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded">
      <h3 className="font-bold text-gray-800 mb-3">🔍 Reviews API Debug</h3>
      
      {renderReviewsSection('All Reviews', allReviewsData, allLoading, allError)}
      
      {placeId && renderReviewsSection(
        `Place Reviews (${placeId})`, 
        placeReviewsData, 
        placeLoading, 
        placeError
      )}
      
      <details className="mt-3">
        <summary className="cursor-pointer font-medium text-sm">View Raw Data</summary>
        <div className="mt-2 space-y-2">
          <div>
            <strong className="text-xs">All Reviews Data:</strong>
            <pre className="p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(allReviewsData, null, 2)}
            </pre>
          </div>
          {placeId && placeReviewsData && (
            <div>
              <strong className="text-xs">Place Reviews Data:</strong>
              <pre className="p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(placeReviewsData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </details>
    </div>
  );
};

export default ReviewsDebug;