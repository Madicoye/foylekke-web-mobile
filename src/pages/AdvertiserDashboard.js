import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  BarChart3, 
  Play, 
  Pause, 
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { adsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from '../components/ads/ImageUpload';
import { toast } from 'react-hot-toast';
import PaymentInstructions from '../components/payment/PaymentInstructions';
import { paymentAPI } from '../services/api';

const AdvertiserDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAd, setSelectedAd] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch user's ads
  const { data: adsData, isLoading } = useQuery(
    ['my-ads'],
    () => adsAPI.getMyAds(),
    {
      enabled: !!user
    }
  );

  const ads = adsData?.ads || [];

  // Delete ad mutation
  const deleteAdMutation = useMutation(
    (adId) => adsAPI.deleteAd(adId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['my-ads']);
      }
    }
  );

  // Submit ad mutation
  const submitAdMutation = useMutation(
    (adId) => adsAPI.submitAd(adId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['my-ads']);
      }
    }
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'paused': return 'text-gray-600 bg-gray-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'rejected': return <XCircle size={16} />;
      case 'paused': return <Pause size={16} />;
      case 'expired': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const calculateTotalStats = () => {
    return ads.reduce((acc, ad) => {
      acc.totalImpressions += ad.metrics?.impressions || 0;
      acc.totalClicks += ad.metrics?.clicks || 0;
      acc.totalSpent += ad.budget?.spent || 0;
      return acc;
    }, { totalImpressions: 0, totalClicks: 0, totalSpent: 0 });
  };

  const stats = calculateTotalStats();
  const averageCTR = stats.totalImpressions > 0 ? (stats.totalClicks / stats.totalImpressions * 100).toFixed(2) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Advertiser Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your advertisements and track performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Impressions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalImpressions.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClicks.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Average CTR</p>
                <p className="text-2xl font-bold text-gray-900">{averageCTR}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="text-yellow-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSpent.toLocaleString()} XOF</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'ads', label: 'My Ads', icon: Target },
                { id: 'create', label: 'Create Ad', icon: Plus }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab ads={ads} />}
            {activeTab === 'ads' && (
              <AdsTab 
                ads={ads} 
                onEdit={setSelectedAd}
                onDelete={deleteAdMutation.mutate}
                onSubmit={submitAdMutation.mutate}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            )}
            {activeTab === 'create' && <CreateAdTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ ads }) => {
  const activeAds = ads.filter(ad => ad.status === 'active');
  const pendingAds = ads.filter(ad => ad.status === 'pending');
  const rejectedAds = ads.filter(ad => ad.status === 'rejected');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Active Ads</h3>
          <p className="text-2xl font-bold text-green-600">{activeAds.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">Pending Approval</h3>
          <p className="text-2xl font-bold text-yellow-600">{pendingAds.length}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 mb-2">Rejected</h3>
          <p className="text-2xl font-bold text-red-600">{rejectedAds.length}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {ads.slice(0, 5).map(ad => (
            <div key={ad._id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{ad.title}</p>
                <p className="text-sm text-gray-600">
                  {ad.metrics?.impressions || 0} impressions • {ad.metrics?.clicks || 0} clicks
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                ad.status === 'active' ? 'bg-green-100 text-green-800' :
                ad.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {ad.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Ads Tab Component
const AdsTab = ({ ads, onEdit, onDelete, onSubmit, getStatusColor, getStatusIcon }) => {
  return (
    <div className="space-y-4">
      {ads.length === 0 ? (
        <div className="text-center py-12">
          <Target size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ads yet</h3>
          <p className="text-gray-600">Create your first advertisement to get started</p>
        </div>
      ) : (
        ads.map(ad => (
          <motion.div
            key={ad._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{ad.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(ad.status)}`}>
                    {getStatusIcon(ad.status)}
                    <span>{ad.status}</span>
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{ad.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Impressions</p>
                    <p className="font-semibold">{ad.metrics?.impressions || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Clicks</p>
                    <p className="font-semibold">{ad.metrics?.clicks || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">CTR</p>
                    <p className="font-semibold">{ad.metrics?.ctr?.toFixed(2) || 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Spent</p>
                    <p className="font-semibold">{ad.budget?.spent || 0} XOF</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onEdit(ad)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit size={16} />
                </button>
                
                {ad.status === 'draft' && (
                  <button
                    onClick={() => onSubmit(ad._id)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Play size={16} />
                  </button>
                )}
                
                <button
                  onClick={() => onDelete(ad._id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};

// CreateAdTab component
const CreateAdTab = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'banner',
    placement: 'homepage_hero',
    targetAudience: {
      regions: ['Dakar'],
      placeTypes: [],
      demographics: {
        ageRange: { min: 18, max: 65 },
        interests: []
      }
    },
    budget: {
      amount: 10000,
      type: 'daily'
    },
    schedule: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true
    },
    imageUrl: '',
    images: []
  });

  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedChange = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleImageUpload = (images) => {
    setFormData(prev => ({
      ...prev,
      images: images,
      imageUrl: images.length > 0 ? images[0].imageUrl : ''
    }));
  };

  const handleImageRemove = (removedImage, remainingImages) => {
    setFormData(prev => ({
      ...prev,
      images: remainingImages,
      imageUrl: remainingImages.length > 0 ? remainingImages[0].imageUrl : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsCreating(true);

    try {
      // First create the payment record
      const paymentResponse = await paymentAPI.createPaymentRecord(formData);
      setPaymentRecord(paymentResponse.paymentRecord);

      // Create the ad with payment pending status
      const adData = {
        ...formData,
        imageUrl: formData.images[0].imageUrl,
        additionalImages: formData.images.slice(1).map(img => img.imageUrl),
        payment: {
          paymentId: paymentResponse.paymentRecord.paymentId,
          amount: formData.budget.amount,
          status: 'pending'
        }
      };

      await adsAPI.createAd(adData);
      
      // Show payment instructions
      setShowPaymentInstructions(true);
      
      toast.success('Ad created! Please complete payment to activate.');
    } catch (error) {
      console.error('Error creating ad:', error);
      toast.error('Failed to create ad');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePaymentComplete = () => {
    setShowPaymentInstructions(false);
    setPaymentRecord(null);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      type: 'banner',
      placement: 'homepage_hero',
      targetAudience: {
        regions: ['Dakar'],
        placeTypes: [],
        demographics: {
          ageRange: { min: 18, max: 65 },
          interests: []
        }
      },
      budget: {
        amount: 10000,
        type: 'daily'
      },
      schedule: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true
      },
      imageUrl: '',
      images: []
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter ad title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Describe your ad"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="banner">Banner Ad</option>
                  <option value="sponsored_place">Sponsored Place</option>
                  <option value="native">Native Ad</option>
                  <option value="interstitial">Interstitial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placement
                </label>
                <select
                  name="placement"
                  value={formData.placement}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="homepage_hero">Homepage Hero</option>
                  <option value="homepage_between_sections">Homepage Sections</option>
                  <option value="places_list">Places List</option>
                  <option value="place_detail">Place Detail</option>
                  <option value="search_results">Search Results</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Amount (XOF)
                </label>
                <input
                  type="number"
                  value={formData.budget.amount}
                  onChange={(e) => handleNestedChange('budget.amount', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="1000"
                  step="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Type
                </label>
                <select
                  value={formData.budget.type}
                  onChange={(e) => handleNestedChange('budget.type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="daily">Daily</option>
                  <option value="total">Total Campaign</option>
                  <option value="cpc">Cost Per Click</option>
                  <option value="cpm">Cost Per 1000 Impressions</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.schedule.startDate}
                  onChange={(e) => handleNestedChange('schedule.startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.schedule.endDate}
                  onChange={(e) => handleNestedChange('schedule.endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Images */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Images *
              </label>
              <ImageUpload
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
                existingImages={formData.images}
                maxImages={3}
                maxSizeInMB={5}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isCreating}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating Ad...' : 'Create Ad & Proceed to Payment'}
          </button>
        </div>
      </form>

      {/* Payment Instructions Modal */}
      {showPaymentInstructions && paymentRecord && (
        <PaymentInstructions
          amount={formData.budget.amount}
          currency="XOF"
          paymentRecord={paymentRecord}
          onClose={handlePaymentComplete}
        />
      )}
    </>
  );
};

export default AdvertiserDashboard; 