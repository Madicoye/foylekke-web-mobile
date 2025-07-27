import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon, 
  PhotoIcon, 
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useMutation, useQueryClient } from 'react-query';
import { reviewsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const ReviewForm = ({ 
  placeId, 
  placeName,
  existingReview = null, 
  onSuccess, 
  onCancel,
  isModal = false 
}) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 0,
    title: existingReview?.title || '',
    content: existingReview?.content || '',
    images: []
  });
  
  const [selectedImages, setSelectedImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize existing images if editing
  useEffect(() => {
    if (existingReview?.images) {
      setSelectedImages(existingReview.images.map((url, index) => ({
        id: `existing-${index}`,
        url,
        file: null,
        isExisting: true
      })));
    }
  }, [existingReview]);

  // Create/Update review mutation
  const reviewMutation = useMutation(
    async (formDataToSubmit) => {
      if (existingReview) {
        return await reviewsAPI.updateReview(existingReview._id, formDataToSubmit);
      } else {
        return await reviewsAPI.createReview(formDataToSubmit);
      }
    },
    {
      onSuccess: (data) => {
        toast.success(existingReview ? 'Review updated successfully!' : 'Review posted successfully!');
        queryClient.invalidateQueries(['reviews']);
        queryClient.invalidateQueries(['placeReviews', placeId]);
        queryClient.invalidateQueries(['myReviews']);
        queryClient.invalidateQueries(['place', placeId]);
        onSuccess?.(data);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to save review');
        setErrors(error.response?.data?.errors || {});
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    }
  );

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.rating || formData.rating < 1) {
      newErrors.rating = 'Please select a rating';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Please write a review';
    } else if (formData.content.trim().length < 10) {
      newErrors.content = 'Review must be at least 10 characters long';
    } else if (formData.content.trim().length > 1000) {
      newErrors.content = 'Review must be less than 1000 characters';
    }
    
    if (formData.title && formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Create FormData for multipart upload
    const submitFormData = new FormData();
    submitFormData.append('placeId', placeId);
    submitFormData.append('rating', formData.rating);
    submitFormData.append('content', formData.content.trim());
    
    if (formData.title.trim()) {
      submitFormData.append('title', formData.title.trim());
    }
    
    // Add new images
    selectedImages.forEach((image, index) => {
      if (image.file) {
        submitFormData.append('images', image.file);
      }
    });
    
    // If editing, specify which existing images to keep
    if (existingReview) {
      const existingImagesToKeep = selectedImages
        .filter(img => img.isExisting)
        .map(img => img.url);
      
      if (existingImagesToKeep.length > 0) {
        submitFormData.append('keepImages', JSON.stringify(existingImagesToKeep));
      }
    }

    reviewMutation.mutate(submitFormData);
  };

  const handleImageSelect = (files) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    if (selectedImages.length + validFiles.length > 6) {
      toast.error('You can only upload up to 6 images');
      return;
    }

    const newImages = validFiles.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      file,
      url: URL.createObjectURL(file),
      isExisting: false
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (imageId) => {
    setSelectedImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
      // Clean up object URLs for new images
      const removedImage = prev.find(img => img.id === imageId);
      if (removedImage && !removedImage.isExisting) {
        URL.revokeObjectURL(removedImage.url);
      }
      return updated;
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files);
    }
  };

  const StarRating = ({ rating, onRatingChange, readOnly = false }) => {
    const [hoveredRating, setHoveredRating] = useState(0);
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hoveredRating || rating);
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              className={`transition-all duration-200 ${
                readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
              }`}
              onMouseEnter={() => !readOnly && setHoveredRating(star)}
              onMouseLeave={() => !readOnly && setHoveredRating(0)}
              onClick={() => !readOnly && onRatingChange(star)}
            >
              {filled ? (
                <StarSolidIcon className="h-8 w-8 text-yellow-400" />
              ) : (
                <StarIcon className="h-8 w-8 text-gray-300" />
              )}
            </button>
          );
        })}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'No rating'}
        </span>
      </div>
    );
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {existingReview ? 'Edit Review' : 'Write a Review'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Share your experience at {placeName}
          </p>
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

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Rating *
        </label>
        <StarRating
          rating={formData.rating}
          onRatingChange={(rating) => {
            setFormData(prev => ({ ...prev, rating }));
            if (errors.rating) setErrors(prev => ({ ...prev, rating: '' }));
          }}
        />
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
            {errors.rating}
          </p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title (Optional)
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, title: e.target.value }));
            if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
          }}
          placeholder="Summarize your experience"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors.title ? 'border-red-300' : 'border-gray-300'
          }`}
          maxLength={100}
        />
        <div className="flex justify-between mt-1">
          {errors.title && (
            <p className="text-sm text-red-600 flex items-center">
              <ExclamationCircleIcon className="h-4 w-4 mr-1" />
              {errors.title}
            </p>
          )}
          <p className="text-xs text-gray-500 ml-auto">
            {formData.title.length}/100
          </p>
        </div>
      </div>

      {/* Review Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review *
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, content: e.target.value }));
            if (errors.content) setErrors(prev => ({ ...prev, content: '' }));
          }}
          placeholder="Tell others about your experience. What did you like? What could be improved?"
          rows={6}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
            errors.content ? 'border-red-300' : 'border-gray-300'
          }`}
          maxLength={1000}
        />
        <div className="flex justify-between mt-1">
          {errors.content && (
            <p className="text-sm text-red-600 flex items-center">
              <ExclamationCircleIcon className="h-4 w-4 mr-1" />
              {errors.content}
            </p>
          )}
          <p className="text-xs text-gray-500 ml-auto">
            {formData.content.length}/1000
          </p>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Photos (Optional)
        </label>
        
        {/* Selected Images */}
        {selectedImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {selectedImages.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.url}
                  alt="Review"
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Area */}
        {selectedImages.length < 6 && (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-primary-400 bg-primary-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageSelect(e.target.files)}
              className="hidden"
            />
            
            <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Drag photos here or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-500">
              Up to 6 photos, max 5MB each
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting || reviewMutation.isLoading}
          className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>{existingReview ? 'Updating...' : 'Posting...'}</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-4 w-4" />
              <span>{existingReview ? 'Update Review' : 'Post Review'}</span>
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

export default ReviewForm; 