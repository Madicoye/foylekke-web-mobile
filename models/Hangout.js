const mongoose = require('mongoose');

const hangoutSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['planned', 'ongoing', 'completed', 'cancelled'],
    default: 'planned'
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    responseDate: {
      type: Date,
      default: Date.now
    }
  }],
  maxParticipants: {
    type: Number,
    default: null // null means unlimited
  },
  description: {
    type: String,
    trim: true
  },
  specialRequests: {
    type: String,
    trim: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  reminders: [{
    type: Date
  }],
  chatEnabled: {
    type: Boolean,
    default: true
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
hangoutSchema.index({ creator: 1, dateTime: 1 });
hangoutSchema.index({ place: 1 });
hangoutSchema.index({ 'participants.user': 1 });
hangoutSchema.index({ dateTime: 1, status: 1 });

// Virtual field for checking if hangout is full
hangoutSchema.virtual('isFull').get(function() {
  if (!this.maxParticipants) return false;
  const acceptedParticipants = this.participants.filter(p => p.status === 'accepted').length;
  return acceptedParticipants >= this.maxParticipants;
});

// Method to check if user can join
hangoutSchema.methods.canUserJoin = function(userId) {
  if (this.status !== 'planned') return false;
  if (this.isFull) return false;
  const isAlreadyParticipant = this.participants.some(p => p.user.toString() === userId.toString());
  return !isAlreadyParticipant;
};

// Method to add participant
hangoutSchema.methods.addParticipant = function(userId) {
  if (!this.canUserJoin(userId)) return false;
  this.participants.push({ user: userId });
  return true;
};

const Hangout = mongoose.model('Hangout', hangoutSchema);

module.exports = Hangout; 