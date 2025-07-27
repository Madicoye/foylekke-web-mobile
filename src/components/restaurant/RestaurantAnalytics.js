import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Star,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { restaurantAdminAPI } from '../../services/api';

const RestaurantAnalytics = ({ restaurantId }) => {
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, 1y

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery(
    ['restaurant-analytics', restaurantId, timeRange],
    () => restaurantAdminAPI.getAnalytics(restaurantId, { timeRange }),
    { enabled: !!restaurantId }
  );

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const {
    overview = {},
    viewsData = [],
    ratingsData = [],
    popularItems = [],
    revenueData = [],
    timeSeriesData = []
  } = analyticsData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Analytics & Insights</h2>
          <p className="text-gray-600 mt-1">Track your restaurant's performance</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Views</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(overview.totalViews || 0)}
              </p>
            </div>
            <div className="text-blue-600">
              <Eye size={24} />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {(overview.viewsChange || 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${(overview.viewsChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(overview.viewsChange || 0)}
            </span>
            <span className="text-sm text-gray-500 ml-1">vs previous period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Rating</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(overview.averageRating || 0).toFixed(1)}
              </p>
            </div>
            <div className="text-yellow-600">
              <Star size={24} />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-500">
              {overview.totalReviews || 0} reviews
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Hangouts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(overview.totalHangouts || 0)}
              </p>
            </div>
            <div className="text-green-600">
              <Users size={24} />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {(overview.hangoutsChange || 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${(overview.hangoutsChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(overview.hangoutsChange || 0)}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Participants</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(overview.totalParticipants || 0)}
              </p>
            </div>
            <div className="text-purple-600">
              <Activity size={24} />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-500">
              Avg. {(overview.avgParticipantsPerHangout || 0).toFixed(1)} per hangout
            </span>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Views Over Time</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            {timeSeriesData.length > 0 ? (
              <div className="w-full">
                {/* Simplified chart representation */}
                <div className="grid grid-cols-7 gap-2 h-32">
                  {timeSeriesData.slice(0, 7).map((data, index) => (
                    <div key={index} className="flex flex-col justify-end">
                      <div 
                        className="bg-blue-500 rounded-t"
                        style={{ 
                          height: `${Math.max(10, (data.views / Math.max(...timeSeriesData.map(d => d.views))) * 100)}%` 
                        }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2 text-center">
                        {new Date(data.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              'No data available for the selected period'
            )}
          </div>
        </motion.div>

        {/* Popular Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Popular Menu Items</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {popularItems.length > 0 ? popularItems.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{item.views} views</p>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ 
                          width: `${(item.views / Math.max(...popularItems.map(i => i.views))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {((item.views / popularItems.reduce((sum, i) => sum + i.views, 0)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Ratings Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map(rating => {
            const ratingData = ratingsData.find(r => r.rating === rating) || { count: 0 };
            const percentage = ratingsData.length > 0 
              ? (ratingData.count / ratingsData.reduce((sum, r) => sum + r.count, 0)) * 100 
              : 0;
            
            return (
              <div key={rating} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm text-gray-600">{rating}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {ratingData.count}
                </span>
                <span className="text-sm text-gray-500 w-12 text-right">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default RestaurantAnalytics; 