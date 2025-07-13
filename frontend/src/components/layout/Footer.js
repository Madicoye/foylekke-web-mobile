import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram,
  Heart
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'Discover': [
      { name: 'Restaurants', path: '/places?type=restaurant' },
      { name: 'Parks', path: '/places?type=park' },
      { name: 'Museums', path: '/places?type=museum' },
      { name: 'Shopping Centers', path: '/places?type=shopping_center' },
      { name: 'Hotels', path: '/places?type=hotel' },
    ],
    'Community': [
      { name: 'Hangouts', path: '/hangouts' },
      { name: 'Reviews', path: '/places' },
      { name: 'Events', path: '/hangouts' },
      { name: 'Local Guides', path: '/places' },
    ],
    'Support': [
      { name: 'Help Center', path: '/help' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center"
              >
                <span className="text-white font-bold text-xl">FL</span>
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-gradient">Foy Lekke</h3>
                <p className="text-sm text-gray-400">Discover Amazing Places</p>
              </div>
            </Link>
            <p className="text-gray-400 mb-4">
              Your ultimate guide to discovering the best places in Senegal. 
              From restaurants to parks, museums to shopping centers.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors duration-200"
                  >
                    <Icon size={18} />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-lg font-semibold mb-4 text-white">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <MapPin size={20} className="text-primary-400" />
              <div>
                <p className="text-sm font-medium text-white">Location</p>
                <p className="text-sm text-gray-400">Dakar, Senegal</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone size={20} className="text-primary-400" />
              <div>
                <p className="text-sm font-medium text-white">Phone</p>
                <p className="text-sm text-gray-400">+221 33 XXX XX XX</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail size={20} className="text-primary-400" />
              <div>
                <p className="text-sm font-medium text-white">Email</p>
                <p className="text-sm text-gray-400">contact@foylekke.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {currentYear} Foy Lekke. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Made with</span>
              <Heart size={14} className="text-red-500 fill-current" />
              <span>in Senegal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 