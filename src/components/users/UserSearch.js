import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  Search, 
  User, 
  X, 
  Check, 
  Mail, 
  Phone,
  UserPlus,
  Loader2
} from 'lucide-react';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const UserSearch = ({ 
  onUserSelect, 
  selectedUsers = [], 
  onRemoveUser,
  placeholder = "Search users by name, email, or phone...",
  maxSelections = null,
  className = ""
}) => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Search users query
  const { data: searchResults = [], isLoading: isSearching, error } = useQuery(
    ['searchUsers', searchTerm],
    () => usersAPI.searchUsers(searchTerm),
    {
      enabled: searchTerm.length >= 2,
      keepPreviousData: true,
      staleTime: 30000, // Cache for 30 seconds
    }
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter out current user and already selected users
  const filteredResults = searchResults?.users?.filter(user => 
    user._id !== currentUser?._id && 
    !selectedUsers.some(selected => selected._id === user._id)
  ) || [];

  const handleUserSelect = (user) => {
    if (maxSelections && selectedUsers.length >= maxSelections) {
      return;
    }
    
    onUserSelect(user);
    setSearchTerm('');
    setIsSearchFocused(false);
    
    // Re-focus search input for multiple selections
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handleRemoveUser = (userId) => {
    onRemoveUser(userId);
  };

  const isMaxSelectionsReached = maxSelections && selectedUsers.length >= maxSelections;

  return (
    <div className={`relative ${className}`}>
      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Selected Users ({selectedUsers.length}{maxSelections ? `/${maxSelections}` : ''})
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
              >
                <div className="flex items-center space-x-2">
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.name}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <User size={16} />
                  )}
                  <span className="font-medium">{user.name}</span>
                  <span className="text-primary-600">({user.email})</span>
                </div>
                <button
                  onClick={() => handleRemoveUser(user._id)}
                  className="ml-2 hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching ? (
              <Loader2 size={20} className="text-gray-400 animate-spin" />
            ) : (
              <Search size={20} className="text-gray-400" />
            )}
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder={isMaxSelectionsReached ? "Maximum selections reached" : placeholder}
            disabled={isMaxSelectionsReached}
            className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              isMaxSelectionsReached 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                : 'bg-white'
            }`}
          />
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {isSearchFocused && searchTerm.length >= 2 && !isMaxSelectionsReached && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {isSearching ? (
                <div className="px-4 py-3 text-center text-gray-500">
                  <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                  Searching users...
                </div>
              ) : error ? (
                <div className="px-4 py-3 text-center text-red-600">
                  Error searching users. Please try again.
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="px-4 py-3 text-center text-gray-500">
                  {searchResults?.users?.length === 0 
                    ? "No users found. Try a different search term."
                    : "No more users to select."
                  }
                </div>
              ) : (
                <div className="py-1">
                  {filteredResults.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleUserSelect(user)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {user.profilePicture ? (
                          <img 
                            src={user.profilePicture} 
                            alt={user.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <User size={20} className="text-gray-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Mail size={12} />
                              <span className="truncate">{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone size={12} />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                          {user.location && (
                            <p className="text-xs text-gray-400 truncate">{user.location}</p>
                          )}
                        </div>
                        <UserPlus size={16} className="text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Help Text */}
      {searchTerm.length > 0 && searchTerm.length < 2 && (
        <p className="mt-2 text-sm text-gray-500">
          Type at least 2 characters to search for users
        </p>
      )}
    </div>
  );
};

export default UserSearch; 