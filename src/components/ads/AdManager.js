import React, { useState, useEffect } from 'react';
import { adsAPI } from '../../services/api';
import { demoAdsAPI, isDemoMode } from '../../services/demoAds';
import { defaultAdsAPI, shouldShowDefaultAds } from '../../services/defaultAds';
import GoogleAdsense from './GoogleAdsense';
import BannerAd from './BannerAd';
import SponsoredPlaceCard from './SponsoredPlaceCard';
import DefaultAd from './DefaultAd';

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
  const [isDemo, setIsDemo] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

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
    const demoMode = isDemoMode();
    setIsDemo(demoMode);
    fetchAds();
  }, [placement, region, placeType, limit]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsDefault(false);

      // Try demo API first if demo mode is enabled
      if (isDemoMode()) {
        const demoResponse = await demoAdsAPI.getPlacementAds(placement, {
          region,
          placeType,
          limit
        });
        
        if (demoResponse && demoResponse.length > 0) {
          setAds(demoResponse);
          return;
        }
      }

      // Try real API
      const realResponse = await adsAPI.getPlacementAds(placement, {
        region,
        placeType,
        limit
      });

      if (realResponse && realResponse.length > 0) {
        setAds(realResponse);
        return;
      }

      // If no real ads and no demo ads, show default ads
      if (shouldShowDefaultAds()) {
        const defaultResponse = await defaultAdsAPI.getPlacementAds(placement, {
          region,
          placeType,
          limit
        });
        
        setAds(defaultResponse || []);
        setIsDefault(true);
      } else {
        setAds([]);
      }

    } catch (err) {
      console.error('Error fetching ads:', err);
      
      // Fallback to default ads on error
      if (shouldShowDefaultAds()) {
        try {
          const defaultResponse = await defaultAdsAPI.getPlacementAds(placement, {
            region,
            placeType,
            limit
          });
          
          setAds(defaultResponse || []);
          setIsDefault(true);
        } catch (defaultErr) {
          console.error('Error fetching default ads:', defaultErr);
          setError('Failed to load advertisements');
        }
      } else {
        setError('Failed to load advertisements');
      }
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
    // Use DefaultAd component for default ads
    if (ad.isDefault) {
      return (
        <DefaultAd
          key={ad._id}
          ad={ad}
          size={size}
          className={className}
          placement={placement}
        />
      );
    }

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
    const customAds = ads.filter(ad => ad.source === 'custom' || !ad.source); // Demo ads and default ads don't have source
    const googleAds = ads.filter(ad => ad.source === 'google_adsense');

    return (
      <div className="space-y-4">
        {/* Mode indicators */}
        {isDemo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">Demo Mode</span>
              <span className="text-xs text-blue-600">Showing sample advertisements</span>
            </div>
          </div>
        )}
        
        {isDefault && !isDemo && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Advertise Here</span>
              <span className="text-xs text-green-600">Boost your business visibility</span>
            </div>
          </div>
        )}

        {/* Custom ads */}
        {customAds.map(renderCustomAd)}
        
        {/* Google AdSense ads */}
        {googleAds.length > 0 && renderGoogleAd()}
        
        {/* Fallback Google AdSense if no custom ads and not in demo/default mode */}
        {customAds.length === 0 && !isDemo && !isDefault && renderGoogleAd()}
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
        // Use appropriate API based on ad type
        let apiToUse = adsAPI;
        if (isDemoMode() && !ad.isDefault) {
          apiToUse = demoAdsAPI;
        } else if (ad.isDefault) {
          apiToUse = defaultAdsAPI;
        }
        
        await apiToUse.trackClick(ad._id);
        
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
            <span className="text-xs text-gray-400">
              {ad.isDefault ? 'Advertise Here' : 'Sponsored'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdManager; 