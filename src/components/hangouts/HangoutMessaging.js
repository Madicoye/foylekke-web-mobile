import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperAirplaneIcon,
  UserIcon,
  EllipsisVerticalIcon,
  PhotoIcon,
  FaceSmileIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { hangoutsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import useTranslation from '../../hooks/useTranslation';

const HangoutMessaging = ({ hangoutId, isVisible = true }) => {
  const { t, tc } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch hangout messages (simulated - in real app would use WebSocket)
  const { data: hangoutData } = useQuery(
    ['hangout', hangoutId],
    () => hangoutsAPI.getHangout(hangoutId),
    {
      enabled: !!hangoutId,
      refetchInterval: 10000, // Poll every 10 seconds for demo
    }
  );

  // Send message mutation
  const sendMessageMutation = useMutation(
    ({ hangoutId, content, type = 'text', attachments = [] }) => 
      hangoutsAPI.addMessage(hangoutId, content),
    {
      onSuccess: (newMessage) => {
        setMessage('');
        setMessages(prev => [...prev, {
          _id: Date.now().toString(),
          content: message,
          user: user,
          createdAt: new Date().toISOString(),
          type: 'text'
        }]);
        scrollToBottom();
        toast.success(t('hangouts.chat.messageSent'));
      },
      onError: (error) => {
        toast.error(t('hangouts.chat.failedToSend'));
      }
    }
  );

  // Demo messages for display
  useEffect(() => {
    if (hangoutData && messages.length === 0) {
      setMessages([
        {
          _id: '1',
          content: 'Hey everyone! Looking forward to this hangout 🎉',
          user: { 
            _id: 'user1', 
            name: 'Sarah Johnson', 
            profilePicture: null 
          },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          type: 'text'
        },
        {
          _id: '2',
          content: 'Should we meet at the main entrance?',
          user: { 
            _id: 'user2', 
            name: 'Mike Chen', 
            profilePicture: null 
          },
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          type: 'text'
        },
        {
          _id: '3',
          content: 'Perfect! See you all there at 2 PM',
          user: hangoutData.creator,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          type: 'text'
        }
      ]);
    }
  }, [hangoutData, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      hangoutId,
      content: message.trim()
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload the file and send as attachment
      toast.info(t('hangouts.chat.fileUploadNotImplemented'));
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const isOwnMessage = (messageUser) => {
    return messageUser._id === user?._id;
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col"
      style={{ height: isExpanded ? '600px' : '400px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <h3 className="font-semibold text-gray-900">{t('hangouts.chat.title')}</h3>
          </div>
          <span className="text-sm text-gray-500">
            {messages.length} {tc(messages.length, 'hangouts.chat.messages', 'hangouts.chat.messages_plural')}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title={isExpanded ? t('hangouts.chat.minimize') : t('hangouts.chat.expand')}
          >
            {isExpanded ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, index) => {
            const isOwn = isOwnMessage(msg.user);
            const showAvatar = index === 0 || messages[index - 1].user._id !== msg.user._id;
            
            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}
              >
                <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                  {/* Avatar */}
                  {!isOwn && showAvatar && (
                    <div className="flex-shrink-0 mb-1">
                      {msg.user.profilePicture ? (
                        <img
                          src={msg.user.profilePicture}
                          alt={msg.user.name}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  )}
                  {!isOwn && !showAvatar && <div className="w-8"></div>}

                  {/* Message Bubble */}
                  <div className={`relative px-4 py-2 rounded-2xl ${
                    isOwn 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {/* Sender name (only for others' messages and first in sequence) */}
                    {!isOwn && showAvatar && (
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        {msg.user.name}
                      </p>
                    )}
                    
                    {/* Message content */}
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    
                    {/* Timestamp */}
                    <p className={`text-xs mt-1 ${
                      isOwn ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2 text-gray-500"
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm">{t('hangouts.chat.typing')}</span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          {/* File Upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            title={t('hangouts.chat.attachFile')}
          >
            <PhotoIcon className="h-5 w-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
          />

          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('hangouts.chat.inputPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              maxLength={500}
            />
            
            {/* Emoji button */}
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded"
              title={t('hangouts.chat.addEmoji')}
              onClick={() => toast.info(t('hangouts.chat.emojiPickerNotImplemented'))}
            >
              <FaceSmileIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isLoading}
            className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={t('hangouts.chat.sendMessage')}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </motion.button>
        </div>
        
        {/* Character count */}
        <div className="mt-2 text-right">
          <span className="text-xs text-gray-500">
            {message.length}/500 {t('hangouts.chat.charactersCount')}
          </span>
        </div>
      </form>
    </motion.div>
  );
};

export default HangoutMessaging; 