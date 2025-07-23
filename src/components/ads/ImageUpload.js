import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { adsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const ImageUpload = ({ 
  onImageUpload, 
  onImageRemove, 
  existingImages = [], 
  maxImages = 5,
  maxSizeInMB = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
}) => {
  const [uploadedImages, setUploadedImages] = useState(existingImages);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Please upload ${acceptedTypes.join(', ')} files only.`;
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return `File size too large. Maximum size is ${maxSizeInMB}MB.`;
    }

    return null;
  };

  const handleFileUpload = async (files) => {
    const fileArray = Array.from(files);
    
    // Check if adding these files would exceed the limit
    if (uploadedImages.length + fileArray.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate each file
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }
    }

    setUploading(true);

    try {
      const uploadPromises = fileArray.map(file => adsAPI.uploadAdImage(file));
      const uploadResults = await Promise.all(uploadPromises);

      const newImages = uploadResults.map((result, index) => ({
        id: Date.now() + index,
        imageUrl: result.imageUrl,
        publicId: result.publicId,
        file: fileArray[index]
      }));

      const updatedImages = [...uploadedImages, ...newImages];
      setUploadedImages(updatedImages);
      
      if (onImageUpload) {
        onImageUpload(updatedImages);
      }

      toast.success(`${newImages.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (image) => {
    try {
      if (image.publicId) {
        await adsAPI.deleteAdImage(image.publicId);
      }

      const updatedImages = uploadedImages.filter(img => img.id !== image.id);
      setUploadedImages(updatedImages);
      
      if (onImageRemove) {
        onImageRemove(image, updatedImages);
      }

      toast.success('Image removed successfully');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
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
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
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
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="text-sm text-gray-600">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop images here or{' '}
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Up to {maxImages} images, max {maxSizeInMB}MB each
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported formats: JPG, PNG, GIF, WebP
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Images Grid */}
      <AnimatePresence>
        {uploadedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {uploadedImages.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image.imageUrl}
                    alt="Uploaded ad creative"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveImage(image)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X size={16} />
                </button>

                {/* Image Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs truncate">
                    {image.file?.name || 'Uploaded image'}
                  </p>
                  <p className="text-xs text-gray-300">
                    {image.file?.size ? `${(image.file.size / 1024 / 1024).toFixed(1)}MB` : ''}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-medium text-blue-900 mb-1">Image Guidelines</h4>
            <ul className="text-blue-700 space-y-1">
              <li>• Use high-quality images (minimum 800x600 pixels)</li>
              <li>• Ensure images are relevant to your ad content</li>
              <li>• Avoid images with excessive text overlay</li>
              <li>• Use professional, clear, and engaging visuals</li>
              <li>• Images will be automatically optimized for web</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Status */}
      {uploadedImages.length > 0 && (
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <CheckCircle size={16} />
          <span>{uploadedImages.length} image(s) uploaded</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 