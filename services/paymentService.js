const crypto = require('crypto');
const Payment = require('../models/Payment');
const Advertisement = require('../models/Advertisement');

class PaymentService {
  constructor() {
    // Configuration for payment providers
    this.providers = {
      orangeMoney: {
        name: 'Orange Money',
        icon: '🟠',
        apiUrl: process.env.ORANGE_MONEY_API_URL,
        merchantId: process.env.ORANGE_MONEY_MERCHANT_ID,
        apiKey: process.env.ORANGE_MONEY_API_KEY,
        secretKey: process.env.ORANGE_MONEY_SECRET_KEY,
        currency: 'XOF',
        supportedAmounts: {
          min: 100,
          max: 500000
        }
      },
      wave: {
        name: 'Wave',
        icon: '🌊',
        apiUrl: process.env.WAVE_API_URL,
        merchantId: process.env.WAVE_MERCHANT_ID,
        apiKey: process.env.WAVE_API_KEY,
        secretKey: process.env.WAVE_SECRET_KEY,
        currency: 'XOF',
        supportedAmounts: {
          min: 100,
          max: 1000000
        }
      }
    };
  }

  // Generate unique payment reference
  generatePaymentReference(provider, amount, adId) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `${provider.toUpperCase()}_${adId}_${timestamp}_${random}`;
  }

  // Create Orange Money payment
  async createOrangeMoneyPayment(paymentData) {
    const { amount, phoneNumber, adId, description, userId } = paymentData;
    const provider = this.providers.orangeMoney;

    try {
      // Validate amount
      if (amount < provider.supportedAmounts.min || amount > provider.supportedAmounts.max) {
        throw new Error(`Amount must be between ${provider.supportedAmounts.min} and ${provider.supportedAmounts.max} XOF`);
      }

      // Validate phone number
      if (!this.validateOrangeMoneyPhone(phoneNumber)) {
        throw new Error('Invalid Orange Money phone number');
      }

      // Check if advertisement exists
      const advertisement = await Advertisement.findById(adId);
      if (!advertisement) {
        throw new Error('Advertisement not found');
      }

      // Generate payment reference
      const reference = this.generatePaymentReference('orange', amount, adId);
      const timestamp = new Date();

      // Create payment record
      const payment = new Payment({
        paymentId: reference,
        provider: 'orangeMoney',
        amount,
        currency: provider.currency,
        phoneNumber,
        reference,
        status: 'pending',
        advertisement: adId,
        advertiser: userId,
        description: description || `Payment for advertisement ${adId}`,
        createdAt: timestamp,
        expiresAt: new Date(timestamp.getTime() + 30 * 60 * 1000), // 30 minutes expiry
        providerData: {
          merchantId: provider.merchantId,
          callbackUrl: `${process.env.BASE_URL}/api/payments/orange-money/callback`,
          returnUrl: `${process.env.FRONTEND_URL}/payment/success?reference=${reference}`
        }
      });

      // Generate signature
      const signature = this.generateOrangeMoneySignature({
        merchantId: provider.merchantId,
        amount,
        currency: provider.currency,
        reference,
        phoneNumber,
        timestamp: timestamp.toISOString()
      }, provider.secretKey);

      payment.providerData.signature = signature;

      // Save payment record
      await payment.save();

      // Return payment instructions
      return {
        payment,
        instructions: this.getOrangeMoneyInstructions(phoneNumber, amount, reference)
      };
    } catch (error) {
      throw new Error(`Orange Money payment creation failed: ${error.message}`);
    }
  }

  // Create Wave payment
  async createWavePayment(paymentData) {
    const { amount, phoneNumber, adId, description, userId } = paymentData;
    const provider = this.providers.wave;

    try {
      // Validate amount
      if (amount < provider.supportedAmounts.min || amount > provider.supportedAmounts.max) {
        throw new Error(`Amount must be between ${provider.supportedAmounts.min} and ${provider.supportedAmounts.max} XOF`);
      }

      // Validate phone number
      if (!this.validateWavePhone(phoneNumber)) {
        throw new Error('Invalid Wave phone number');
      }

      // Check if advertisement exists
      const advertisement = await Advertisement.findById(adId);
      if (!advertisement) {
        throw new Error('Advertisement not found');
      }

      // Generate payment reference
      const reference = this.generatePaymentReference('wave', amount, adId);
      const timestamp = new Date();

      // Create payment record
      const payment = new Payment({
        paymentId: reference,
        provider: 'wave',
        amount,
        currency: provider.currency,
        phoneNumber,
        reference,
        status: 'pending',
        advertisement: adId,
        advertiser: userId,
        description: description || `Payment for advertisement ${adId}`,
        createdAt: timestamp,
        expiresAt: new Date(timestamp.getTime() + 30 * 60 * 1000), // 30 minutes expiry
        providerData: {
          merchantId: provider.merchantId,
          callbackUrl: `${process.env.BASE_URL}/api/payments/wave/callback`,
          returnUrl: `${process.env.FRONTEND_URL}/payment/success?reference=${reference}`
        }
      });

      // Generate signature
      const signature = this.generateWaveSignature({
        merchantId: provider.merchantId,
        amount,
        currency: provider.currency,
        reference,
        timestamp: timestamp.toISOString()
      }, provider.secretKey);

      payment.providerData.signature = signature;

      // Save payment record
      await payment.save();

      // Return payment instructions
      return {
        payment,
        instructions: this.getWaveInstructions(phoneNumber, amount, reference)
      };
    } catch (error) {
      throw new Error(`Wave payment creation failed: ${error.message}`);
    }
  }

  // Verify payment status
  async verifyPayment(paymentId, provider) {
    try {
      const payment = await Payment.findOne({ paymentId });
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Add verification attempt
      await payment.addVerificationAttempt('pending', {
        timestamp: new Date(),
        provider
      });

      // In a real implementation, make API call to provider
      // For now, simulate verification
      const verificationResult = await this.simulatePaymentVerification(payment);

      // Update payment status based on verification result
      if (verificationResult.status === 'completed') {
        await payment.updateStatus('completed', 'Payment verified successfully');
        
        // Update advertisement status
        const advertisement = await Advertisement.findById(payment.advertisement);
        if (advertisement) {
          advertisement.status = 'active';
          advertisement.activatedAt = new Date();
          await advertisement.save();
        }
      } else if (verificationResult.status === 'failed') {
        await payment.markAsFailed(verificationResult.reason);
      }

      return verificationResult;
    } catch (error) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  // Process callback from Orange Money
  async processOrangeMoneyCallback(callbackData) {
    try {
      const { paymentId, status, transactionId, signature } = callbackData;

      // Verify signature
      if (!this.verifyOrangeMoneySignature(callbackData, signature)) {
        throw new Error('Invalid signature');
      }

      const payment = await Payment.findOne({ paymentId });
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Update payment status
      await payment.updateStatus(status, 'Status updated from callback');
      payment.transactionId = transactionId;
      await payment.save();

      // If payment is completed, update advertisement
      if (status === 'completed') {
        const advertisement = await Advertisement.findById(payment.advertisement);
        if (advertisement) {
          advertisement.status = 'active';
          advertisement.activatedAt = new Date();
          await advertisement.save();
        }
      }

      return payment;
    } catch (error) {
      throw new Error(`Orange Money callback processing failed: ${error.message}`);
    }
  }

  // Process callback from Wave
  async processWaveCallback(callbackData) {
    try {
      const { paymentId, status, transactionId, signature } = callbackData;

      // Verify signature
      if (!this.verifyWaveSignature(callbackData, signature)) {
        throw new Error('Invalid signature');
      }

      const payment = await Payment.findOne({ paymentId });
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Update payment status
      await payment.updateStatus(status, 'Status updated from callback');
      payment.transactionId = transactionId;
      await payment.save();

      // If payment is completed, update advertisement
      if (status === 'completed') {
        const advertisement = await Advertisement.findById(payment.advertisement);
        if (advertisement) {
          advertisement.status = 'active';
          advertisement.activatedAt = new Date();
          await advertisement.save();
        }
      }

      return payment;
    } catch (error) {
      throw new Error(`Wave callback processing failed: ${error.message}`);
    }
  }

  // Validate Orange Money phone number
  validateOrangeMoneyPhone(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    return /^(77|76|78)\d{7}$/.test(cleanNumber);
  }

  // Validate Wave phone number
  validateWavePhone(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    return /^(77|76|78|70|75)\d{7}$/.test(cleanNumber);
  }

  // Generate Orange Money signature
  generateOrangeMoneySignature(payload, secretKey) {
    const data = `${payload.merchantId}${payload.amount}${payload.currency}${payload.reference}${payload.phoneNumber}${payload.timestamp}`;
    return crypto.createHmac('sha256', secretKey).update(data).digest('hex');
  }

  // Generate Wave signature
  generateWaveSignature(payload, secretKey) {
    const data = `${payload.merchantId}${payload.amount}${payload.currency}${payload.reference}${payload.timestamp}`;
    return crypto.createHmac('sha256', secretKey).update(data).digest('hex');
  }

  // Verify Orange Money signature
  verifyOrangeMoneySignature(payload, signature) {
    const expectedSignature = this.generateOrangeMoneySignature(payload, this.providers.orangeMoney.secretKey);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }

  // Verify Wave signature
  verifyWaveSignature(payload, signature) {
    const expectedSignature = this.generateWaveSignature(payload, this.providers.wave.secretKey);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }

  // Get Orange Money payment instructions
  getOrangeMoneyInstructions(phoneNumber, amount, reference) {
    return {
      steps: [
        {
          step: 1,
          title: 'Dial Orange Money USSD',
          description: 'Dial *144# on your Orange Money phone',
          icon: '📱'
        },
        {
          step: 2,
          title: 'Select Payment',
          description: 'Choose "Payer" or "Payment" from the menu',
          icon: '💳'
        },
        {
          step: 3,
          title: 'Enter Amount',
          description: `Enter the amount: ${amount.toLocaleString()} XOF`,
          icon: '💰'
        },
        {
          step: 4,
          title: 'Enter Reference',
          description: `Enter reference: ${reference}`,
          icon: '📝'
        },
        {
          step: 5,
          title: 'Confirm Payment',
          description: 'Enter your PIN to confirm the payment',
          icon: '✅'
        }
      ],
      additionalInfo: [
        'Make sure you have sufficient balance in your Orange Money account',
        'Keep the transaction reference for verification',
        'Payment will be processed within 24 hours',
        'Contact Orange Money support at 144 if you encounter issues'
      ]
    };
  }

  // Get Wave payment instructions
  getWaveInstructions(phoneNumber, amount, reference) {
    return {
      steps: [
        {
          step: 1,
          title: 'Open Wave App',
          description: 'Open the Wave mobile application on your phone',
          icon: '📱'
        },
        {
          step: 2,
          title: 'Select Send Money',
          description: 'Tap on "Send Money" or "Envoyer de l\'argent"',
          icon: '💳'
        },
        {
          step: 3,
          title: 'Enter Amount',
          description: `Enter the amount: ${amount.toLocaleString()} XOF`,
          icon: '💰'
        },
        {
          step: 4,
          title: 'Enter Reference',
          description: `Add note/reference: ${reference}`,
          icon: '📝'
        },
        {
          step: 5,
          title: 'Confirm Payment',
          description: 'Confirm the payment with your PIN or biometric',
          icon: '✅'
        }
      ],
      additionalInfo: [
        'Ensure you have sufficient balance in your Wave account',
        'Keep the transaction reference for verification',
        'Payment will be processed within 24 hours',
        'Contact Wave support at 800-00-9293 if you encounter issues'
      ]
    };
  }

  // Simulate payment verification (for development)
  async simulatePaymentVerification(payment) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate 70% success rate
    const isSuccessful = Math.random() > 0.3;

    return {
      paymentId: payment.paymentId,
      provider: payment.provider,
      status: isSuccessful ? 'completed' : 'failed',
      verifiedAt: new Date().toISOString(),
      transactionId: isSuccessful ? `TXN_${Date.now()}` : null,
      reason: isSuccessful ? null : 'Payment not found or insufficient funds'
    };
  }

  // Get payment statistics
  async getPaymentStatistics(userId, startDate, endDate) {
    return Payment.getPaymentStatistics(userId, startDate, endDate);
  }

  // Get available payment providers
  getAvailableProviders() {
    return Object.entries(this.providers).map(([key, provider]) => ({
      id: key,
      name: provider.name,
      icon: provider.icon,
      currency: provider.currency,
      minAmount: provider.supportedAmounts.min,
      maxAmount: provider.supportedAmounts.max,
      isAvailable: true // In real implementation, check API availability
    }));
  }
}

module.exports = new PaymentService(); 