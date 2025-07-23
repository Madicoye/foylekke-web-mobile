import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  Grid, 
  List, 
  Search, 
  MapPin, 
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { placesAPI } from '../services/api';
import PlaceCard from '../components/places/PlaceCard';
import AdManager from '../components/ads/AdManager';
import FilterSidebar from '../components/places/FilterSidebar';
import { getPlaceTypeConfig } from '../config/placeTypes';

const PlacesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    cuisine: searchParams.get('cuisine') || '',
    region: searchParams.get('region') || '',
    minRating: searchParams.get('minRating') || '',
    priceLevel: searchParams.get('priceLevel') || '',
    sortBy: searchParams.get('sortBy') || 'rating',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  const itemsPerPage = 12;

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Fetch places with filters
  const { data: placesData, isLoading, error } = useQuery(
    ['places', filters, currentPage],
    () => placesAPI.getPlaces({
      ...filters,
      page: currentPage,
      limit: itemsPerPage
    }),
    {
      keepPreviousData: true
    }
  );

  const places = placesData?.places || placesData || [];
  const totalPlaces = placesData?.pagination?.total || placesData?.total || places.length;
  const totalPages = Math.ceil(totalPlaces / itemsPerPage);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleSearch = (searchTerm) => {
    handleFilterChange({ search: searchTerm });
  };

  const handleSortChange = (sortBy, sortOrder = 'desc') => {
    handleFilterChange({ sortBy, sortOrder });
  };

  const sortOptions = [
    { value: 'rating', label: 'Rating', order: 'desc' },
    { value: 'name', label: 'Name', order: 'asc' },
    { value: 'reviewCount', label: 'Most Reviewed', order: 'desc' },
    { value: 'createdAt', label: 'Newest', order: 'desc' }
  ];

  const getTypeLabel = (type) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value && value !== 'rating' && value !== 'desc').length;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Places</h2>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Discover Places
              </h1>
              <p className="text-gray-600 mt-1">
                {totalPlaces} places found
                {filters.region && ` in ${filters.region}`}
                {filters.type && ` • ${getTypeLabel(filters.type)}`}
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search places..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              {/* Active Filters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <SlidersHorizontal size={16} />
                  <span>Filters</span>
                  {getActiveFiltersCount() > 0 && (
                    <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </button>

                {/* Clear Filters */}
                {getActiveFiltersCount() > 0 && (
                  <button
                    onClick={() => {
                      setFilters({
                        search: '',
                        type: '',
                        region: '',
                        minRating: '',
                        priceLevel: '',
                        sortBy: 'rating',
                        sortOrder: 'desc'
                      });
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {/* Sort and View Options */}
              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleSortChange(sortBy, sortOrder);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={`${option.value}-${option.order}`}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors duration-200 ${
                      viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors duration-200 ${
                      viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Places Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {places.map((place, index) => {
                // Show ads every 6 places in grid view, every 3 in list view
                const adInterval = viewMode === 'grid' ? 6 : 3;
                const shouldShowAd = index > 0 && index % adInterval === 0;
                
                return (
                  <React.Fragment key={place._id}>
                    {shouldShowAd && (
                      <div className={viewMode === 'grid' ? 'col-span-full' : ''}>
                        <AdManager
                          placement="places_list"
                          region={filters.region || 'Dakar'}
                          placeType={filters.type}
                          size="medium"
                          className="mb-6"
                        />
                      </div>
                    )}
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <PlaceCard place={place} viewMode={viewMode} />
                    </motion.div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isCurrent = page === currentPage;
                    const isNearCurrent = Math.abs(page - currentPage) <= 2;
                    const isFirst = page === 1;
                    const isLast = page === totalPages;

                    if (isCurrent || isNearCurrent || isFirst || isLast) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                            isCurrent
                              ? 'bg-primary-500 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 3 || page === currentPage + 3) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacesPage; 