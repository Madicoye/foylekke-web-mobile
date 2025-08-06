import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  X,
  Search,
  Globe,
  Lock,
  CheckCircle,
  Mail,
  Phone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { hangoutsAPI, placesAPI } from '../services/api';
import PlaceCard from '../components/places/PlaceCard';
import { toast } from 'react-hot-toast';
import useTranslation from '../hooks/useTranslation';

const CreateHangoutPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedPlace = location.state?.preSelectedPlace;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 2,
    maxParticipants: 8,
    isPublic: true,
    requireApproval: false,
    category: 'Social',
    tags: [],
    places: preSelectedPlace ? [preSelectedPlace] : [],
    invitations: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [placeSearchTerm, setPlaceSearchTerm] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Search places for selection
  const { data: searchedPlaces = [], isLoading: isSearchingPlaces } = useQuery(
    ['searchPlaces', placeSearchTerm],
    () => placesAPI.getPlaces({ search: placeSearchTerm, limit: 10 }),
    {
      enabled: placeSearchTerm.length > 2,
      keepPreviousData: true
    }
  );

  const categories = [
    { key: 'foodDining', label: t('createHangout.categories.foodDining') },
    { key: 'social', label: t('createHangout.categories.social') },
    { key: 'outdoor', label: t('createHangout.categories.outdoor') },
    { key: 'cultural', label: t('createHangout.categories.cultural') },
    { key: 'sports', label: t('createHangout.categories.sports') },
    { key: 'entertainment', label: t('createHangout.categories.entertainment') },
    { key: 'business', label: t('createHangout.categories.business') },
    { key: 'education', label: t('createHangout.categories.education') }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addPlace = (place) => {
    if (!formData.places.find(p => p._id === place._id)) {
      setFormData(prev => ({
        ...prev,
        places: [...prev.places, place]
      }));
      setPlaceSearchTerm('');
    }
  };

  const addManualLocation = () => {
    if (manualAddress.trim()) {
      const manualPlace = {
        _id: `manual_${Date.now()}`,
        name: 'Custom Location',
        address: { street: manualAddress },
        isManual: true
      };
      setFormData(prev => ({
        ...prev,
        places: [...prev.places, manualPlace]
      }));
      setManualAddress('');
      setShowManualLocation(false);
    }
  };

  const removePlace = (placeId) => {
    setFormData(prev => ({
      ...prev,
      places: prev.places.filter(p => p._id !== placeId)
    }));
  };

  const addInvitation = () => {
    if (inviteEmail.trim() || invitePhone.trim()) {
      const invitation = {
        id: Date.now(),
        email: inviteEmail.trim(),
        phone: invitePhone.trim(),
        name: inviteEmail.split('@')[0] || invitePhone
      };
      setFormData(prev => ({
        ...prev,
        invitations: [...prev.invitations, invitation]
      }));
      setInviteEmail('');
      setInvitePhone('');
    }
  };

  const removeInvitation = (invitationId) => {
    setFormData(prev => ({
      ...prev,
      invitations: prev.invitations.filter(inv => inv.id !== invitationId)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.places.length === 0) {
      toast.error('Please add at least one location');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare hangout data according to backend specification
      const selectedPlace = formData.places[0]; // Use first place
      const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
      
      const hangoutData = {
        title: formData.title,
        description: formData.description,
        dateTime: dateTime,
        maxParticipants: formData.maxParticipants,
        isPrivate: !formData.isPublic,
        tags: formData.tags,
        specialRequests: '', // Add if needed
      };

      // Add place or manual address
      if (selectedPlace.isManual) {
        hangoutData.manualAddress = {
          street: selectedPlace.address.street || selectedPlace.address,
          city: 'Dakar', // Default or from form
          region: 'Dakar', // Default or from form  
          country: 'Senegal'
        };
      } else {
        hangoutData.placeId = selectedPlace._id;
      }

      // Add user IDs for invitations if any
      if (formData.invitations.length > 0) {
        hangoutData.inviteUserIds = formData.invitations.map(inv => inv.userId || inv.id);
      }

      const response = await hangoutsAPI.createHangout(hangoutData);

      toast.success('Hangout created successfully!');
      navigate(`/hangouts/${response._id}`);
    } catch (error) {
      console.error('Error creating hangout:', error);
      toast.error('Failed to create hangout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const stepValidation = (step) => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.category;
      case 2:
        return formData.date && formData.time && formData.duration;
      case 3:
        return formData.places.length > 0;
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step === currentStep 
              ? 'bg-primary-600 text-white' 
              : step < currentStep
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600'
          }`}>
            {step < currentStep ? <CheckCircle size={16} /> : step}
          </div>
          {step < 4 && (
            <div className={`w-12 h-1 mx-2 ${
              step < currentStep ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Hangout
            </h1>
            <p className="text-gray-600">
              Organize an amazing experience and invite your friends
            </p>
          </div>

          <StepIndicator />

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('createHangout.basicInformation')}
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('createHangout.hangoutTitle')}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder={t('createHangout.hangoutTitlePlaceholder')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('createHangout.description')}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={t('createHangout.descriptionPlaceholder')}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    maxLength={500}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.description.length}/500 {t('createHangout.charactersCount')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('createHangout.category')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {categories.map(category => (
                      <option key={category.key} value={category.label}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('createHangout.tags')}
                  </label>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder={t('createHangout.tagsPlaceholder')}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      {t('createHangout.add')}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Date & Time */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('createHangout.whenHowLong')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('createHangout.date')}
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('createHangout.time')}
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('createHangout.durationHours')}
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {[0.5, 1, 1.5, 2, 3, 4, 5, 6, 8].map(duration => (
                      <option key={duration} value={duration}>
                        {duration} {duration === 1 ? t('createHangout.hour') : t('createHangout.hours')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('createHangout.maximumParticipants')}
                  </label>
                  <select
                    value={formData.maxParticipants}
                    onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {[2, 4, 6, 8, 10, 15, 20, 25, 30].map(count => (
                      <option key={count} value={count}>
                        {count} people
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {/* Step 3: Location Selection */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('createHangout.chooseLocations')}
                </h2>

                {/* Selected Places */}
                {formData.places.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {t('createHangout.selectedLocations')} ({formData.places.length})
                    </h3>
                    <div className="space-y-3">
                      {formData.places.map(place => (
                        <div key={place._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{place.name}</h4>
                            <p className="text-sm text-gray-600">
                              {place.address?.street || place.address}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePlace(place._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Places */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('createHangout.searchPlaces')}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={placeSearchTerm}
                      onChange={(e) => setPlaceSearchTerm(e.target.value)}
                      placeholder={t('createHangout.searchPlaces')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* Search Results */}
                  {placeSearchTerm.length > 2 && (
                    <div className="mt-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                      {isSearchingPlaces ? (
                        <div className="p-4 text-center text-gray-500">Searching...</div>
                      ) : searchedPlaces.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {searchedPlaces.map(place => (
                            <div
                              key={place._id}
                              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => addPlace(place)}
                            >
                              <h4 className="font-medium text-gray-900">{place.name}</h4>
                              <p className="text-sm text-gray-600">
                                {place.address?.street || 'No address available'}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  {place.type?.replace('_', ' ') || 'Place'}
                                </span>
                                {place.cuisine && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                                    {place.cuisine[0]}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500">No places found</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Manual Location */}
                <div className="border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowManualLocation(!showManualLocation)}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Plus size={16} />
                    <span>Add Custom Location</span>
                  </button>

                  {showManualLocation && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Address
                      </label>
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={manualAddress}
                          onChange={(e) => setManualAddress(e.target.value)}
                          placeholder="Enter full address..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button
                          type="button"
                          onClick={addManualLocation}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          {t('createHangout.add')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Privacy & Invitations */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Privacy & Invitations
                </h2>

                {/* Privacy Settings */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="privacy"
                        checked={formData.isPublic}
                        onChange={() => handleInputChange('isPublic', true)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex items-center space-x-2">
                        <Globe size={16} className="text-gray-500" />
                        <div>
                          <div className="font-medium text-gray-900">Public</div>
                          <div className="text-sm text-gray-600">Anyone can see and request to join</div>
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="privacy"
                        checked={!formData.isPublic}
                        onChange={() => handleInputChange('isPublic', false)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex items-center space-x-2">
                        <Lock size={16} className="text-gray-500" />
                        <div>
                          <div className="font-medium text-gray-900">Private</div>
                          <div className="text-sm text-gray-600">Only invited people can join</div>
                        </div>
                      </div>
                    </label>
                  </div>

                  {formData.isPublic && (
                    <div className="mt-4">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.requireApproval}
                          onChange={(e) => handleInputChange('requireApproval', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{t('createHangout.requireApproval')}</div>
                          <div className="text-sm text-gray-600">{t('createHangout.requireApprovalDescription')}</div>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Invitations */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t('createHangout.inviteFriends')}</h3>
                  
                  {/* Current Invitations */}
                  {formData.invitations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {t('createHangout.invitationsList')} ({formData.invitations.length})
                      </h4>
                      <div className="space-y-2">
                        {formData.invitations.map(invitation => (
                          <div key={invitation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">{invitation.name}</div>
                              <div className="text-sm text-gray-600">
                                {invitation.email && <span>{invitation.email}</span>}
                                {invitation.phone && <span>{invitation.phone}</span>}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeInvitation(invitation.id)}
                              className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* {t('createHangout.add')} Invitations */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('createHangout.inviteByEmail')}
                      </label>
                      <div className="flex space-x-3">
                        <div className="flex-1 relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder={t('createHangout.emailPlaceholder')}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={addInvitation}
                          disabled={!inviteEmail.trim()}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {t('createHangout.add')}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('createHangout.inviteByPhone')}
                      </label>
                      <div className="flex space-x-3">
                        <div className="flex-1 relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="tel"
                            value={invitePhone}
                            onChange={(e) => setInvitePhone(e.target.value)}
                            placeholder={t('createHangout.phonePlaceholder')}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={addInvitation}
                          disabled={!invitePhone.trim()}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {t('createHangout.add')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('createHangout.previous')}
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!stepValidation(currentStep)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('createHangout.next')}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !stepValidation(3)}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? t('createHangout.creating') : t('createHangout.createHangoutButton')}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateHangoutPage; 