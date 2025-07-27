import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/outline';
import ReviewsList from '../components/reviews/ReviewsList';

const ReviewsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <StarIcon className="h-12 w-12 text-yellow-400 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">All Reviews</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover what our community is saying about places around the city. 
              Read authentic reviews and experiences from fellow food enthusiasts.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Reviews Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ReviewsList
            showPlaceNames={true}
            title="Recent Reviews"
            emptyMessage="No reviews available"
            compact={false}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewsPage; 