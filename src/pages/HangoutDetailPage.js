import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  ShareIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  CogIcon,
  UserPlusIcon,
  UserMinusIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  LockClosedIcon,
  CheckIcon,
  XMarkIcon,
  Bars3Icon,
  TagIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { hangoutsAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import UserSearch from '../components/users/UserSearch';
import { 
  getImageUrls, 
  hasValidImages, 
  getDefaultImageConfig, 
  createImageErrorHandler 
} from '../utils/imageUtils';

const HangoutDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showJoinRequestModal, setShowJoinRequestModal] = useState(false);
  const [selectedUsersToInvite, setSelectedUsersToInvite] = useState([]);
  const [joinRequestMessage, setJoinRequestMessage] = useState('');

  // Fetch hangout details
  const { data: hangout, isLoading, error } = useQuery(
    ['hangout', id],
    () => hangoutsAPI.getHangout(id),
    {
      enabled: !!id,
      onError: (error) => {
        console.error('Failed to fetch hangout:', error);
      }
    }
  );

  // Join hangout mutation
  const joinMutation = useMutation(hangoutsAPI.joinHangout, {
    onSuccess: () => {
      queryClient.invalidateQueries(['hangout', id]);
      toast.success('Successfully joined the hangout!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to join hangout');
    }
  });

  // Leave hangout mutation
  const leaveMutation = useMutation(hangoutsAPI.leaveHangout, {
    onSuccess: () => {
      queryClient.invalidateQueries(['hangout', id]);
      toast.success('Left the hangout');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to leave hangout');
    }
  });

  // Request to join mutation
  const requestJoinMutation = useMutation(
    ({ hangoutId, message }) => hangoutsAPI.requestToJoin(hangoutId, message),
    {
      onSuccess: () => {
        setShowJoinRequestModal(false);
        setJoinRequestMessage('');
        toast.success('Join request sent!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to send join request');
      }
    }
  );

  // Respond to join request mutation
  const respondToJoinRequestMutation = useMutation(
    ({ hangoutId, requestId, response }) => hangoutsAPI.respondToJoinRequest(hangoutId, requestId, response),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['hangout', id]);
        const action = variables.response === 'accept' ? 'approved' : 'rejected';
        toast.success(`Join request ${action}!`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to respond to request');
      }
    }
  );

  // Send invitations mutation
  const sendInvitationsMutation = useMutation(
    ({ hangoutId, userIds }) => hangoutsAPI.sendInvitations(hangoutId, userIds),
    {
      onSuccess: () => {
        setShowInviteModal(false);
        setSelectedUsersToInvite([]);
        toast.success('Invitations sent!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to send invitations');
      }
    }
  );

  // Handle place image
  const placeImageUrls = hangout?.place ? getImageUrls(hangout.place) : [];
  const hasPlaceImages = hangout?.place ? hasValidImages(hangout.place) : false;
  const defaultImageConfig = getDefaultImageConfig('restaurant');

  // Helper functions
  const formatAddress = (address) => {
    if (!address) return null;
    
    // If address is a string, return it directly
    if (typeof address === 'string') return address;
    
    // If address is an object, format it properly
    if (typeof address === 'object') {
      const parts = [];
      if (address.street) parts.push(address.street);
      if (address.region) parts.push(address.region);
      if (address.city) parts.push(address.city);
      if (address.country) parts.push(address.country);
      return parts.length > 0 ? parts.join(', ') : 'Address not specified';
    }
    
    return 'Address not specified';
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dateLabel;
    if (date.toDateString() === today.toDateString()) {
      dateLabel = 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateLabel = 'Tomorrow';
    } else {
      dateLabel = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    const timeLabel = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
    
    return { dateLabel, timeLabel, fullDate: date };
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate participant information
  const acceptedParticipants = hangout?.participants?.filter(p => p.status === 'accepted') || [];
  const pendingParticipants = hangout?.participants?.filter(p => p.status === 'pending') || [];
  const totalParticipants = acceptedParticipants.length + 1; // +1 for creator
  const isCreator = user?._id === hangout?.creator?._id;
  const isParticipant = hangout?.participants?.some(p => p.user?._id === user?._id && p.status === 'accepted');
  const hasPendingInvite = hangout?.participants?.some(p => p.user?._id === user?._id && p.status === 'pending');
  const canJoin = user && !isParticipant && !isCreator && !hasPendingInvite &&
    (!hangout?.maxParticipants || totalParticipants < hangout.maxParticipants);

  // Event handlers
  const handleJoin = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    joinMutation.mutate(id);
  };

  const handleLeave = () => {
    if (window.confirm('Are you sure you want to leave this hangout?')) {
      leaveMutation.mutate(id);
    }
  };

  const handleSendInvitation = () => {
    if (selectedUsersToInvite.length === 0) {
      toast.error('Please select users to invite');
      return;
    }

    const userIds = selectedUsersToInvite.map(user => user._id);
    sendInvitationsMutation.mutate({
      hangoutId: id,
      userIds: userIds
    });
  };

  const handleAddUserToInvite = (user) => {
    setSelectedUsersToInvite(prev => [...prev, user]);
  };

  const handleRemoveUserFromInvite = (userId) => {
    setSelectedUsersToInvite(prev => prev.filter(user => user._id !== userId));
  };

  const handleJoinRequest = () => {
    requestJoinMutation.mutate({
      hangoutId: id,
      message: joinRequestMessage.trim()
    });
  };

  const handleRespondToJoinRequest = (requestId, response) => {
    respondToJoinRequestMutation.mutate({
      hangoutId: id,
      requestId,
      response
    });
  };

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hangout Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error.response?.status === 403 
              ? "You don't have access to this private hangout."
              : "This hangout doesn't exist or has been removed."
            }
          </p>
          <button
            onClick={() => navigate('/hangouts')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Browse Hangouts
          </button>
        </div>
      </div>
    );
  }

  if (!hangout) return null;

  const { dateLabel, timeLabel, fullDate } = formatDateTime(hangout.dateTime);
  const isPastEvent = fullDate < new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8"
        >
          {/* Cover Image */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            {hasPlaceImages && placeImageUrls.length > 0 ? (
              <img
                src={placeImageUrls[0]}
                alt={hangout.place?.name || hangout.title}
                className="w-full h-full object-cover"
                onError={createImageErrorHandler('restaurant')}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${defaultImageConfig.gradient} flex items-center justify-center`}>
                <span className="text-6xl">{defaultImageConfig.icon}</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            {/* Overlay Badges */}
            <div className="absolute top-4 left-4 flex flex-col space-y-2">
              {/* Status Badge */}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(hangout.status)}`}>
                {hangout.status.charAt(0).toUpperCase() + hangout.status.slice(1)}
              </span>
              
              {/* Privacy Badge */}
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${
                !hangout.isPrivate ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {!hangout.isPrivate ? <GlobeAltIcon className="h-4 w-4" /> : <LockClosedIcon className="h-4 w-4" />}
                <span>{!hangout.isPrivate ? 'Public' : 'Private'}</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                <ShareIcon className="h-5 w-5" />
              </button>
              <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                <HeartIcon className="h-5 w-5" />
              </button>
              {isCreator && (
                <button 
                  onClick={() => navigate(`/hangouts/${id}/edit`)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                >
                  <CogIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{hangout.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center space-x-2">
                  <CalendarDaysIcon className="h-5 w-5" />
                  <span>{dateLabel}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5" />
                  <span>{timeLabel}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UsersIcon className="h-5 w-5" />
                  <span>{totalParticipants}{hangout.maxParticipants ? `/${hangout.maxParticipants}` : ''} people</span>
                </div>
                {hangout.place && (
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="h-5 w-5" />
                    <span className="truncate">{hangout.place.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Description */}
            {hangout.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">About this hangout</h2>
                <p className="text-gray-700 leading-relaxed">{hangout.description}</p>
              </div>
            )}

            {/* Tags */}
            {hangout.tags && hangout.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <TagIcon className="h-5 w-5 mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {hangout.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              {!user ? (
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                >
                  Login to Join
                </button>
              ) : isCreator ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                  >
                    <UserPlusIcon className="h-5 w-5" />
                    <span>Invite Friends</span>
                  </button>
                  <button
                    onClick={() => navigate(`/hangouts/${id}/edit`)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                  >
                    <PencilIcon className="h-5 w-5" />
                    <span>Edit Hangout</span>
                  </button>
                </div>
              ) : isParticipant ? (
                <button
                  onClick={handleLeave}
                  disabled={leaveMutation.isLoading || isPastEvent}
                  className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserMinusIcon className="h-5 w-5" />
                  <span>{leaveMutation.isLoading ? 'Leaving...' : 'Leave Hangout'}</span>
                </button>
              ) : hasPendingInvite ? (
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    <span>Invitation Pending</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">You have a pending invitation for this hangout</p>
                </div>
              ) : canJoin && !isPastEvent ? (
                <button
                  onClick={handleJoin}
                  disabled={joinMutation.isLoading}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2 font-medium transition-colors disabled:opacity-50"
                >
                  <UserPlusIcon className="h-5 w-5" />
                  <span>{joinMutation.isLoading ? 'Joining...' : 'Join Hangout'}</span>
                </button>
              ) : hangout.maxParticipants && totalParticipants >= hangout.maxParticipants ? (
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                    <UsersIcon className="h-5 w-5 mr-2" />
                    <span>Hangout Full</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {hangout.maxParticipants} / {hangout.maxParticipants} participants
                  </p>
                </div>
              ) : isPastEvent ? (
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    <span>Event Completed</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Location Details */}
            {hangout.place && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="h-6 w-6 mr-2 text-primary-600" />
                  Location
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{hangout.place.name}</h3>
                  {formatAddress(hangout.place.address) && (
                    <p className="text-gray-600 mb-2">{formatAddress(hangout.place.address)}</p>
                  )}
                  {hangout.place.images && hangout.place.images.length > 0 && (
                    <div className="mt-3">
                      <img
                        src={hangout.place.images[0]}
                        alt={hangout.place.name}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={createImageErrorHandler('restaurant')}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Participants */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <UsersIcon className="h-6 w-6 mr-2 text-primary-600" />
                Participants ({totalParticipants}{hangout.maxParticipants ? `/${hangout.maxParticipants}` : ''})
              </h2>
              
              {/* Creator */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Organizer</h3>
                <div className="flex items-center space-x-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                  {hangout.creator?.profilePicture ? (
                    <img
                      src={hangout.creator.profilePicture}
                      alt={hangout.creator.name}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-primary-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {hangout.creator?.name || 'Anonymous'}
                      {isCreator && <span className="text-primary-600 ml-2">(You)</span>}
                    </p>
                    <p className="text-sm text-gray-600">{hangout.creator?.email || 'No email'}</p>
                  </div>
                  <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded">
                    Organizer
                  </span>
                </div>
              </div>

              {/* Accepted Participants */}
              {acceptedParticipants.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Joined ({acceptedParticipants.length})
                  </h3>
                  <div className="space-y-2">
                    {acceptedParticipants.map((participant) => (
                      <div key={participant.user?._id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        {participant.user?.profilePicture ? (
                          <img
                            src={participant.user.profilePicture}
                            alt={participant.user.name}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {participant.user?.name || 'Anonymous'}
                            {participant.user?._id === user?._id && <span className="text-green-600 ml-2">(You)</span>}
                          </p>
                          <p className="text-sm text-gray-600">{participant.user?.email || 'No email'}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Joined
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Participants */}
              {isCreator && pendingParticipants.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Pending Invitations ({pendingParticipants.length})
                  </h3>
                  <div className="space-y-2">
                    {pendingParticipants.map((participant) => (
                      <div key={participant.user?._id} className="flex items-center space-x-3 p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                        {participant.user?.profilePicture ? (
                          <img
                            src={participant.user.profilePicture}
                            alt={participant.user.name}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{participant.user?.name || 'Anonymous'}</p>
                          <p className="text-sm text-gray-600">{participant.user?.email || 'No email'}</p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No participants yet */}
              {acceptedParticipants.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <UsersIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No one has joined yet</p>
                  <p className="text-sm">Be the first to join this hangout!</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">{dateLabel}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium text-gray-900">{timeLabel}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <UsersIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Participants</p>
                    <p className="font-medium text-gray-900">
                      {totalParticipants}{hangout.maxParticipants ? ` of ${hangout.maxParticipants}` : ''}
                    </p>
                  </div>
                </div>
                {hangout.place && (
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-900">{hangout.place.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Organizer Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer</h3>
              <div className="flex items-center space-x-3 mb-4">
                {hangout.creator?.profilePicture ? (
                  <img
                    src={hangout.creator.profilePicture}
                    alt={hangout.creator.name}
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-primary-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {hangout.creator?.name || 'Anonymous Organizer'}
                    {isCreator && <span className="text-primary-600 ml-2">(You)</span>}
                  </p>
                  <p className="text-sm text-gray-600">{hangout.creator?.email || 'No email'}</p>
                </div>
              </div>
              {!isCreator && (
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors">
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  <span>Send Message</span>
                </button>
              )}
            </motion.div>
          </div>
        </div>

        {/* Invite Modal */}
        <AnimatePresence>
          {showInviteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Invite Friends to Hangout</h3>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <UserSearch
                    onUserSelect={handleAddUserToInvite}
                    selectedUsers={selectedUsersToInvite}
                    onRemoveUser={handleRemoveUserFromInvite}
                    placeholder="Search friends by name, email, or phone..."
                    maxSelections={10}
                  />
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {selectedUsersToInvite.length} user{selectedUsersToInvite.length !== 1 ? 's' : ''} selected
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setSelectedUsersToInvite([]);
                        setShowInviteModal(false);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendInvitation}
                      disabled={sendInvitationsMutation.isLoading || selectedUsersToInvite.length === 0}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <UserPlusIcon className="h-4 w-4" />
                      <span>{sendInvitationsMutation.isLoading ? 'Sending...' : 'Send Invitations'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Join Request Modal */}
        <AnimatePresence>
          {showJoinRequestModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Request to Join</h3>
                <p className="text-gray-600 mb-4">
                  Send a message to the organizer explaining why you'd like to join this hangout.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={joinRequestMessage}
                    onChange={(e) => setJoinRequestMessage(e.target.value)}
                    placeholder="Hi! I'd love to join this hangout because..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {joinRequestMessage.length}/200 characters
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowJoinRequestModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinRequest}
                    disabled={requestJoinMutation.isLoading}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {requestJoinMutation.isLoading ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HangoutDetailPage; 