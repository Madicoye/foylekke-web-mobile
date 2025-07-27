import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { useQuery } from 'react-query';
import { notificationsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import NotificationsDropdown from './NotificationsDropdown';

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch unread notifications count
  const { data: unreadCount = 0 } = useQuery(
    ['notifications', 'unread-count'],
    () => notificationsAPI.getUnreadCount(),
    {
      enabled: isAuthenticated,
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 10000, // 10 seconds
    }
  );

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="h-6 w-6 text-primary-600" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <NotificationsDropdown 
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell; 