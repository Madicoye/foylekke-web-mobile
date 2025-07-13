import React, { useState, useEffect } from 'react';
import { adsAPI } from '../../services/api';
import GoogleAdsense from './GoogleAdsense';
import BannerAd from './BannerAd';
import SponsoredPlaceCard from './SponsoredPlaceCard';

const AdManager = ({ 
  placement, 
  region = 'Dakar', 
  placeType = null, 
  limit = 3,
  className = '',
  size = 'medium',
  viewMode = 'grid'
}) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Google AdSense configuration
  // TODO: Replace these with your actual Google AdSense account details
  // 1. Sign up for Google AdSense at https://www.google.com/adsense/
  // 2. Get your publisher ID (ca-pub-XXXXXXXXXXXXXXXXX)
  // 3. Create ad units for each placement and get their slot IDs
  // 4. Replace the values below with your actual IDs
  const googleAdSenseConfig = {
    adClient: 'ca-pub-1234567890123456', // Replace with your actual AdSense publisher ID
    slots: {
      homepage_hero: '1234567890',          // Replace with your homepage hero ad unit ID
      homepage_between_sections: '2345678901', // Replace with your homepage sections ad unit ID
      places_list: '3456789012',            // Replace with your places list ad unit ID
      place_detail: '4567890123',           // Replace with your place detail ad unit ID
      search_results: '5678901234',         // Replace with your search results ad unit ID
      sidebar: '6789012345'                 // Replace with your sidebar ad unit ID
    }
  };

  useEffect(() => {
    fetchAds();
  }, [placement, region, placeType, limit]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adsAPI.getPlacementAds(placement, {
        region,
        placeType,
        limit
      });

      setAds(response || []);
    } catch (err) {
      console.error('Error fetching ads:', err);
      setError('Failed to load advertisements');
    } finally {
      setLoading(false);
    }
  };

  const renderGoogleAd = () => {
    const adSlot = googleAdSenseConfig.slots[placement];
    if (!adSlot) return null;

    return (
      <GoogleAdsense
        adClient={googleAdSenseConfig.adClient}
        adSlot={adSlot}
        adFormat="auto"
        className={className}
        style={{ minHeight: '100px' }}
      />
    );
  };

  const renderCustomAd = (ad) => {
    switch (ad.type) {
      case 'banner':
        return (
          <BannerAd
            key={ad._id}
            ad={ad}
            size={size}
            className={className}
          />
        );
      
      case 'sponsored_place':
        return (
          <SponsoredPlaceCard
            key={ad._id}
            ad={ad}
            viewMode={viewMode}
            className={className}
          />
        );
      
      case 'native':
        return (
          <NativeAd
            key={ad._id}
            ad={ad}
            className={className}
          />
        );
      
      default:
        return null;
    }
  };

  const renderAds = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-4 text-gray-500">
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (ads.length === 0) {
      // Show Google AdSense as fallback if no custom ads
      return renderGoogleAd();
    }

    // Mix custom ads with Google AdSense
    const customAds = ads.filter(ad => ad.source === 'custom');
    const googleAds = ads.filter(ad => ad.source === 'google_adsense');

    return (
      <div className="space-y-4">
        {/* Custom ads */}
        {customAds.map(renderCustomAd)}
        
        {/* Google AdSense ads */}
        {googleAds.length > 0 && renderGoogleAd()}
        
        {/* Fallback Google AdSense if no custom ads */}
        {customAds.length === 0 && renderGoogleAd()}
      </div>
    );
  };

  // Don't render anything if no placement is specified
  if (!placement) return null;

  return (
    <div className={`ad-manager ${className}`}>
      {renderAds()}
    </div>
  );
};

// Native ad component for content-style ads
const NativeAd = ({ ad, className = '' }) => {
  const handleClick = async () => {
    if (ad && ad._id) {
      try {
        await adsAPI.trackClick(ad._id);
        
        if (ad.ctaUrl) {
          window.open(ad.ctaUrl, '_blank', 'noopener,noreferrer');
        }
      } catch (error) {
        console.error('Error tracking ad click:', error);
      }
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow duration-200 ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-4">
        {ad.image && (
          <img
            src={ad.image}
            alt={ad.title}
            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
          />
        )}
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{ad.title}</h3>
          {ad.description && (
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{ad.description}</p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-primary-600 text-sm font-medium">
              {ad.ctaText || 'Learn More'}
            </span>
            <span className="text-xs text-gray-400">Sponsored</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdManager; 