import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  MapPin, 
  ArrowRight, 
  Search, 
  Users, 
  Star, 
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react';
import { placesAPI } from '../services/api';
import PlaceCard from '../components/places/PlaceCard';
import SearchModal from '../components/search/SearchModal';
import AdManager from '../components/ads/AdManager';
import PlacesDebug from '../components/debug/PlacesDebug';
import { getPopularCuisineTypes, getCuisineTypeConfigs } from '../config/cuisineTypes';
import useTranslation from '../hooks/useTranslation';

const HomePage = () => {
  const { t } = useTranslation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Fetch recent places (instead of featured)
  const { data: recentPlacesData = null, isLoading: recentLoading, error: recentError } = useQuery(
    'recentPlaces',
    () => placesAPI.getPlaces({ limit: 6 })
  );

  // Fetch top places by region
  const { data: topPlacesData = null, isLoading: topLoading, error: topError } = useQuery(
    'topPlaces',
    () => placesAPI.getTopPlacesByRegion('Dakar')
  );

  // Extract places from the API response
  const recentPlaces = recentPlacesData?.places || recentPlacesData || [];
  const topPlaces = topPlacesData?.places || topPlacesData || [];

  // Debug current state
  console.log('🔍 Current state:', {
    recentPlaces: recentPlaces,
    recentPlacesLength: recentPlaces?.length || 0,
    recentLoading,
    recentError,
    topPlaces: topPlaces,
    topPlacesLength: topPlaces?.length || 0,
    topLoading,
    topError
  });

  const features = [
    {
      icon: MapPin,
      title: t('home.features.discoverPlaces.title'),
      description: t('home.features.discoverPlaces.description')
    },
    {
      icon: Users,
      title: t('home.features.socialHangouts.title'),
      description: t('home.features.socialHangouts.description')
    },
    {
      icon: Star,
      title: t('home.features.authenticReviews.title'),
      description: t('home.features.authenticReviews.description')
    },
    {
      icon: Shield,
      title: t('home.features.staySafe.title'),
      description: t('home.features.staySafe.description')
    },
    {
      icon: Clock,
      title: t('home.features.alwaysUpdated.title'),
      description: t('home.features.alwaysUpdated.description')
    },
    {
      icon: TrendingUp,
      title: t('home.features.trendingPlaces.title'),
      description: t('home.features.trendingPlaces.description')
    }
  ];

  const stats = [
    { number: '500+', label: t('home.stats.placesDiscovered') },
    { number: '10K+', label: t('home.stats.happyUsers') },
    { number: '50+', label: t('home.stats.citiesCovered') },
    { number: '1000+', label: t('home.stats.reviewsPosted') }
  ];

  // Get popular cuisine types for the homepage
  const popularCuisineTypes = getPopularCuisineTypes().slice(0, 8); // Show top 8 cuisine types
  const cuisineConfigs = getCuisineTypeConfigs();

  return (
    <div className="min-h-screen">
      {/* Debug Section - Remove in production */}
      <div className="p-4">
        <PlacesDebug />
      </div>
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                {t('home.heroTitle')}
                <span className="block text-accent-300">{t('home.heroSubtitle')}</span>
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-gray-100">
                {t('home.heroDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSearchOpen(true)}
                  className="bg-white text-primary-600 font-semibold py-4 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <MapPin size={20} />
                  <span>{t('home.exploreButton')}</span>
                </motion.button>
                <Link
                  to="/places"
                  className="border-2 border-white text-white font-semibold py-4 px-8 rounded-lg hover:bg-white hover:text-primary-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>{t('home.discoverButton')}</span>
                  <ArrowRight size={20} />
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      className="text-center"
                    >
                      <div className="text-3xl font-bold text-accent-300">{stat.number}</div>
                      <div className="text-sm text-gray-200">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Hero Ad Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdManager
            placement="homepage_hero"
            region="Dakar"
            size="large"
            className="w-full"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Foy Lekke?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We make it easy to discover and explore the best places Senegal has to offer
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-primary-600" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ad Section Between Features and Cuisine Types */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdManager
            placement="homepage_between_sections"
            region="Dakar"
            size="medium"
            className="w-full"
          />
        </div>
      </section>

      {/* Cuisine Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {t('home.exploreByCuisine')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('home.exploreByCuisineDesc')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {popularCuisineTypes.map((cuisineType, index) => {
              const config = cuisineConfigs[cuisineType];
              return (
                <motion.div
                  key={cuisineType}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Link
                    to={`/places?cuisine=${cuisineType}`}
                    className="block bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100"
                  >
                    <div className={`w-16 h-16 ${config.color} rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                      <span className="text-3xl">{config.icon}</span>
                    </div>
                    <h3 className="text-center font-semibold text-gray-900 mb-2">
                      {config.name}
                    </h3>
                    <p className="text-center text-sm text-gray-600">
                      {config.description}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* View All Cuisines Button */}
          <div className="text-center mt-12">
            <Link
              to="/places"
              className="inline-flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              <span>{t('home.viewAllRestaurants')}</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Places Section */}
      {recentPlaces && recentPlaces.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex justify-between items-center mb-12"
            >
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {t('home.recentPlaces')}
                </h2>
                <p className="text-xl text-gray-600">
                  {t('home.recentPlacesDesc')}
                </p>
              </div>
              <Link
                to="/places"
                className="btn-primary flex items-center space-x-2"
              >
                <span>{t('home.viewAll')}</span>
                <ArrowRight size={20} />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPlaces.map((place, index) => (
                <motion.div
                  key={place._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <PlaceCard place={place} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ad Section Before Top Places */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdManager
            placement="homepage_between_sections"
            region="Dakar"
            size="medium"
            className="w-full"
          />
        </div>
      </section>

      {/* Top Places Section */}
      {topPlaces && topPlaces.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {t('home.topPlacesDakar')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('home.topPlacesDakarDesc')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topPlaces.slice(0, 6).map((place, index) => (
                <motion.div
                  key={place._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <PlaceCard place={place} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-accent-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              {t('home.readyToExplore')}
            </h2>
            <p className="text-xl mb-8 text-gray-100 max-w-3xl mx-auto">
              {t('home.readyToExploreDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-600 font-semibold py-4 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {t('home.getStarted')}
              </Link>
              <Link
                to="/places"
                className="border-2 border-white text-white font-semibold py-4 px-8 rounded-lg hover:bg-white hover:text-primary-600 transition-colors duration-200"
              >
                {t('home.browsePlaces')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Ad Manager for Homepage */}
      <AdManager
        adSlot="7289037820" // Example ad slot for a 336x280 banner
        adSize="336x280"
        adUnitId="ca-pub-1234567890123456" // Replace with your actual ad unit ID
        adClient="ca-pub-1234567890123456" // Replace with your actual ad client ID
      />
    </div>
  );
};

export default HomePage; 