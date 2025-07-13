import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const PlaceDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Place Details
          </h1>
          <p className="text-gray-600">
            Place ID: {id}
          </p>
          <p className="text-gray-500 mt-4">
            This page is under development. Coming soon!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PlaceDetailPage; 