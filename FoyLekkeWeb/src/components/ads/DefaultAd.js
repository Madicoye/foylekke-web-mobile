import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Eye, Users, Star, Sparkles } from 'lucide-react';
import { defaultAdsAPI } from '../../services/defaultAds';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const DefaultAd = ({ ad, size = 'medium', className = '', placement }) => {
  const { user } = useAuth();

  // Track impression when component mounts
  useEffect(() => {
    if (ad && ad._id) {
      defaultAdsAPI.trackImpression(ad._id).catch(console.error);
    }
  }, [ad]);

  const handleClick = async (e) => {
    e.preventDefault();
    
    if (ad && ad._id) {
      try {
        await defaultAdsAPI.trackClick(ad._id);
      } catch (error) {
        console.error('Error tracking default ad click:', error);
      }
    }
  };

  if (!ad) return null;

  const sizeClasses = {
    small: 'h-20 md:h-24',
    medium: 'h-28 md:h-36',
    large: 'h-36 md:h-48',
    full: 'h-48 md:h-64'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    full: 'text-xl'
  };

  // Enhanced features for default ads
  const features = [
    { icon: Eye, text: '5x more visibility', color: 'text-blue-600' },
    { icon: Users, text: 'Reach 10k+ users', color: 'text-green-600' },
    { icon: TrendingUp, text: 'Boost bookings', color: 'text-purple-600' },
    { icon: Star, text: 'Premium placement', color: 'text-yellow-600' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg shadow-lg overflow-hidden border-2 border-dashed border-primary-200 ${sizeClasses[size]} ${className}`}
    >
      {/* Sparkle animation overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 animate-pulse"></div>
      
      {/* Default ad indicator */}
      <div className="absolute top-2 right-2 z-10">
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
          <Sparkles size={12} />
          <span>Your Ad Here</span>
        </div>
      </div>

      {/* Ad content */}
      <Link
        to={user ? '/advertiser/dashboard' : '/login'}
        className="h-full flex items-center cursor-pointer group"
        onClick={handleClick}
      >
        {/* Image */}
        {ad.image && (
          <div className="flex-shrink-0 w-1/3 h-full relative">
            <img
              src={ad.image}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-600/20"></div>
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
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {ad.description}
                </p>
              )}

              {/* Features grid for larger sizes */}
              {size !== 'small' && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {features.slice(0, size === 'medium' ? 2 : 4).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <feature.icon size={12} className={feature.color} />
                      <span className="text-xs text-gray-600">{feature.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Pricing hint */}
              <div className="text-xs text-gray-500 mb-2">
                Starting from <span className="font-semibold text-primary-600">5,000 XOF/week</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex-shrink-0 ml-4">
              <div className="bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 transition-all duration-200 group-hover:scale-105 shadow-lg">
                <span>{ad.ctaText || 'Start Now'}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Bottom stats bar for larger sizes */}
      {size === 'large' || size === 'full' ? (
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                <span className="font-semibold text-primary-600">500+</span> businesses advertise
              </span>
              <span className="text-gray-600">
                <span className="font-semibold text-green-600">95%</span> satisfaction rate
              </span>
            </div>
            <div className="text-gray-500">
              Advertise Here
            </div>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
};

export default DefaultAd; 