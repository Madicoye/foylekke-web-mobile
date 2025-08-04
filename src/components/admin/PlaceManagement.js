import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon,
  MapPinIcon,
  StarIcon,
  PhotoIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { placesAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const PlaceManagement = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedPlaces, setSelectedPlaces] = useState([]);

  // Fetch places with filters
  const { data: placesData, isLoading, error } = useQuery(
    ['admin-places', { search: searchTerm, region: selectedRegion, type: selectedType, page }],
    () => placesAPI.getPlaces({
      search: searchTerm,
      region: selectedRegion,
      type: selectedType,
      page,
      limit: 20,
      includeInactive: true // Admin can see inactive places
    }),
    {
      keepPreviousData: true,
    }
  );

  // Fetch place types
  const { data: placeTypes = [] } = useQuery(
    'place-types',
    () => placesAPI.getPlaceTypes()
  );

  const places = placesData?.places || [];
  const totalPlaces = placesData?.total || 0;
  const totalPages = Math.ceil(totalPlaces / 20);

  // Delete place mutation
  const deleteplaceMutation = useMutation(placesAPI.deletePlace, {
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-places']);
      toast.success('Place deleted successfully');
      setDeleteConfirm(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete place');
    }
  });

  // Sync places mutation
  const syncPlacesMutation = useMutation(
    (region) => placesAPI.syncPlacesFromGoogle(region),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['admin-places']);
        toast.success(`Synced ${data.addedCount} new places from Google`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to sync places');
      }
    }
  );

  const regions = [
    'Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 
    'Diourbel', 'Louga', 'Fatick', 'Kolda', 'Tambacounda',
    'Kédougou', 'Matam', 'Kaffrine', 'Sédhiou'
  ];

  const handleDeletePlace = (placeId) => {
    if (window.confirm('Are you sure you want to delete this place? This action cannot be undone.')) {
      deleteplaceMutation.mutate(placeId);
    }
  };

  const handleSyncPlaces = (region) => {
    if (window.confirm(`Sync places from Google for ${region}? This may take a few minutes.`)) {
      syncPlacesMutation.mutate(region);
    }
  };

  const handleBulkAction = (action) => {
    if (selectedPlaces.length === 0) {
      toast.error('Please select places first');
      return;
    }

    switch (action) {
      case 'delete':
        if (window.confirm(`Delete ${selectedPlaces.length} selected places?`)) {
          // Bulk delete logic would go here
          toast.info('Bulk delete not implemented in demo');
        }
        break;
      case 'activate':
        toast.info('Bulk activate not implemented in demo');
        break;
      case 'deactivate':
        toast.info('Bulk deactivate not implemented in demo');
        break;
      default:
        break;
    }
  };

  const getStatusBadge = (place) => {
    if (place.status === 'active') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
    } else {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Inactive</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load places</h3>
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Place Management</h2>
          <p className="text-gray-600 mt-1">
            Manage restaurants, cafes, and other places in the system
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Place
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search places..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Region Filter */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Regions</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {placeTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Sync Button */}
          <div className="relative">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleSyncPlaces(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full border border-primary-300 rounded-lg px-3 py-2 text-primary-600 bg-primary-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Sync from Google</option>
              {regions.map(region => (
                <option key={`sync-${region}`} value={region}>Sync {region}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPlaces.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-800">
              {selectedPlaces.length} place{selectedPlaces.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MapPinIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Places</p>
              <p className="text-2xl font-semibold text-gray-900">{totalPlaces}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-semibold text-gray-900">
                {places.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <StarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-semibold text-gray-900">
                {places.length > 0 
                  ? (places.reduce((sum, p) => sum + (p.rating || 0), 0) / places.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowPathIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Sync</p>
              <p className="text-sm font-semibold text-gray-900">2 hours ago</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Places Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading places...</p>
          </div>
        ) : places.length === 0 ? (
          <div className="p-8 text-center">
            <MapPinIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No places found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or add a new place.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPlaces(places.map(p => p._id));
                          } else {
                            setSelectedPlaces([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Place
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {places.map((place) => (
                    <motion.tr
                      key={place._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          checked={selectedPlaces.includes(place._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPlaces(prev => [...prev, place._id]);
                            } else {
                              setSelectedPlaces(prev => prev.filter(id => id !== place._id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {place.images && place.images.length > 0 ? (
                              <img
                                src={place.images[0].url}
                                alt={place.name}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                <PhotoIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{place.name}</div>
                            <div className="text-sm text-gray-500">{place.description?.slice(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {place.type || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                          {place.region || 'Unknown'}, {place.city || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {place.rating ? place.rating.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(place)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(place.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(`/places/${place._id}`, '_blank')}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingPlace(place)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePlace(place._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, totalPlaces)} of {totalPlaces} places
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal would go here */}
      {(showCreateModal || editingPlace) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingPlace ? 'Edit Place' : 'Add New Place'}
              </h3>
              <p className="text-gray-600 mb-4">
                Place creation/editing form would be implemented here with all necessary fields.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingPlace(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
                  {editingPlace ? 'Update' : 'Create'} Place
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PlaceManagement; 