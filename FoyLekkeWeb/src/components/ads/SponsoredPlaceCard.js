import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, TrendingUp } from 'lucide-react';
import PlaceCard from '../places/PlaceCard';
import { adsAPI } from '../../services/api';
import { demoAdsAPI, isDemoMode } from '../../services/demoAds';

const SponsoredPlaceCard = ({ ad, viewMode = 'grid', className = '' }) => {
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
      } catch (error) {
        console.error('Error tracking ad click:', error);
      }
    }
  };

  if (!ad || !ad.place) return null;

  // Enhanced place object with sponsored features
  const sponsoredPlace = {
    ...ad.place,
    isSponsored: true,
    sponsoredAd: ad,
    featured: true
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative ${className}`}
      onClick={handleClick}
    >
      {/* Sponsored badge overlay */}
      <div className="absolute top-0 left-0 z-10">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-br-lg rounded-tl-lg shadow-lg">
          <div className="flex items-center space-x-1">
            <Crown size={14} />
            <span className="text-xs font-bold">SPONSORED</span>
          </div>
        </div>
      </div>

      {/* Enhanced place card */}
      <div className="relative">
        <PlaceCard place={sponsoredPlace} viewMode={viewMode} />
        
        {/* Sponsored overlay effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/10 to-transparent pointer-events-none rounded-xl" />
        
        {/* Priority indicator */}
        {ad.priority > 5 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white p-1 rounded-full">
            <TrendingUp size={12} />
          </div>
        )}
      </div>

      {/* Custom CTA overlay for sponsored places */}
      {ad.ctaText && ad.ctaUrl && (
        <div className="absolute bottom-3 right-3">
          <a
            href={ad.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            {ad.ctaText}
          </a>
        </div>
      )}
    </motion.div>
  );
};

export default SponsoredPlaceCard; 