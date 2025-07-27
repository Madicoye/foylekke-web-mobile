import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChatBubbleLeftEllipsisIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from 'react-query';
import { reviewsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const BusinessResponseForm = ({ 
  reviewId, 
  existingResponse = null,
  onSuccess, 
  onCancel,
  isModal = false 
}) => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState(existingResponse?.content || '');
  const [errors, setErrors] = useState({});

  // Business response mutation
  const responseMutation = useMutation(
    (responseContent) => reviewsAPI.respondToReview(reviewId, responseContent),
    {
      onSuccess: () => {
        toast.success(existingResponse ? 'Response updated successfully!' : 'Response posted successfully!');
        queryClient.invalidateQueries(['reviews']);
        queryClient.invalidateQueries(['placeReviews']);
        queryClient.invalidateQueries(['myReviews']);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to save response');
        setErrors(error.response?.data?.errors || {});
      }
    }
  );

  const validateForm = () => {
    const newErrors = {};
    
    if (!content.trim()) {
      newErrors.content = 'Please write a response';
    } else if (content.trim().length < 10) {
      newErrors.content = 'Response must be at least 10 characters long';
    } else if (content.trim().length > 500) {
      newErrors.content = 'Response must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    responseMutation.mutate(content.trim());
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {existingResponse ? 'Edit Business Response' : 'Respond as Business'}
          </h3>
        </div>
        {isModal && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Response Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Thank the customer for their feedback</li>
          <li>• Address specific concerns mentioned in the review</li>
          <li>• Keep responses professional and courteous</li>
          <li>• Invite them to contact you directly for further discussion</li>
        </ul>
      </div>

      {/* Response Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Response *
        </label>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (errors.content) setErrors(prev => ({ ...prev, content: '' }));
          }}
          placeholder="Thank you for your review. We appreciate your feedback and would like to address your concerns..."
          rows={6}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
            errors.content ? 'border-red-300' : 'border-gray-300'
          }`}
          maxLength={500}
        />
        <div className="flex justify-between mt-1">
          {errors.content && (
            <p className="text-sm text-red-600 flex items-center">
              <ExclamationCircleIcon className="h-4 w-4 mr-1" />
              {errors.content}
            </p>
          )}
          <p className="text-xs text-gray-500 ml-auto">
            {content.length}/500
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={responseMutation.isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={responseMutation.isLoading}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {responseMutation.isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>{existingResponse ? 'Updating...' : 'Posting...'}</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-4 w-4" />
              <span>{existingResponse ? 'Update Response' : 'Post Response'}</span>
            </>
          )}
        </motion.button>
      </div>
    </form>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
        >
          {formContent}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {formContent}
    </div>
  );
};

export default BusinessResponseForm; 