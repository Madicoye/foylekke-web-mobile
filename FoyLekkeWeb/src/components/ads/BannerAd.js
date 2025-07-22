import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { adsAPI } from '../../services/api';
import { demoAdsAPI, isDemoMode } from '../../services/demoAds';

const BannerAd = ({ ad, onClose, size = 'medium', className = '' }) => {
  // Track impression when component mounts
  useEffect(() => {
    if (ad && ad._id) {
      const apiToUse = isDemoMode() ? demoAdsAPI : adsAPI;
      apiToUse.trackImpression(ad._id).catch(console.error);
    }
  }, [ad]);

  const handleClick = async () => {
    if (ad && ad._id) {
      try {
        const apiToUse = isDemoMode() ? demoAdsAPI : adsAPI;
        await apiToUse.trackClick(ad._id);
        
        // Open link if provided
        if (ad.ctaUrl) {
          window.open(ad.ctaUrl, '_blank', 'noopener,noreferrer');
        }
      } catch (error) {
        console.error('Error tracking ad click:', error);
      }
    }
  };

  if (!ad) return null;

  const sizeClasses = {
    small: 'h-16 md:h-20',
    medium: 'h-24 md:h-32',
    large: 'h-32 md:h-48',
    full: 'h-48 md:h-64'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    full: 'text-xl'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 ${sizeClasses[size]} ${className}`}
    >
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-1 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors duration-200"
        >
          <X size={16} className="text-gray-600" />
        </button>
      )}

      {/* Ad content */}
      <div 
        className="h-full flex items-center cursor-pointer group"
        onClick={handleClick}
      >
        {/* Image */}
        {ad.image && (
          <div className="flex-shrink-0 w-1/3 h-full">
            <img
              src={ad.image}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Content */}
        <div className={`flex-1 p-4 ${ad.image ? 'w-2/3' : 'w-full'}`}>
          <div className="flex items-center justify-between h-full">
            <div className="flex-1">
              <h3 className={`font-bold text-gray-900 mb-1 line-clamp-2 ${textSizes[size]}`}>
                {ad.title}
              </h3>
              
              {ad.description && size !== 'small' && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                  {ad.description}
                </p>
              )}

              {/* Place info if it's a place ad */}
              {ad.place && (
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{ad.place.name}</span>
                  {ad.place.address && (
                    <>
                      <span>•</span>
                      <span>{ad.place.address.street}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="flex-shrink-0 ml-4">
              <div className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1 transition-colors duration-200">
                <span>{ad.ctaText || 'Learn More'}</span>
                <ExternalLink size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsored label */}
      <div className="absolute bottom-1 left-1">
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">
          Sponsored
        </span>
      </div>
    </motion.div>
  );
};

export default BannerAd; 