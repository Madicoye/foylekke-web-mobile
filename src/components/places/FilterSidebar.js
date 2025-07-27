import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  Filter, 
  Star, 
  MapPin, 
  X,
  ChevronDown,
  ChevronUp,
  Menu,
  Navigation,
  Clock,
  Calendar,
  Car,
  Users
} from 'lucide-react';
import { placesAPI } from '../../services/api';
import { getPopularCuisineTypes, getCuisineTypeConfig } from '../../config/cuisineTypes';
import { toast } from 'react-hot-toast';

const FilterSidebar = ({ filters, onFilterChange, showFilters, onToggleFilters }) => {
  const [expandedSections, setExpandedSections] = React.useState({
    cuisine: true,
    region: true,
    rating: true,
    price: true,
    features: true,
    location: false
  });

  // Get popular cuisine types from configuration
  const cuisineTypes = getPopularCuisineTypes();

  const regions = [
    'Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor',
    'Kolda', 'Tambacounda', 'Kaffrine', 'Fatick', 'Louga',
    'Matam', 'Kédougou', 'Sédhiou'
  ];

  const priceRanges = [
    { value: 'low', label: 'Budget ($)', description: 'Affordable options' },
    { value: 'medium', label: 'Moderate ($$)', description: 'Mid-range pricing' },
    { value: 'high', label: 'Expensive ($$$)', description: 'Premium options' }
  ];

  const features = [
    { value: 'hasMenu', label: 'Menu Available', icon: Menu },
    { value: 'delivery', label: 'Delivery', icon: Navigation },
    { value: 'takeout', label: 'Takeout', icon: Clock },
    { value: 'reservations', label: 'Reservations', icon: Calendar },
    { value: 'parking', label: 'Parking', icon: Car },
    { value: 'wheelchair', label: 'Wheelchair Access', icon: Users }
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

    const handleFeatureToggle = (feature) => {
    const currentFeatures = filters.features ? filters.features.split(',') : [];
    const isSelected = currentFeatures.includes(feature);

    let newFeatures;
    if (isSelected) {
      newFeatures = currentFeatures.filter(f => f !== feature);
    } else {
      newFeatures = [...currentFeatures, feature];
    }

    // Update features filter
    onFilterChange({ features: newFeatures.join(',') });
    
    // Also handle hasMenu specially
    if (feature === 'hasMenu') {
      onFilterChange({ hasMenu: !isSelected });
    }
  };

  const clearFilter = (key) => {
    onFilterChange({ [key]: '' });
  };

  const clearAllFilters = () => {
    onFilterChange({
      search: '',
      type: '',
      cuisine: '',
      region: '',
      rating: '',
      priceRange: '',
      features: '',
      hasMenu: '',
      lat: '',
      lng: '',
      radius: '',
      sort: 'rating'
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value && value !== 'rating' && value !== 'desc').length;
  };

  const FilterSection = ({ title, children, sectionKey }) => (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
      >
        {title}
        {expandedSections[sectionKey] ? (
          <ChevronUp size={16} className="text-gray-500" />
        ) : (
          <ChevronDown size={16} className="text-gray-500" />
        )}
      </button>
      <AnimatePresence>
        {expandedSections[sectionKey] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={onToggleFilters}
          className="w-full flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="flex items-center space-x-2">
            <Filter size={16} />
            <span className="font-medium">Filters</span>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          {showFilters ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>
      </div>

      {/* Filter Sidebar */}
      <AnimatePresence>
        {(showFilters || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <div className="flex items-center space-x-2">
                {getActiveFiltersCount() > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onToggleFilters}
                  className="lg:hidden p-1 hover:bg-gray-100 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {getActiveFiltersCount() > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters).map(([key, value]) => {
                    if (!value || value === 'rating' || value === 'desc') return null;
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        {value}
                        <button
                          onClick={() => clearFilter(key)}
                          className="ml-1 hover:text-primary-600"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Location & Nearby */}
            <FilterSection title="Location" sectionKey="location">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Radius (km)
                  </label>
                  <select
                    value={filters.radius || filters.nearbyRadius || ''}
                    onChange={(e) => handleFilterChange('radius', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Any distance</option>
                    <option value="1">Within 1 km</option>
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="20">Within 20 km</option>
                    <option value="50">Within 50 km</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          onFilterChange({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            radius: filters.radius || filters.nearbyRadius || '10'
                          });
                        },
                        (error) => {
                          console.error('Error getting location:', error);
                          toast.error('Unable to get your location');
                        }
                      );
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Navigation size={16} />
                  <span>Use My Location</span>
                </button>
              </div>
            </FilterSection>

            {/* Features */}
            <FilterSection title="Features" sectionKey="features">
              <div className="space-y-3">
                {features.map((feature) => {
                  const IconComponent = feature.icon;
                  const isSelected = filters.features?.split(',').includes(feature.value) || false;
                  
                  return (
                    <label
                      key={feature.value}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleFeatureToggle(feature.value)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                      />
                      <IconComponent size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-700">{feature.label}</span>
                    </label>
                  );
                })}
              </div>
            </FilterSection>

            {/* Cuisine Type */}
            <FilterSection title="Cuisine Type" sectionKey="cuisine">
              <div className="space-y-2">
                {cuisineTypes.map((cuisine) => {
                  const config = getCuisineTypeConfig(cuisine);
                  const isSelected = filters.cuisine === cuisine;
                  
                  return (
                    <label
                      key={cuisine}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                    >
                      <input
                        type="radio"
                        name="cuisine"
                        value={cuisine}
                        checked={isSelected}
                        onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                        className="text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                      />
                      <span className="text-lg">{config?.emoji || '🍽️'}</span>
                      <span className="text-sm text-gray-700">{config?.label || cuisine}</span>
                    </label>
                  );
                })}
                {filters.cuisine && (
                  <button
                    onClick={() => clearFilter('cuisine')}
                    className="text-sm text-gray-500 hover:text-gray-700 ml-8"
                  >
                    Clear selection
                  </button>
                )}
              </div>
            </FilterSection>

            {/* Region */}
            <FilterSection title="Region" sectionKey="region">
              <div className="space-y-2">
                <select
                  value={filters.region || ''}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Regions</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection title="Price Range" sectionKey="price">
              <div className="space-y-3">
                {priceRanges.map((priceRange) => {
                  const isSelected = filters.priceRange === priceRange.value;
                  
                  return (
                    <label
                      key={priceRange.value}
                      className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                    >
                      <input
                        type="radio"
                        name="priceRange"
                        value={priceRange.value}
                        checked={isSelected}
                        onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                        className="mt-1 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {priceRange.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {priceRange.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
                {filters.priceRange && (
                  <button
                    onClick={() => clearFilter('priceRange')}
                    className="text-sm text-gray-500 hover:text-gray-700 ml-8"
                  >
                    Clear selection
                  </button>
                )}
              </div>
            </FilterSection>

            {/* Rating */}
            <FilterSection title="Minimum Rating" sectionKey="rating">
              <div className="space-y-3">
                {[4, 3, 2, 1].map((rating) => {
                  const isSelected = parseInt(filters.rating) === rating;
                  
                  return (
                    <label
                      key={rating}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                    >
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={isSelected}
                        onChange={(e) => handleFilterChange('rating', e.target.value)}
                        className="text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                      />
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={`${
                              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-700 ml-2">
                          {rating}+ stars
                        </span>
                      </div>
                    </label>
                  );
                })}
                {filters.rating && (
                  <button
                    onClick={() => clearFilter('rating')}
                    className="text-sm text-gray-500 hover:text-gray-700 ml-8"
                  >
                    Clear selection
                  </button>
                )}
              </div>
            </FilterSection>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FilterSidebar; 