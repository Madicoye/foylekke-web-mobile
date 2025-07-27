import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Users,
  Plus,
  Home,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import SearchModal from '../search/SearchModal';
import DemoModeToggle from '../ads/DemoModeToggle';
import NotificationBell from '../notifications/NotificationBell';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Role-based navigation items
  const getNavItems = () => {
    const baseItems = [
      { name: 'Home', path: '/', icon: Home },
      { name: 'Places', path: '/places', icon: MapPin },
      { name: 'Hangouts', path: '/hangouts', icon: Users },
    ];

    if (!isAuthenticated) return baseItems;

    // Add role-specific items
    const roleSpecificItems = [];
    
    if (user?.role === 'admin') {
      roleSpecificItems.push({
        name: 'Admin Dashboard',
        path: '/admin',
        icon: Settings,
        roleSpecific: true
      });
    }
    
    if (user?.role === 'advertiser') {
      roleSpecificItems.push({
        name: 'Ad Dashboard',
        path: '/advertiser',
        icon: Settings,
        roleSpecific: true
      });
    }
    
    if (user?.role === 'business') {
      roleSpecificItems.push({
        name: 'Restaurant Dashboard',
        path: '/restaurant',
        icon: Settings,
        roleSpecific: true
      });
    }

    return [...baseItems, ...roleSpecificItems];
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center"
              >
                <span className="text-white font-bold text-xl">FL</span>
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gradient">Foy Lekke</h1>
                <p className="text-xs text-gray-500">Discover Amazing Places</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const isRoleSpecific = item.roleSpecific;
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? isRoleSpecific 
                          ? 'bg-accent-100 text-accent-700' 
                          : 'bg-primary-100 text-primary-700'
                        : isRoleSpecific
                          ? 'text-accent-600 hover:text-accent-700 hover:bg-accent-50'
                          : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{item.name}</span>
                    {isRoleSpecific && (
                      <span className="ml-1 text-xs bg-gradient-to-r from-accent-500 to-accent-600 text-white px-2 py-0.5 rounded-full font-medium">
                        {user?.role}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Search, Demo Toggle and User Actions */}
            <div className="flex items-center space-x-4">
              {/* Demo Mode Toggle */}
              <div className="hidden sm:block">
                <DemoModeToggle />
              </div>

              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
              >
                <Search size={20} />
              </motion.button>

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                    )}
                    <span className="hidden sm:block font-medium text-gray-700">
                      {user?.name}
                    </span>
                  </motion.button>

                  {/* Dropdown Menu - User Actions Only */}
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        {user?.role !== 'user' && (
                          <p className="text-xs text-accent-600 font-medium capitalize">{user?.role}</p>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <User size={16} />
                        <span>My Profile</span>
                      </Link>
                      
                      <Link
                        to="/hangouts/create"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <Plus size={16} />
                        <span>Create Hangout</span>
                      </Link>

                      <Link
                        to="/config"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>

                      {/* Divider */}
                      <div className="border-t border-gray-100 my-1"></div>

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-4"
            >
              <div className="flex flex-col space-y-1">
                {/* User Info Section (Mobile) */}
                {isAuthenticated && (
                  <div className="px-3 py-3 bg-gray-50 rounded-lg mb-3">
                    <div className="flex items-center space-x-3">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                          <User size={20} className="text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        {user?.role !== 'user' && (
                          <p className="text-xs text-accent-600 font-medium capitalize">{user?.role}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Navigation */}
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const isRoleSpecific = item.roleSpecific;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? isRoleSpecific 
                            ? 'bg-accent-100 text-accent-700' 
                            : 'bg-primary-100 text-primary-700'
                          : isRoleSpecific
                            ? 'text-accent-600 hover:text-accent-700 hover:bg-accent-50'
                            : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.name}</span>
                      {isRoleSpecific && (
                        <span className="ml-auto text-xs bg-gradient-to-r from-accent-500 to-accent-600 text-white px-2 py-0.5 rounded-full font-medium">
                          {user?.role}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {isAuthenticated && (
                  <>
                    {/* Divider */}
                    <div className="border-t border-gray-200 my-2"></div>
                    
                    {/* User Actions */}
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                    >
                      <User size={20} />
                      <span className="font-medium">My Profile</span>
                    </Link>
                    
                    <Link
                      to="/hangouts/create"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                    >
                      <Plus size={20} />
                      <span className="font-medium">Create Hangout</span>
                    </Link>

                    <Link
                      to="/config"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                    >
                      <Settings size={20} />
                      <span className="font-medium">Settings</span>
                    </Link>

                    {/* Demo Mode Toggle for Mobile */}
                    <div className="px-3 py-2">
                      <DemoModeToggle />
                    </div>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 w-full text-left"
                    >
                      <LogOut size={20} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                )}

                {/* Login/Register for non-authenticated users */}
                {!isAuthenticated && (
                  <>
                    <div className="px-3 py-2">
                      <DemoModeToggle />
                    </div>
                    
                    <div className="border-t border-gray-200 my-2"></div>
                    
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                    >
                      <User size={20} />
                      <span className="font-medium">Login</span>
                    </Link>
                    
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors duration-200"
                    >
                      <Plus size={20} />
                      <span className="font-medium">Sign Up</span>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar; 