const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Don't include password by default in queries
  },
  role: {
    type: String,
    enum: ['user', 'advertiser', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500
  },
  location: {
    type: String,
    trim: true
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place'
  }],
  // Password reset fields
  resetToken: String,
  resetTokenExpires: Date,
  // Advertiser-specific fields
  advertiserInfo: {
    companyName: String,
    businessType: String,
    website: String,
    phone: String,
    address: String,
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationDate: Date,
    paymentHistory: [{
      paymentId: String,
      amount: Number,
      currency: String,
      status: String,
      paidAt: Date,
      failedAt: Date,
      description: String
    }],
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  // Admin-specific fields
  adminInfo: {
    permissions: [{
      type: String,
      enum: ['ad_approval', 'user_management', 'content_moderation', 'analytics']
    }],
    lastLogin: Date
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  ownedPlaces: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place'
  }],
  // Social features
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friendRequests: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  hangouts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hangout'
  }],
  preferences: {
    cuisinePreferences: [{
      type: String,
      trim: true
    }],
    dietaryRestrictions: [{
      type: String,
      trim: true
    }],
    priceRange: {
      type: String,
      enum: ['budget', 'moderate', 'expensive', 'any'],
      default: 'any'
    },
    notificationPreferences: {
      hangoutInvites: {
        type: Boolean,
        default: true
      },
      friendRequests: {
        type: Boolean,
        default: true
      },
      hangoutReminders: {
        type: Boolean,
        default: true
      }
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ 'friendRequests.from': 1, 'friendRequests.status': 1 });
userSchema.index({ friends: 1 });
userSchema.index({ status: 1 });
userSchema.index({ resetToken: 1, resetTokenExpires: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to send friend request
userSchema.methods.sendFriendRequest = async function(toUserId) {
  // Check if already friends
  if (this.friends.includes(toUserId)) {
    throw new Error('Already friends with this user');
  }

  // Check if request already exists
  const existingRequest = this.friendRequests.find(
    req => req.from.toString() === toUserId.toString() && req.status === 'pending'
  );
  if (existingRequest) {
    throw new Error('Friend request already exists');
  }

  this.friendRequests.push({
    from: toUserId,
    status: 'pending'
  });
  
  await this.save();
  return true;
};

// Method to accept friend request
userSchema.methods.acceptFriendRequest = async function(fromUserId) {
  const request = this.friendRequests.find(
    req => req.from.toString() === fromUserId.toString() && req.status === 'pending'
  );
  
  if (!request) {
    throw new Error('Friend request not found');
  }

  request.status = 'accepted';
  this.friends.push(fromUserId);
  
  await this.save();
  return true;
};

// Method to get mutual friends
userSchema.methods.getMutualFriends = async function(otherUserId) {
  const otherUser = await this.model('User').findById(otherUserId);
  if (!otherUser) throw new Error('User not found');
  
  return this.friends.filter(friendId => 
    otherUser.friends.includes(friendId)
  );
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ status: 'active' });
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role });
};

module.exports = mongoose.model('User', userSchema); 