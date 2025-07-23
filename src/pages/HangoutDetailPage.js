import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  User,
  MessageCircle,
  Share2,
  Heart,
  ChevronLeft,
  Send,
  Settings,
  UserPlus,
  UserMinus,
  Eye,
  EyeOff,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle,
  Phone,
  Globe,
  Navigation,
  Edit3,
  Trash2
} from 'lucide-react';
import { hangoutsAPI, placesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { getCuisineTypeConfig } from '../config/cuisineTypes';
import { getPlaceTypeConfig } from '../config/placeTypes';
import { getImageUrls } from '../utils/imageUtils';

const HangoutDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [newMessage, setNewMessage] = useState('');
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch hangout details
  const { data: hangout, isLoading, error } = useQuery(
    ['hangout', id],
    () => hangoutsAPI.getHangout(id),
    {
      enabled: !!id && isAuthenticated,
      refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
    }
  );

  // Join hangout mutation
  const joinMutation = useMutation(
    () => hangoutsAPI.joinHangout(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['hangout', id]);
        toast.success('Successfully joined the hangout!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to join hangout');
      }
    }
  );

  // Leave hangout mutation
  const leaveMutation = useMutation(
    () => hangoutsAPI.leaveHangout(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['hangout', id]);
        toast.success('Successfully left the hangout');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to leave hangout');
      }
    }
  );

  // Send message mutation
  const sendMessageMutation = useMutation(
    (content) => hangoutsAPI.addMessage(id, content),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['hangout', id]);
        setNewMessage('');
        scrollToBottom();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to send message');
      }
    }
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [hangout?.messages, activeTab]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to view hangout details.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  const getDirectionsUrl = () => {
    if (hangout.place?.address?.coordinates?.coordinates) {
      const [lng, lat] = hangout.place.address.coordinates.coordinates;
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hangout.place?.name + ' ' + hangout.place?.address?.street)}`;
  };

  const getDefaultImage = (type) => {
    const config = getPlaceTypeConfig(type);
    return {
      icon: config?.icon || '📍',
      gradient: 'from-primary-100 to-accent-100'
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hangout details...</p>
        </div>
      </div>
    );
  }

  if (error || !hangout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Hangout Not Found</h1>
          <p className="text-gray-600 mb-6">The hangout you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/hangouts')}
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Browse All Hangouts
          </button>
        </div>
      </div>
    );
  }

  const isCreator = hangout.creator._id === user?.id;
  const isParticipant = hangout.participants.some(p => p.user._id === user?.id);
  const canJoin = hangout.status === 'planned' && !isParticipant && (!hangout.maxParticipants || hangout.participants.length < hangout.maxParticipants);
  const acceptedParticipants = hangout.participants.filter(p => p.status === 'accepted');
  const pendingParticipants = hangout.participants.filter(p => p.status === 'pending');

  const getStatusColor = (status) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'planned': return <Calendar className="h-4 w-4" />;
      case 'ongoing': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && hangout.chatEnabled) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: hangout.title,
          text: hangout.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const { date, time } = formatDateTime(hangout.dateTime);
  const cuisineConfig = getCuisineTypeConfig(hangout.place?.cuisine?.[0]);
  const typeConfig = getPlaceTypeConfig(hangout.place?.type);
  const defaultImg = hangout.place ? getDefaultImage(hangout.place.type) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to="/hangouts" className="text-gray-500 hover:text-gray-700">Hangouts</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{hangout.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(hangout.status)}`}>
                      {getStatusIcon(hangout.status)}
                      <span className="ml-2 capitalize">{hangout.status}</span>
                    </span>
                    {hangout.isPrivate && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        <EyeOff className="h-4 w-4 mr-1" />
                        Private
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleShare}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                    {isCreator && (
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors duration-200">
                        <Edit3 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{hangout.title}</h1>
                
                {hangout.description && (
                  <p className="text-gray-600 text-lg leading-relaxed">{hangout.description}</p>
                )}
              </div>

              {/* Key Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Date & Time */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calendar className="h-5 w-5 text-primary-500" />
                    <h3 className="font-semibold text-gray-900">Date & Time</h3>
                  </div>
                  <p className="text-gray-600">{date}</p>
                  <p className="text-gray-600">{time}</p>
                </div>

                {/* Location */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <MapPin className="h-5 w-5 text-primary-500" />
                    <h3 className="font-semibold text-gray-900">Location</h3>
                  </div>
                  <Link 
                    to={`/places/${hangout.place._id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {hangout.place.name}
                  </Link>
                  <p className="text-gray-600 text-sm">{hangout.place.address?.street}</p>
                </div>

                {/* Participants */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Users className="h-5 w-5 text-primary-500" />
                    <h3 className="font-semibold text-gray-900">Participants</h3>
                  </div>
                  <p className="text-gray-600">
                    {acceptedParticipants.length}
                    {hangout.maxParticipants && ` / ${hangout.maxParticipants}`} joined
                  </p>
                  {pendingParticipants.length > 0 && (
                    <p className="text-gray-500 text-sm">{pendingParticipants.length} pending</p>
                  )}
                </div>

                {/* Organizer */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="h-5 w-5 text-primary-500" />
                    <h3 className="font-semibold text-gray-900">Organizer</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <img
                      src={hangout.creator.profilePicture || `https://ui-avatars.com/api/?name=${hangout.creator.name}&background=3B82F6&color=fff`}
                      alt={hangout.creator.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-gray-900 font-medium">{hangout.creator.name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Action Buttons */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="space-y-3">
                  {canJoin && (
                    <button
                      onClick={() => joinMutation.mutate()}
                      disabled={joinMutation.isLoading}
                      className="w-full flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
                      <UserPlus className="h-5 w-5" />
                      <span>{joinMutation.isLoading ? 'Joining...' : 'Join Hangout'}</span>
                    </button>
                  )}
                  
                  {isParticipant && !isCreator && (
                    <button
                      onClick={() => leaveMutation.mutate()}
                      disabled={leaveMutation.isLoading}
                      className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
                      <UserMinus className="h-5 w-5" />
                      <span>{leaveMutation.isLoading ? 'Leaving...' : 'Leave Hangout'}</span>
                    </button>
                  )}
                  
                  <a
                    href={getDirectionsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Navigation className="h-5 w-5" />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>

              {/* Place Info */}
              {hangout.place && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Place</h3>
                  
                  {(() => {
                    const imageUrls = getImageUrls(hangout.place);
                    return imageUrls.length > 0 ? (
                      <div className="mb-4">
                        <img
                          src={imageUrls[0]}
                          alt={hangout.place.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className={`mb-4 w-full h-32 bg-gradient-to-br ${defaultImg?.gradient} rounded-lg flex items-center justify-center`}>
                        <div className="text-center">
                          <div className="text-3xl">{defaultImg?.icon}</div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Type</span>
                      <span className="text-gray-900 font-medium">{typeConfig?.label || hangout.place.type}</span>
                    </div>
                    
                    {hangout.place.cuisine && hangout.place.cuisine.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Cuisine</span>
                        <span className="text-gray-900 font-medium">{cuisineConfig?.label || hangout.place.cuisine[0]}</span>
                      </div>
                    )}
                    
                    {hangout.place.ratings?.appRating && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Rating</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-gray-900 font-medium">{hangout.place.ratings.appRating.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Link
                    to={`/places/${hangout.place._id}`}
                    className="mt-4 block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    View Place Details
                  </Link>
                </div>
              )}

              {/* Tags */}
              {hangout.tags && hangout.tags.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {hangout.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tabbed Content */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'participants', label: 'Participants', icon: Users },
                { id: 'chat', label: 'Chat', icon: MessageCircle },
                { id: 'details', label: 'Details', icon: AlertCircle }
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
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'participants' && (
              <div className="space-y-6">
                {/* Accepted Participants */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Joined ({acceptedParticipants.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {acceptedParticipants.slice(0, showAllParticipants ? acceptedParticipants.length : 6).map((participant) => (
                      <div
                        key={participant.user._id}
                        className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg"
                      >
                        <img
                          src={participant.user.profilePicture || `https://ui-avatars.com/api/?name=${participant.user.name}&background=3B82F6&color=fff`}
                          alt={participant.user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{participant.user.name}</p>
                          {participant.user._id === hangout.creator._id && (
                            <p className="text-xs text-primary-600">Organizer</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {acceptedParticipants.length > 6 && (
                    <button
                      onClick={() => setShowAllParticipants(!showAllParticipants)}
                      className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {showAllParticipants ? 'Show Less' : `Show ${acceptedParticipants.length - 6} More`}
                    </button>
                  )}
                </div>

                {/* Pending Participants */}
                {pendingParticipants.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Pending ({pendingParticipants.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pendingParticipants.map((participant) => (
                        <div
                          key={participant.user._id}
                          className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg"
                        >
                          <img
                            src={participant.user.profilePicture || `https://ui-avatars.com/api/?name=${participant.user.name}&background=F59E0B&color=fff`}
                            alt={participant.user.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{participant.user.name}</p>
                            <p className="text-xs text-yellow-600">Pending response</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="space-y-6">
                {hangout.chatEnabled ? (
                  <>
                    {/* Messages */}
                    <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
                      {hangout.messages && hangout.messages.length > 0 ? (
                        <div className="space-y-4">
                          {hangout.messages.map((message, index) => (
                            <div
                              key={index}
                              className={`flex ${message.sender._id === user?.id ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender._id === user?.id
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-white text-gray-900'
                              }`}>
                                {message.sender._id !== user?.id && (
                                  <p className="text-xs font-medium mb-1 opacity-75">
                                    {message.sender.name}
                                  </p>
                                )}
                                <p className="text-sm">{message.content}</p>
                                <p className={`text-xs mt-1 opacity-75`}>
                                  {formatMessageTime(message.timestamp)}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No messages yet. Start the conversation!</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    {(isParticipant || isCreator) && (
                      <form onSubmit={handleSendMessage} className="flex space-x-4">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim() || sendMessageMutation.isLoading}
                          className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
                        >
                          <Send className="h-4 w-4" />
                          <span>Send</span>
                        </button>
                      </form>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Chat is disabled for this hangout</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Special Requests */}
                {hangout.specialRequests && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requests</h3>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-amber-800">{hangout.specialRequests}</p>
                    </div>
                  </div>
                )}

                {/* Hangout History */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hangout Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Hangout Created</p>
                        <p className="text-sm text-gray-500">
                          {new Date(hangout.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Scheduled For</p>
                        <p className="text-sm text-gray-500">{date} at {time}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Visibility</span>
                      <span className="text-gray-900 font-medium">
                        {hangout.isPrivate ? 'Private' : 'Public'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chat Enabled</span>
                      <span className="text-gray-900 font-medium">
                        {hangout.chatEnabled ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Participants</span>
                      <span className="text-gray-900 font-medium">
                        {hangout.maxParticipants || 'Unlimited'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HangoutDetailPage; 