const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Payment identification
  paymentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  provider: {
    type: String,
    required: true,
    enum: ['orangeMoney', 'wave'],
    index: true
  },
  
  // Payment details
  amount: {
    type: Number,
    required: true,
    min: 100 // Minimum amount in CFA
  },
  currency: {
    type: String,
    required: true,
    default: 'XOF',
    enum: ['XOF']
  },
  description: String,
  
  // Customer information
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Validate Senegal phone numbers
        return /^(77|76|78|70|75)\d{7}$/.test(v.replace(/\D/g, ''));
      },
      message: props => `${props.value} is not a valid Senegal phone number!`
    }
  },
  
  // Payment reference
  reference: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Status tracking
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'expired', 'cancelled'],
    default: 'pending',
    index: true
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'expired', 'cancelled']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  
  // Transaction details
  transactionId: {
    type: String,
    sparse: true,
    index: true
  },
  providerReference: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  completedAt: Date,
  
  // Related entities
  advertisement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Advertisement',
    required: true,
    index: true
  },
  advertiser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Payment verification
  verificationAttempts: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['success', 'failed']
    },
    response: mongoose.Schema.Types.Mixed
  }],
  
  // Error tracking
  failureReason: String,
  errorDetails: mongoose.Schema.Types.Mixed,
  
  // Provider-specific data
  providerData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ expiresAt: 1 });
paymentSchema.index({ provider: 1, status: 1 });
paymentSchema.index({ advertiser: 1, createdAt: -1 });

// Methods
paymentSchema.methods.updateStatus = async function(newStatus, reason = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Add to status history
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    reason
  });

  // Update timestamps
  if (newStatus === 'completed') {
    this.completedAt = new Date();
  }

  await this.save();
  return { oldStatus, newStatus };
};

paymentSchema.methods.addVerificationAttempt = async function(status, response) {
  this.verificationAttempts.push({
    status,
    response,
    timestamp: new Date()
  });
  await this.save();
};

paymentSchema.methods.markAsFailed = async function(reason, details = {}) {
  this.status = 'failed';
  this.failureReason = reason;
  this.errorDetails = details;
  this.statusHistory.push({
    status: 'failed',
    timestamp: new Date(),
    reason
  });
  await this.save();
};

// Statics
paymentSchema.statics.findByReference = function(reference) {
  return this.findOne({ reference });
};

paymentSchema.statics.findPendingPayments = function() {
  return this.find({
    status: 'pending',
    expiresAt: { $gt: new Date() }
  });
};

paymentSchema.statics.getPaymentStatistics = async function(advertiserId, startDate, endDate) {
  const match = {
    advertiser: mongoose.Types.ObjectId(advertiserId)
  };

  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$count' },
        totalAmount: { $sum: '$totalAmount' },
        byStatus: { $push: { status: '$_id', count: '$count', amount: '$totalAmount' } }
      }
    }
  ]);
};

// Middleware
paymentSchema.pre('save', function(next) {
  // Set expiry date if not set (30 minutes from creation)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema); 