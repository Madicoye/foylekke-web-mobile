import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Edit,
  Share2,
  Heart,
  MessageCircle,
  Settings,
  UserPlus,
  UserMinus,
  AlertTriangle,
  Globe,
  Lock,
  Check,
  X,
  Mail,
  Phone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { hangoutsAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const HangoutDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showJoinRequestModal, setShowJoinRequestModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [joinRequestMessage, setJoinRequestMessage] = useState('');

  // Fetch hangout details
  const { data: hangout, isLoading, error } = useQuery(
    ['hangout', id],
    () => hangoutsAPI.getHangout(id),
    {
      enabled: !!id
    }
  );

  // Fetch hangout statistics
  const { data: stats } = useQuery(
    ['hangoutStats', id],
    () => hangoutsAPI.getHangoutStats(id),
    {
      enabled: !!id && !!hangout
    }
  );

  // Fetch join requests (if user is organizer)
  const { data: joinRequests = [] } = useQuery(
    ['joinRequests', id],
    () => hangoutsAPI.getJoinRequests(id),
    {
      enabled: !!id && !!hangout && user?._id === hangout?.organizerId
    }
  );

  // Join hangout mutation
  const joinMutation = useMutation(hangoutsAPI.joinHangout, {
    onSuccess: () => {
      queryClient.invalidateQueries(['hangout', id]);
      queryClient.invalidateQueries(['hangoutStats', id]);
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
      queryClient.invalidateQueries(['hangoutStats', id]);
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

  // Approve join request mutation
  const approveRequestMutation = useMutation(
    ({ hangoutId, requestId }) => hangoutsAPI.approveJoinRequest(hangoutId, requestId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['joinRequests', id]);
        queryClient.invalidateQueries(['hangout', id]);
        queryClient.invalidateQueries(['hangoutStats', id]);
        toast.success('Join request approved!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to approve request');
      }
    }
  );

  // Reject join request mutation
  const rejectRequestMutation = useMutation(
    ({ hangoutId, requestId }) => hangoutsAPI.rejectJoinRequest(hangoutId, requestId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['joinRequests', id]);
        toast.success('Join request rejected');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to reject request');
      }
    }
  );

  // Send invitations mutation
  const sendInvitationsMutation = useMutation(
    ({ hangoutId, invitations }) => hangoutsAPI.sendInvitations(hangoutId, invitations),
    {
      onSuccess: () => {
        setShowInviteModal(false);
        setInviteEmail('');
        setInvitePhone('');
        toast.success('Invitations sent!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to send invitations');
      }
    }
  );

  const handleJoin = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (hangout.requireApproval) {
      setShowJoinRequestModal(true);
    } else {
      joinMutation.mutate(id);
    }
  };

  const handleLeave = () => {
    if (window.confirm('Are you sure you want to leave this hangout?')) {
      leaveMutation.mutate(id);
    }
  };

  const handleSendInvitation = () => {
    if (!inviteEmail.trim() && !invitePhone.trim()) {
      toast.error('Please enter an email or phone number');
      return;
    }

    const invitation = {
      email: inviteEmail.trim(),
      phone: invitePhone.trim(),
      name: inviteEmail.split('@')[0] || invitePhone
    };

    sendInvitationsMutation.mutate({
      hangoutId: id,
      invitations: [invitation]
    });
  };

  const handleJoinRequest = () => {
    requestJoinMutation.mutate({
      hangoutId: id,
      message: joinRequestMessage.trim()
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isUserParticipant = hangout?.participants?.some(p => 
    typeof p === 'string' ? p === user?._id : p._id === user?._id
  );
  const isUserOrganizer = hangout?.organizerId === user?._id;
  const canJoin = user && !isUserParticipant && !isUserOrganizer && 
    hangout?.participants?.length < hangout?.maxParticipants;

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hangout Not Found</h2>
          <p className="text-gray-600 mb-4">This hangout doesn't exist or you don't have access to it.</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8"
        >
          {/* Cover Image */}
          <div className="relative h-64 bg-gradient-to-br from-primary-500 to-accent-500">
            {hangout.image && (
              <img
                src={hangout.image}
                alt={hangout.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            {/* Privacy Badge */}
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${
                hangout.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {hangout.isPublic ? <Globe size={14} /> : <Lock size={14} />}
                <span>{hangout.isPublic ? 'Public' : 'Private'}</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                <Share2 size={20} />
              </button>
              <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                <Heart size={20} />
              </button>
              {isUserOrganizer && (
                <button 
                  onClick={() => navigate(`/hangouts/${id}/edit`)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                >
                  <Settings size={20} />
                </button>
              )}
            </div>

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-3xl font-bold text-white mb-2">{hangout.title}</h1>
              <div className="flex items-center space-x-4 text-white/90">
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>{formatDate(hangout.date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={16} />
                  <span>{formatTime(hangout.time)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users size={16} />
                  <span>{hangout.participants?.length || 0}/{hangout.maxParticipants}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
              <p className="text-gray-700 leading-relaxed">{hangout.description}</p>
            </div>

            {/* Tags */}
            {hangout.tags && hangout.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {hangout.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Join/Leave Button */}
            <div className="flex justify-center mb-6">
              {!user ? (
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                >
                  Login to Join
                </button>
              ) : isUserOrganizer ? (
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                  >
                    <UserPlus size={20} />
                    <span>Invite Friends</span>
                  </button>
                  <button
                    onClick={() => navigate(`/hangouts/${id}/edit`)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                  >
                    <Edit size={20} />
                    <span>Edit Hangout</span>
                  </button>
                </div>
              ) : isUserParticipant ? (
                <button
                  onClick={handleLeave}
                  disabled={leaveMutation.isLoading}
                  className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 font-medium transition-colors"
                >
                  <UserMinus size={20} />
                  <span>{leaveMutation.isLoading ? 'Leaving...' : 'Leave Hangout'}</span>
                </button>
              ) : canJoin ? (
                <button
                  onClick={handleJoin}
                  disabled={joinMutation.isLoading}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2 font-medium transition-colors"
                >
                  <UserPlus size={20} />
                  <span>{joinMutation.isLoading ? 'Joining...' : 'Join Hangout'}</span>
                </button>
              ) : hangout.participants?.length >= hangout.maxParticipants ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-2">This hangout is full</p>
                  <p className="text-sm text-gray-500">
                    {hangout.maxParticipants} / {hangout.maxParticipants} participants
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Locations */}
            {hangout.places && hangout.places.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <MapPin size={20} />
                  <span>Locations ({hangout.places.length})</span>
                </h2>
                <div className="space-y-4">
                  {hangout.places.map((place, index) => (
                    <div key={place._id || index} className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-900">{place.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {place.address?.street || place.address || 'Address not specified'}
                      </p>
                      {place.type && (
                        <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {place.type.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Participants */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Users size={20} />
                <span>Participants ({hangout.participants?.length || 0}/{hangout.maxParticipants})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hangout.participants?.map((participant) => (
                  <div key={participant._id || participant} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {participant.name || participant.email || 'Anonymous'}
                        {participant._id === hangout.organizerId && (
                          <span className="ml-2 text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                            Organizer
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        {participant.email || 'No email'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Join Requests (Organizer Only) */}
            {isUserOrganizer && joinRequests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Join Requests ({joinRequests.length})
                </h2>
                <div className="space-y-4">
                  {joinRequests.map((request) => (
                    <div key={request._id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {request.user?.name || request.user?.email || 'Anonymous User'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {request.user?.email}
                          </p>
                          {request.message && (
                            <p className="text-sm text-gray-700 mt-2 italic">
                              "{request.message}"
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Requested {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => approveRequestMutation.mutate({ 
                              hangoutId: id, 
                              requestId: request._id 
                            })}
                            disabled={approveRequestMutation.isLoading}
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => rejectRequestMutation.mutate({ 
                              hangoutId: id, 
                              requestId: request._id 
                            })}
                            disabled={rejectRequestMutation.isLoading}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hangout Stats */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Participants</span>
                    <span className="font-medium">{stats.totalParticipants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accepted Invites</span>
                    <span className="font-medium text-green-600">{stats.acceptedInvites}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Declined Invites</span>
                    <span className="font-medium text-red-600">{stats.declinedInvites}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tentative Responses</span>
                    <span className="font-medium text-yellow-600">{stats.tentativeInvites}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending Responses</span>
                    <span className="font-medium text-gray-600">{stats.pendingInvites}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Organizer Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer</h3>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User size={24} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {hangout.organizer?.name || 'Anonymous Organizer'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {hangout.organizer?.email}
                  </p>
                </div>
              </div>
              <button className="mt-4 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors">
                <MessageCircle size={16} />
                <span>Send Message</span>
              </button>
            </motion.div>

            {/* Quick Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatDate(hangout.date)}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{formatTime(hangout.time)}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <ClockIcon size={16} className="text-gray-400" />
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{hangout.duration} hours</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Users size={16} className="text-gray-400" />
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{hangout.category}</span>
                </div>
              </div>
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
                className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Friends</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="friend@example.com"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="tel"
                        value={invitePhone}
                        onChange={(e) => setInvitePhone(e.target.value)}
                        placeholder="+221 XX XXX XX XX"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendInvitation}
                    disabled={sendInvitationsMutation.isLoading || (!inviteEmail.trim() && !invitePhone.trim())}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sendInvitationsMutation.isLoading ? 'Sending...' : 'Send Invite'}
                  </button>
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
                  This hangout requires approval. Send a message to the organizer explaining why you'd like to join.
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