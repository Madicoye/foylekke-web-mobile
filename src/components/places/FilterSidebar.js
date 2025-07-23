import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  Filter, 
  Star, 
  MapPin, 
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { placesAPI } from '../../services/api';
import { getPopularCuisineTypes, getCuisineTypeConfig } from '../../config/cuisineTypes';

const FilterSidebar = ({ filters, onFilterChange, showFilters, onToggleFilters }) => {
  const [expandedSections, setExpandedSections] = React.useState({
    cuisine: true,
    region: true,
    rating: true,
    price: true
  });

  // Get popular cuisine types from configuration
  const cuisineTypes = getPopularCuisineTypes();

  const regions = [
    'Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor',
    'Kolda', 'Tambacounda', 'Kaffrine', 'Fatick', 'Louga',
    'Matam', 'Kédougou', 'Sédhiou'
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

  const clearFilter = (key) => {
    onFilterChange({ [key]: '' });
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
          {expandedSections.cuisine ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={() => {
                  onFilterChange({
                    search: '',
                    cuisine: '',
                    region: '',
                    minRating: '',
                    priceLevel: '',
                    sortBy: 'rating',
                    sortOrder: 'desc'
                  });
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Cuisine Type Filter */}
          <FilterSection title="Cuisine Type" sectionKey="cuisine">
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="cuisine"
                  value=""
                  checked={filters.cuisine === ''}
                  onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                  className="text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">All Cuisines</span>
              </label>
              {cuisineTypes.map((cuisine) => {
                const config = getCuisineTypeConfig(cuisine);
                return (
                  <label key={cuisine} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="cuisine"
                      value={cuisine}
                      checked={filters.cuisine === cuisine}
                      onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                      className="text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      <span className="mr-2">{config?.icon || '🍽️'}</span>
                      {config?.name || cuisine.replace('_', ' ')}
                    </span>
                  </label>
                );
              })}
            </div>
          </FilterSection>

          {/* Region Filter */}
          <FilterSection title="Region" sectionKey="region">
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="region"
                  value=""
                  checked={filters.region === ''}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                  className="text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">All Regions</span>
              </label>
              {regions.map((region) => (
                <label key={region} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="region"
                    value={region}
                    checked={filters.region === region}
                    onChange={(e) => handleFilterChange('region', e.target.value)}
                    className="text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">
                    <MapPin size={14} className="inline mr-2 text-gray-400" />
                    {region}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Rating Filter */}
          <FilterSection title="Minimum Rating" sectionKey="rating">
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="minRating"
                  value=""
                  checked={filters.minRating === ''}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Any Rating</span>
              </label>
              {[3, 3.5, 4, 4.5].map((rating) => (
                <label key={rating} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="minRating"
                    value={rating}
                    checked={filters.minRating === rating.toString()}
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                    className="text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">
                    <div className="flex items-center space-x-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span>{rating}+ stars</span>
                    </div>
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Price Level Filter */}
          <FilterSection title="Price Level" sectionKey="price">
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="priceLevel"
                  value=""
                  checked={filters.priceLevel === ''}
                  onChange={(e) => handleFilterChange('priceLevel', e.target.value)}
                  className="text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Any Price</span>
              </label>
              {[1, 2, 3, 4].map((level) => (
                <label key={level} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="priceLevel"
                    value={level}
                    checked={filters.priceLevel === level.toString()}
                    onChange={(e) => handleFilterChange('priceLevel', e.target.value)}
                    className="text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">
                    {'€'.repeat(level)} - {level === 1 ? 'Budget' : level === 2 ? 'Moderate' : level === 3 ? 'Expensive' : 'Very Expensive'}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Active Filters */}
          {getActiveFiltersCount() > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Active Filters</h4>
              <div className="space-y-2">
                {filters.cuisine && (
                  <div className="flex items-center justify-between bg-primary-50 text-primary-700 px-3 py-2 rounded-lg">
                    <span className="text-sm">
                      Cuisine: {getCuisineTypeConfig(filters.cuisine)?.name || filters.cuisine.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => clearFilter('cuisine')}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                {filters.region && (
                  <div className="flex items-center justify-between bg-primary-50 text-primary-700 px-3 py-2 rounded-lg">
                    <span className="text-sm">Region: {filters.region}</span>
                    <button
                      onClick={() => clearFilter('region')}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                {filters.minRating && (
                  <div className="flex items-center justify-between bg-primary-50 text-primary-700 px-3 py-2 rounded-lg">
                    <span className="text-sm">Rating: {filters.minRating}+ stars</span>
                    <button
                      onClick={() => clearFilter('minRating')}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                {filters.priceLevel && (
                  <div className="flex items-center justify-between bg-primary-50 text-primary-700 px-3 py-2 rounded-lg">
                    <span className="text-sm">Price: {'€'.repeat(filters.priceLevel)}</span>
                    <button
                      onClick={() => clearFilter('priceLevel')}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FilterSidebar; 