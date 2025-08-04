import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  MapPinIcon, 
  UsersIcon, 
  HeartIcon,
  LockClosedIcon,
  UserIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import useTranslation from '../../hooks/useTranslation';
import { 
  getImageUrls, 
  hasValidImages, 
  getDefaultImageConfig, 
  createImageErrorHandler 
} from '../../utils/imageUtils';

const HangoutCard = ({ hangout, onFavorite, isFavorited = false }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Handle place images
  const imageUrls = getImageUrls(hangout.place);
  const hasImages = hasValidImages(hangout.place);
  const defaultImageConfig = getDefaultImageConfig('restaurant'); // Default fallback

  // Format date and time
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dateLabel;
    if (date.toDateString() === today.toDateString()) {
      dateLabel = t('hangouts.today');
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateLabel = t('hangouts.tomorrow');
    } else {
      dateLabel = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    const timeLabel = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
    
    return { dateLabel, timeLabel };
  };

  // Get status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get translated status text
  const getStatusText = (status) => {
    switch (status) {
      case 'planned': return t('hangouts.plannedStatus');
      case 'ongoing': return t('hangouts.ongoingStatus');
      case 'completed': return t('hangouts.completedStatus');
      case 'cancelled': return t('hangouts.cancelledStatus');
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Calculate participants info
  const acceptedParticipants = hangout.participants?.filter(p => p.status === 'accepted') || [];
  const totalParticipants = acceptedParticipants.length + 1; // +1 for creator
  const isCreator = user?._id === hangout.creator?._id;
  const isParticipant = hangout.participants?.some(p => p.user?._id === user?._id && p.status === 'accepted');
  
  const { dateLabel, timeLabel } = formatDateTime(hangout.dateTime);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(hangout._id);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 h-full flex flex-col"
    >
      <Link to={`/hangouts/${hangout._id}`} className="block h-full flex flex-col">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden flex-shrink-0">
          {hasImages && imageUrls.length > 0 ? (
            <img
              src={imageUrls[0]}
              alt={hangout.place?.name || hangout.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={createImageErrorHandler('restaurant')}
            />
          ) : null}
          
          {/* Default Image Placeholder */}
          <div 
            className={`fallback-image w-full h-full bg-gradient-to-br ${defaultImageConfig.gradient} flex items-center justify-center ${hasImages && imageUrls.length > 0 ? 'hidden' : 'flex'}`}
          >
            <span className="text-4xl">{defaultImageConfig.icon}</span>
          </div>

          {/* Overlay badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="flex flex-col space-y-1">
              {/* Status Badge */}
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(hangout.status)}`}>
                {getStatusText(hangout.status)}
              </span>
              
              {/* Private Badge */}
              {hangout.isPrivate && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-900/80 text-white flex items-center">
                  <LockClosedIcon className="h-3 w-3 mr-1" />
                  {t('hangouts.private')}
                </span>
              )}
            </div>

            {/* Favorite Button */}
            {user && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleFavoriteClick}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
              >
                {isFavorited ? (
                  <HeartSolidIcon className="h-4 w-4 text-red-500" />
                ) : (
                  <HeartIcon className="h-4 w-4 text-gray-600 hover:text-red-500" />
                )}
              </motion.button>
            )}
          </div>

          {/* Organizer Badge - Bottom Right */}
          {(isCreator || isParticipant) && (
            <div className="absolute bottom-3 right-3">
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full shadow-sm ${
                isCreator 
                  ? 'bg-primary-600/90 text-white backdrop-blur-sm' 
                  : 'bg-green-600/90 text-white backdrop-blur-sm'
              }`}>
                {isCreator ? t('hangouts.organizer') : t('hangouts.joined')}
              </span>
            </div>
          )}

          {/* Date overlay */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
              <div className="flex items-center space-x-2 text-sm">
                <CalendarDaysIcon className="h-4 w-4 text-primary-600" />
                <span className="font-medium text-gray-900">{dateLabel}</span>
                <ClockIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{timeLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {hangout.title}
          </h3>

          {/* Description */}
          <div className="mb-3 flex-shrink-0" style={{ minHeight: '2.5rem' }}>
            {hangout.description ? (
              <p className="text-gray-600 text-sm line-clamp-2">
                {hangout.description}
              </p>
            ) : (
              <p className="text-gray-400 text-sm italic">
                {t('hangouts.noDescriptionProvided')}
              </p>
            )}
          </div>

          {/* Place */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span className="truncate">
              {hangout.place?.name || t('hangouts.locationNotSpecified')}
            </span>
          </div>

          {/* Participants */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <UsersIcon className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-sm text-gray-600">
                {totalParticipants}
                {hangout.maxParticipants && ` / ${hangout.maxParticipants}`} {t('hangouts.people')}
              </span>
            </div>

            {/* Creator */}
            <div className="flex items-center">
              {hangout.creator?.profilePicture ? (
                <img
                  src={hangout.creator.profilePicture}
                  alt={hangout.creator.name}
                  className="h-6 w-6 rounded-full border border-gray-200"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <UserIcon className="h-3 w-3 text-gray-600" />
                </div>
              )}
              <span className="ml-2 text-xs text-gray-500">
                {isCreator ? t('hangouts.you') : hangout.creator?.name}
              </span>
            </div>
          </div>

          {/* Participants avatars */}
          <div className="flex items-center mb-4">
            {totalParticipants > 1 ? (
              <div className="flex -space-x-2">
                {/* Creator avatar */}
                {hangout.creator?.profilePicture ? (
                  <img
                    src={hangout.creator.profilePicture}
                    alt={hangout.creator.name}
                    className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-primary-100 border-2 border-white shadow-sm flex items-center justify-center">
                    <UserIcon className="h-3 w-3 text-primary-600" />
                  </div>
                )}
                
                {/* Participant avatars */}
                {acceptedParticipants.slice(0, 3).map((participant, idx) => (
                  participant.user?.profilePicture ? (
                    <img
                      key={idx}
                      src={participant.user.profilePicture}
                      alt={participant.user.name}
                      className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div key={idx} className="h-7 w-7 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center">
                      <UserIcon className="h-3 w-3 text-gray-400" />
                    </div>
                  )
                ))}
                
                {/* More participants indicator */}
                {acceptedParticipants.length > 3 && (
                  <div className="h-7 w-7 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center">
                    <span className="text-xs text-gray-600 font-medium">
                      +{acceptedParticipants.length - 3}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center text-gray-400 text-sm">
                <UserIcon className="h-4 w-4 mr-2" />
                <span className="italic">{t('hangouts.noParticipantsYet')}</span>
              </div>
            )}
          </div>

          {/* Spacer to push bottom content down */}
          <div className="flex-1"></div>

          {/* Tags */}
          <div className="mb-4" style={{ minHeight: '2rem' }}>
            {hangout.tags && hangout.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                <TagIcon className="h-3 w-3 text-gray-400 mt-1" />
                {hangout.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {hangout.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    +{hangout.tags.length - 3}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center text-gray-400 text-sm">
                <TagIcon className="h-3 w-3 mr-1" />
                <span className="italic text-xs">{t('hangouts.noTags')}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default HangoutCard; 