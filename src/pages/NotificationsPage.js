import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon,
  CogIcon,
  CheckIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { notificationsAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import useTranslation from '../hooks/useTranslation';

const NotificationsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: ''
  });
  const [page, setPage] = useState(1);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const limit = 20;

  // Fetch notifications
  const { data: notificationsData, isLoading, error } = useQuery(
    ['notifications', filters, page],
    () => notificationsAPI.getNotifications({
      ...filters,
      page,
      limit,
      type: filters.type === 'all' ? undefined : filters.type,
      isRead: filters.status === 'all' ? undefined : filters.status === 'read'
    }),
    {
      keepPreviousData: true,
    }
  );

  // Fetch notification types
  const { data: notificationTypes = [] } = useQuery(
    'notification-types',
    () => notificationsAPI.getNotificationTypes()
  );

  // Fetch notification preferences
  const { data: preferences } = useQuery(
    'notification-preferences',
    () => notificationsAPI.getNotificationPreferences(),
    {
      enabled: showPreferences
    }
  );

  const notifications = notificationsData?.notifications || [];
  const totalNotifications = notificationsData?.total || 0;
  const totalPages = Math.ceil(totalNotifications / limit);

  // Mark as read mutation
  const markAsReadMutation = useMutation(notificationsAPI.markAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notifications', 'unread-count']);
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation(notificationsAPI.markAllAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notifications', 'unread-count']);
      toast.success(t('notifications.allMarkedAsRead'));
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation(notificationsAPI.deleteNotification, {
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notifications', 'unread-count']);
      setSelectedNotifications([]);
    }
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation(notificationsAPI.updateNotificationPreferences, {
    onSuccess: () => {
      queryClient.invalidateQueries(['notification-preferences']);
      toast.success(t('notifications.preferencesUpdated'));
    }
  });

  const handleMarkAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleDeleteNotification = (notificationId) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleBulkAction = (action) => {
    if (selectedNotifications.length === 0) {
      toast.error(t('notifications.selectNotificationsFirst'));
      return;
    }

    switch (action) {
      case 'markRead':
        selectedNotifications.forEach(id => markAsReadMutation.mutate(id));
        break;
      case 'delete':
        if (window.confirm(t('notifications.deleteConfirm', { count: selectedNotifications.length }))) {
          selectedNotifications.forEach(id => deleteNotificationMutation.mutate(id));
        }
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    const iconClass = "h-8 w-8";
    switch (type) {
      case 'hangout_invite':
      case 'hangout_update':
        return <div className={`${iconClass} bg-blue-100 text-blue-600 rounded-full p-2`}>👥</div>;
      case 'place_review':
      case 'place_update':
        return <div className={`${iconClass} bg-green-100 text-green-600 rounded-full p-2`}>📍</div>;
      case 'like':
      case 'favorite':
        return <div className={`${iconClass} bg-red-100 text-red-600 rounded-full p-2`}>❤️</div>;
      case 'comment':
      case 'message':
        return <div className={`${iconClass} bg-purple-100 text-purple-600 rounded-full p-2`}>💬</div>;
      case 'system':
        return <div className={`${iconClass} bg-yellow-100 text-yellow-600 rounded-full p-2`}>⚠️</div>;
      default:
        return <div className={`${iconClass} bg-gray-100 text-gray-600 rounded-full p-2`}>🔔</div>;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);

    if (diffInSeconds < 60) return t('notifications.justNow');
    if (diffInSeconds < 3600) return t('notifications.minutesAgo', { minutes: Math.floor(diffInSeconds / 60) });
    if (diffInSeconds < 86400) return t('notifications.hoursAgo', { hours: Math.floor(diffInSeconds / 3600) });
    if (diffInSeconds < 604800) return t('notifications.daysAgo', { days: Math.floor(diffInSeconds / 86400) });
    return notificationTime.toLocaleDateString();
  };

  const PreferencesModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
            <button
              onClick={() => setShowPreferences(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {notificationTypes.map(type => (
              <div key={type.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{type.name}</h4>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked={preferences?.[type.id]?.email}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Email</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked={preferences?.[type.id]?.push}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Push</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              onClick={() => setShowPreferences(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={() => {
                updatePreferencesMutation.mutate({});
                setShowPreferences(false);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
            >
              {t('notifications.managePreferences')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('auth.pleaseLogin')}</h2>
          <p className="text-gray-600">{t('auth.loginRequired')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <BellSolidIcon className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('notifications.title')}</h1>
                <p className="text-gray-600 mt-1">
                  {t('notifications.noNotificationsMessage')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                {t('notifications.markAllAsRead')}
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <CogIcon className="h-4 w-4 mr-2" />
                {t('notifications.settings')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('notifications.searchPlaceholder')}
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">{t('notifications.allTypes')}</option>
              {notificationTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">{t('notifications.allStatuses')}</option>
              <option value="unread">{t('notifications.unread')}</option>
              <option value="read">{t('notifications.read')}</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => setFilters({ type: 'all', status: 'all', search: '' })}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {t('notifications.clearAll')}
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-800">
                {selectedNotifications.length} {selectedNotifications.length === 1 ? t('notifications.title').slice(0, -1) : t('notifications.title').toLowerCase()} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('markRead')}
                  className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
                >
                  {t('notifications.bulkMarkAsRead')}
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
                >
                  {t('notifications.bulkDelete')}
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t('common.loading')}</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('notifications.noNotificationsTitle')}</h3>
              <p className="text-gray-600">{error.message}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('notifications.noNotificationsTitle')}</h3>
              <p className="text-gray-600">
                {filters.search || filters.type !== 'all' || filters.status !== 'all'
                  ? t('notifications.noFilteredNotifications')
                  : t('notifications.noNotificationsMessage')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {/* Select All Header */}
              <div className="p-4 bg-gray-50 border-b">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={selectedNotifications.length === notifications.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedNotifications(notifications.map(n => n._id));
                      } else {
                        setSelectedNotifications([]);
                      }
                    }}
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {t('notifications.selectAll')} ({notifications.length})
                  </span>
                </label>
              </div>

              {/* Notifications */}
              <AnimatePresence>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={selectedNotifications.includes(notification._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedNotifications(prev => [...prev, notification._id]);
                          } else {
                            setSelectedNotifications(prev => prev.filter(id => id !== notification._id));
                          }
                        }}
                      />

                      {/* Icon */}
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.isRead ? (
                              <button
                                onClick={() => handleMarkAsRead(notification._id)}
                                className="p-1.5 text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-100"
                                title={t('notifications.markAsReadTooltip')}
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            ) : (
                              <div className="p-1.5">
                                <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            <button
                              onClick={() => handleDeleteNotification(notification._id)}
                              className="p-1.5 text-red-600 hover:text-red-700 rounded-full hover:bg-red-100"
                              title={t('notifications.deleteTooltip')}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {t('notifications.showingResults', { start: (page - 1) * limit + 1, end: Math.min(page * limit, totalNotifications), total: totalNotifications })}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.previous')}
                  </button>
                  <span className="text-sm text-gray-700">
                    {t('notifications.pageInfo', { page, total: totalPages })}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Preferences Modal */}
      <AnimatePresence>
        {showPreferences && <PreferencesModal />}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsPage; 