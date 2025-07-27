import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  Users,
  Calendar,
  Clock,
  MapPin,
  Filter,
  Search,
  Eye,
  MessageCircle,
  Star,
  TrendingUp
} from 'lucide-react';
import { restaurantAdminAPI } from '../../services/api';
import { Link } from 'react-router-dom';

const HangoutsManagement = ({ restaurantId }) => {
  const [timeFilter, setTimeFilter] = useState('upcoming'); // upcoming, past, all
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch hangouts data
  const { data: hangoutsData, isLoading } = useQuery(
    ['restaurant-hangouts', restaurantId, timeFilter],
    () => restaurantAdminAPI.getHangouts(restaurantId, { 
      filter: timeFilter,
      search: searchTerm 
    }),
    { enabled: !!restaurantId }
  );

  const { hangouts = [], stats = {} } = hangoutsData || {};

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (hangout) => {
    const now = new Date();
    const eventDate = new Date(hangout.dateTime);
    
    if (eventDate > now) {
      return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    } else if (eventDate < now) {
      return { label: 'Past', color: 'bg-gray-100 text-gray-800' };
    } else {
      return { label: 'Happening Now', color: 'bg-green-100 text-green-800' };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4 mt-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Hangouts Management</h2>
          <p className="text-gray-600 mt-1">View and manage hangouts happening at your restaurant</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Hangouts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalHangouts || 0}
              </p>
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
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.thisMonthHangouts || 0}
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
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Participants</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalParticipants || 0}
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
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Participants</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(stats.avgParticipants || 0).toFixed(1)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search hangouts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Time Filter */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="all">All Hangouts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hangouts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {hangouts.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hangouts found
            </h3>
            <p className="text-gray-600">
              {timeFilter === 'upcoming' 
                ? 'No upcoming hangouts scheduled at your restaurant'
                : timeFilter === 'past'
                ? 'No past hangouts found'
                : 'No hangouts have been scheduled at your restaurant yet'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {hangouts.map((hangout, index) => {
              const status = getStatusBadge(hangout);
              
              return (
                <motion.div
                  key={hangout._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {hangout.title}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                        {hangout.isPublic ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Public
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Private
                          </span>
                        )}
                      </div>

                      {hangout.description && (
                        <p className="text-gray-600 mb-3">{hangout.description}</p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(hangout.dateTime)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(hangout.dateTime)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {hangout.participants?.length || 0} / {hangout.maxParticipants || '∞'} participants
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>Organized by {hangout.organizer?.name || 'Unknown'}</span>
                        </div>
                      </div>

                      {hangout.tags && hangout.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {hangout.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        to={`/hangouts/${hangout._id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Participants Preview */}
                  {hangout.participants && hangout.participants.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-700">Participants:</span>
                        <div className="flex -space-x-2">
                          {hangout.participants.slice(0, 5).map((participant, pIndex) => (
                            <div
                              key={pIndex}
                              className="h-8 w-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center"
                            >
                              {participant.profilePicture ? (
                                <img
                                  src={participant.profilePicture}
                                  alt={participant.name}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-medium text-gray-600">
                                  {participant.name?.charAt(0)?.toUpperCase()}
                                </span>
                              )}
                            </div>
                          ))}
                          {hangout.participants.length > 5 && (
                            <div className="h-8 w-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                +{hangout.participants.length - 5}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HangoutsManagement; 