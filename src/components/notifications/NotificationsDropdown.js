import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  XMarkIcon,
  CheckIcon,
  TrashIcon,
  EyeIcon,
  BellSlashIcon,
  UsersIcon,
  MapPinIcon,
  HeartIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { notificationsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const NotificationsDropdown = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery(
    ['notifications'],
    () => notificationsAPI.getNotifications({ limit: 10 }),
    {
      enabled: isOpen,
    }
  );

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
      toast.success('All notifications marked as read');
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation(notificationsAPI.deleteNotification, {
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notifications', 'unread-count']);
      toast.success('Notification deleted');
    }
  });

  const handleMarkAsRead = (notificationId, e) => {
    e.preventDefault();
    e.stopPropagation();
    markAsReadMutation.mutate(notificationId);
  };

  const handleDelete = (notificationId, e) => {
    e.preventDefault();
    e.stopPropagation();
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'hangout_invite':
      case 'hangout_update':
        return <UsersIcon className="h-5 w-5 text-blue-500" />;
      case 'place_review':
      case 'place_update':
        return <MapPinIcon className="h-5 w-5 text-green-500" />;
      case 'like':
      case 'favorite':
        return <HeartIcon className="h-5 w-5 text-red-500" />;
      case 'comment':
      case 'message':
        return <ChatBubbleLeftIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <BellSlashIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return notificationTime.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center space-x-2">
            {notifications.some(n => !n.isRead) && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isLoading}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex space-x-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <BellSlashIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notifications yet</p>
            <p className="text-sm text-gray-400">We'll notify you when something happens!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  if (notification.actionUrl) {
                    window.location.href = notification.actionUrl;
                  }
                  if (!notification.isRead) {
                    markAsReadMutation.mutate(notification._id);
                  }
                  onClose();
                }}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center space-x-1">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(notification._id, e)}
                        className="p-1 text-blue-600 hover:text-blue-700 rounded"
                        title="Mark as read"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(notification._id, e)}
                      className="p-1 text-red-600 hover:text-red-700 rounded"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <Link
            to="/notifications"
            onClick={onClose}
            className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all notifications
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default NotificationsDropdown; 