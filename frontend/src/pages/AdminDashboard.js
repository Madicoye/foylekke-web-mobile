import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  Eye,
  MousePointer,
  TrendingUp,
  Users,
  Search,
  Filter,
  BarChart3,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { adsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAd, setSelectedAd] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  // Fetch pending ads
  const { data: pendingAds = [], isLoading: pendingLoading } = useQuery(
    'admin-pending-ads',
    () => adsAPI.getAdminPendingAds(),
    { enabled: activeTab === 'pending' }
  );

  // Fetch all ads
  const { data: allAdsData, isLoading: allAdsLoading } = useQuery(
    ['admin-all-ads', statusFilter, searchTerm],
    () => adsAPI.getAdminAllAds({ status: statusFilter, search: searchTerm }),
    { enabled: activeTab === 'all' }
  );

  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery(
    'admin-analytics',
    () => adsAPI.getAdminAnalytics(),
    { enabled: activeTab === 'analytics' }
  );

  // Approve ad mutation
  const approveAdMutation = useMutation(
    ({ id, reviewNotes }) => adsAPI.approveAd(id, reviewNotes),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-pending-ads');
        queryClient.invalidateQueries('admin-all-ads');
        queryClient.invalidateQueries('admin-analytics');
        toast.success('Ad approved successfully');
        setSelectedAd(null);
        setReviewNotes('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to approve ad');
      }
    }
  );

  // Reject ad mutation
  const rejectAdMutation = useMutation(
    ({ id, reviewNotes }) => adsAPI.rejectAd(id, reviewNotes),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-pending-ads');
        queryClient.invalidateQueries('admin-all-ads');
        queryClient.invalidateQueries('admin-analytics');
        toast.success('Ad rejected successfully');
        setSelectedAd(null);
        setReviewNotes('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to reject ad');
      }
    }
  );

  const handleApprove = (ad) => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide review notes');
      return;
    }
    approveAdMutation.mutate({ id: ad._id, reviewNotes });
  };

  const handleReject = (ad) => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide review notes');
      return;
    }
    rejectAdMutation.mutate({ id: ad._id, reviewNotes });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'paused': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage advertisements and monitor platform performance</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'pending', label: 'Pending Ads', icon: Clock, count: pendingAds.length },
                { id: 'all', label: 'All Ads', icon: BarChart3 },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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
                    {tab.count !== undefined && (
                      <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'pending' && (
              <PendingAdsTab 
                ads={pendingAds}
                loading={pendingLoading}
                onSelectAd={setSelectedAd}
                selectedAd={selectedAd}
                reviewNotes={reviewNotes}
                setReviewNotes={setReviewNotes}
                onApprove={handleApprove}
                onReject={handleReject}
                getStatusColor={getStatusColor}
                formatCurrency={formatCurrency}
                isApproving={approveAdMutation.isLoading}
                isRejecting={rejectAdMutation.isLoading}
              />
            )}
            
            {activeTab === 'all' && (
              <AllAdsTab 
                data={allAdsData}
                loading={allAdsLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                getStatusColor={getStatusColor}
                formatCurrency={formatCurrency}
              />
            )}
            
            {activeTab === 'analytics' && (
              <AnalyticsTab 
                data={analytics}
                loading={analyticsLoading}
                formatCurrency={formatCurrency}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Pending Ads Tab Component
const PendingAdsTab = ({ 
  ads, 
  loading, 
  onSelectAd, 
  selectedAd, 
  reviewNotes, 
  setReviewNotes, 
  onApprove, 
  onReject, 
  getStatusColor, 
  formatCurrency,
  isApproving,
  isRejecting
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No pending ads</h3>
        <p className="text-gray-600">All ads have been reviewed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {ads.map((ad) => (
          <motion.div
            key={ad._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{ad.title}</h3>
                <p className="text-gray-600 mb-3">{ad.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>By: {ad.advertiser?.name}</span>
                  <span>Company: {ad.advertiser?.advertiserInfo?.companyName || 'N/A'}</span>
                  <span>Budget: {formatCurrency(ad.budget?.amount || 0)}</span>
                  <span>Type: {ad.type}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ad.status)}`}>
                  {ad.status}
                </span>
                <button
                  onClick={() => onSelectAd(selectedAd?._id === ad._id ? null : ad)}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {selectedAd?._id === ad._id ? 'Cancel' : 'Review'}
                </button>
              </div>
            </div>

            {/* Ad Preview */}
            {ad.imageUrl && (
              <div className="mb-4">
                <img 
                  src={ad.imageUrl} 
                  alt={ad.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Review Panel */}
            {selectedAd?._id === ad._id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border-t border-gray-200 pt-4 mt-4"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Notes
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Provide feedback or reasons for approval/rejection..."
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => onApprove(ad)}
                      disabled={isApproving || !reviewNotes.trim()}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle size={16} />
                      <span>{isApproving ? 'Approving...' : 'Approve'}</span>
                    </button>
                    <button
                      onClick={() => onReject(ad)}
                      disabled={isRejecting || !reviewNotes.trim()}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle size={16} />
                      <span>{isRejecting ? 'Rejecting...' : 'Reject'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// All Ads Tab Component
const AllAdsTab = ({ 
  data, 
  loading, 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  getStatusColor, 
  formatCurrency 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const ads = data?.ads || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search ads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Ads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Advertiser
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ads.map((ad) => (
              <tr key={ad._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {ad.imageUrl && (
                      <img 
                        src={ad.imageUrl} 
                        alt={ad.title}
                        className="h-10 w-10 rounded-lg object-cover mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                      <div className="text-sm text-gray-500">{ad.type}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{ad.advertiser?.name}</div>
                  <div className="text-sm text-gray-500">{ad.advertiser?.advertiserInfo?.companyName || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatCurrency(ad.budget?.amount || 0)}</div>
                  <div className="text-sm text-gray-500">{ad.budget?.type || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center space-x-4">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {ad.metrics?.impressions || 0}
                    </span>
                    <span className="flex items-center">
                      <MousePointer className="h-4 w-4 mr-1" />
                      {ad.metrics?.clicks || 0}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ad.status)}`}>
                    {ad.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(ad.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ data, loading, formatCurrency }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const { overview, revenue, topAdvertisers } = data || {};

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Ads</p>
              <p className="text-2xl font-semibold text-gray-900">{overview?.totalAds || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{overview?.pendingAds || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-semibold text-gray-900">{overview?.activeAds || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(revenue?.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-semibold">{formatCurrency(revenue?.totalRevenue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Revenue per Ad</span>
              <span className="font-semibold">{formatCurrency(revenue?.averageRevenue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Impressions</span>
              <span className="font-semibold">{(revenue?.totalImpressions || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Clicks</span>
              <span className="font-semibold">{(revenue?.totalClicks || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Advertisers</h3>
          <div className="space-y-3">
            {topAdvertisers?.slice(0, 5).map((advertiser, index) => (
              <div key={advertiser._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">{index + 1}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{advertiser.advertiser?.name}</p>
                    <p className="text-xs text-gray-500">{advertiser.adCount} ads</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(advertiser.totalSpent)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 