import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Star } from 'lucide-react';
import { useQuery } from 'react-query';
import { placesAPI } from '../../services/api';
import { getEnabledPlaceTypes, getPlaceTypeConfig } from '../../config/placeTypes';
import { getPopularCuisineTypes, getCuisineTypeConfig } from '../../config/cuisineTypes';

const SearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [minRating, setMinRating] = useState(0);

  // Get enabled place types from configuration
  const placeTypes = getEnabledPlaceTypes();
  
  // Get popular cuisine types from configuration
  const cuisineTypes = getPopularCuisineTypes();

  const regions = [
    'Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor',
    'Kolda', 'Tambacounda', 'Kaffrine', 'Fatick', 'Louga',
    'Matam', 'Kédougou', 'Sédhiou'
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedType) params.append('type', selectedType);
    if (selectedCuisine) params.append('cuisine', selectedCuisine);
    if (selectedRegion) params.append('region', selectedRegion);
    if (minRating > 0) params.append('minRating', minRating);

    navigate(`/places?${params.toString()}`);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Search Places</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search for places, restaurants, parks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                  autoFocus
                />
              </div>

              {/* Filters */}
              <div className="space-y-6">
                {/* Place Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Place Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setSelectedType('')}
                      className={`p-3 rounded-lg border-2 text-left transition-colors duration-200 ${
                        selectedType === ''
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">📍</div>
                      <div className="text-sm font-medium">All Types</div>
                    </button>
                    {placeTypes.map((type) => {
                      const config = getPlaceTypeConfig(type);
                      return (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`p-3 rounded-lg border-2 text-left transition-colors duration-200 ${
                            selectedType === type
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-1">{config?.icon || '📍'}</div>
                          <div className="text-sm font-medium">
                            {config?.name || type.replace('_', ' ')}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cuisine Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Cuisine Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setSelectedCuisine('')}
                      className={`p-3 rounded-lg border-2 text-left transition-colors duration-200 ${
                        selectedCuisine === ''
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">🍽️</div>
                      <div className="text-sm font-medium">All Cuisines</div>
                    </button>
                    {cuisineTypes.map((cuisine) => {
                      const config = getCuisineTypeConfig(cuisine);
                      return (
                        <button
                          key={cuisine}
                          onClick={() => setSelectedCuisine(cuisine)}
                          className={`p-3 rounded-lg border-2 text-left transition-colors duration-200 ${
                            selectedCuisine === cuisine
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-1">{config?.icon || '🍽️'}</div>
                          <div className="text-sm font-medium">
                            {config?.name || cuisine.replace('_', ' ')}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Region Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Region
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Regions</option>
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Minimum Rating
                  </label>
                  <div className="flex items-center space-x-4">
                    {[0, 3, 3.5, 4, 4.5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg border-2 transition-colors duration-200 ${
                          minRating === rating
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Star size={16} className={rating > 0 ? 'fill-current' : ''} />
                        <span className="text-sm font-medium">
                          {rating === 0 ? 'Any' : rating}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <div className="mt-8">
                <button
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 transform hover:scale-105"
                >
                  <Search className="inline mr-2" size={20} />
                  Search Places
                </button>
              </div>

              {/* Quick Links */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {['Restaurants in Dakar', 'Senegalese cuisine', 'Seafood restaurants', 'French cuisine'].map((search) => (
                    <button
                      key={search}
                      onClick={() => {
                        setSearchTerm(search);
                        handleSearch();
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors duration-200"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal; 