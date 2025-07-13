import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UsersIcon, 
  HeartIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const HangoutsPage = () => {
  const [hangouts, setHangouts] = useState([]);
  const [filteredHangouts, setFilteredHangouts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dummy hangouts data
  const dummyHangouts = [
    {
      id: 1,
      title: "Dakar Food Tour",
      description: "Let's explore the best restaurants in Dakar together! We'll visit 3-4 places and share our experiences.",
      place: {
        name: "Le Teranga",
        address: "123 Avenue Léopold Sédar Senghor, Dakar"
      },
      organizer: {
        name: "Mariama Diallo",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400"
      },
      participants: [
        { name: "Mariama Diallo", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400" },
        { name: "Amadou Sow", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" },
        { name: "Fatou Ndiaye", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400" }
      ],
      maxParticipants: 8,
      currentParticipants: 3,
      date: "2024-01-20",
      time: "18:00",
      duration: 3,
      category: "Food & Dining",
      tags: ["food tour", "dakar", "restaurants"],
      isPublic: true,
      status: "upcoming",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
    },
    {
      id: 2,
      title: "Coffee & Conversation",
      description: "Casual meetup for coffee lovers. Let's discuss our favorite cafes and share recommendations.",
      place: {
        name: "La Galette",
        address: "789 Boulevard de la République, Dakar"
      },
      organizer: {
        name: "Fatou Ndiaye",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
      },
      participants: [
        { name: "Fatou Ndiaye", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400" },
        { name: "Mariama Diallo", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400" }
      ],
      maxParticipants: 6,
      currentParticipants: 2,
      date: "2024-01-16",
      time: "10:00",
      duration: 2,
      category: "Social",
      tags: ["coffee", "social", "meetup"],
      isPublic: true,
      status: "upcoming",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800"
    },
    {
      id: 3,
      title: "Seafood Night",
      description: "Dinner at Chez Loutcha for seafood lovers. Let's enjoy fresh fish and great company!",
      place: {
        name: "Chez Loutcha",
        address: "456 Rue de la Corniche, Dakar"
      },
      organizer: {
        name: "Amadou Sow",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
      },
      participants: [
        { name: "Amadou Sow", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" },
        { name: "Mariama Diallo", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400" }
      ],
      maxParticipants: 4,
      currentParticipants: 2,
      date: "2024-01-18",
      time: "19:00",
      duration: 2,
      category: "Food & Dining",
      tags: ["seafood", "dinner", "fine dining"],
      isPublic: false,
      status: "upcoming",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800"
    },
    {
      id: 4,
      title: "Weekend Beach Day",
      description: "Relaxing day at the beach with friends. Bring your own food and drinks!",
      place: {
        name: "Plage de Ngor",
        address: "Ngor, Dakar"
      },
      organizer: {
        name: "Mariama Diallo",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400"
      },
      participants: [
        { name: "Mariama Diallo", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400" },
        { name: "Amadou Sow", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" },
        { name: "Fatou Ndiaye", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400" }
      ],
      maxParticipants: 10,
      currentParticipants: 3,
      date: "2024-01-21",
      time: "14:00",
      duration: 4,
      category: "Outdoor",
      tags: ["beach", "weekend", "relaxation"],
      isPublic: true,
      status: "upcoming",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
    },
    {
      id: 5,
      title: "Museum Visit",
      description: "Cultural afternoon at the Museum of Black Civilizations. Let's learn together!",
      place: {
        name: "Museum of Black Civilizations",
        address: "Avenue Cheikh Anta Diop, Dakar"
      },
      organizer: {
        name: "Fatou Ndiaye",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
      },
      participants: [
        { name: "Fatou Ndiaye", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400" }
      ],
      maxParticipants: 8,
      currentParticipants: 1,
      date: "2024-01-25",
      time: "15:00",
      duration: 2,
      category: "Cultural",
      tags: ["museum", "culture", "education"],
      isPublic: true,
      status: "upcoming",
      image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'Food & Dining', name: 'Food & Dining' },
    { id: 'Social', name: 'Social' },
    { id: 'Outdoor', name: 'Outdoor' },
    { id: 'Cultural', name: 'Cultural' },
    { id: 'Sports', name: 'Sports' },
    { id: 'Entertainment', name: 'Entertainment' }
  ];

  const statuses = [
    { id: 'all', name: 'All Status' },
    { id: 'upcoming', name: 'Upcoming' },
    { id: 'ongoing', name: 'Ongoing' },
    { id: 'completed', name: 'Completed' }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setHangouts(dummyHangouts);
      setFilteredHangouts(dummyHangouts);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = hangouts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(hangout =>
        hangout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hangout.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hangout.place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hangout.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(hangout => hangout.category === selectedCategory);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(hangout => hangout.status === selectedStatus);
    }

    setFilteredHangouts(filtered);
  }, [hangouts, searchTerm, selectedCategory, selectedStatus]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Food & Dining': return 'bg-orange-100 text-orange-800';
      case 'Social': return 'bg-purple-100 text-purple-800';
      case 'Outdoor': return 'bg-green-100 text-green-800';
      case 'Cultural': return 'bg-yellow-100 text-yellow-800';
      case 'Sports': return 'bg-red-100 text-red-800';
      case 'Entertainment': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hangouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Social Hangouts
              </h1>
              <p className="text-gray-600">
                Connect with people and discover amazing places together
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Hangout
            </motion.button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4">
              {/* Search */}
              <div className="flex-1 mb-4 lg:mb-0">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search hangouts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row sm:space-x-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mb-2 sm:mb-0 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-gray-600">
            Showing {filteredHangouts.length} hangout{filteredHangouts.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* Hangouts Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredHangouts.map((hangout, index) => (
              <motion.div
                key={hangout.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={hangout.image}
                    alt={hangout.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(hangout.status)}`}>
                      {hangout.status}
                    </span>
                  </div>
                  {!hangout.isPublic && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Private
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Title and Category */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {hangout.title}
                    </h3>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(hangout.category)}`}>
                      {hangout.category}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {hangout.description}
                  </p>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <span>{hangout.place.name}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>{formatDate(hangout.date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span>{hangout.time} ({hangout.duration}h)</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <UsersIcon className="h-4 w-4 mr-2" />
                      <span>{hangout.currentParticipants}/{hangout.maxParticipants} participants</span>
                    </div>
                  </div>

                  {/* Organizer */}
                  <div className="flex items-center mb-4">
                    <img
                      src={hangout.organizer.avatar}
                      alt={hangout.organizer.name}
                      className="h-8 w-8 rounded-full mr-3"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {hangout.organizer.name}
                      </p>
                      <p className="text-xs text-gray-500">Organizer</p>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="flex items-center mb-4">
                    <div className="flex -space-x-2">
                      {hangout.participants.slice(0, 3).map((participant, idx) => (
                        <img
                          key={idx}
                          src={participant.avatar}
                          alt={participant.name}
                          className="h-6 w-6 rounded-full border-2 border-white"
                        />
                      ))}
                      {hangout.participants.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-gray-600">
                            +{hangout.participants.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="ml-2 text-xs text-gray-500">
                      {hangout.participants.length} joined
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {hangout.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Join Hangout
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <HeartIcon className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredHangouts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <UsersIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hangouts found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters to find more hangouts.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HangoutsPage; 