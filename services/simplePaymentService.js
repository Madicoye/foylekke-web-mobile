const User = require('../models/User');
const Advertisement = require('../models/Advertisement');

class SimplePaymentService {
  // Create a simple payment record for ad purchase
  async createPaymentRecord(userId, adData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const amount = adData.budget.amount;
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create payment record
      const paymentRecord = {
        paymentId,
        amount,
        currency: 'XOF',
        status: 'pending',
        createdAt: new Date(),
        adData: {
          title: adData.title,
          type: adData.type,
          placement: adData.placement,
          budgetType: adData.budget.type
        }
      };

      return paymentRecord;
    } catch (error) {
      console.error('Error creating payment record:', error);
      throw error;
    }
  }

  // Process manual payment confirmation
  async confirmPayment(paymentId, adId, adminUserId) {
    try {
      // Update ad with payment confirmation
      const ad = await Advertisement.findByIdAndUpdate(adId, {
        'payment.paymentId': paymentId,
        'payment.status': 'completed',
        'payment.paidAt': new Date(),
        'payment.confirmedBy': adminUserId,
        status: 'pending' // Set to pending for admin review
      }, { new: true });

      return ad;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  // Mark payment as failed
  async markPaymentFailed(paymentId, adId, reason) {
    try {
      const ad = await Advertisement.findByIdAndUpdate(adId, {
        'payment.paymentId': paymentId,
        'payment.status': 'failed',
        'payment.failureReason': reason,
        'payment.failedAt': new Date(),
        status: 'draft' // Set back to draft
      }, { new: true });

      return ad;
    } catch (error) {
      console.error('Error marking payment as failed:', error);
      throw error;
    }
  }

  // Get payment history for user
  async getPaymentHistory(userId, startDate, endDate) {
    try {
      const dateFilter = {
        advertiser: userId,
        createdAt: {
          $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          $lte: endDate || new Date()
        }
      };

      const ads = await Advertisement.find(dateFilter)
        .select('title type payment createdAt')
        .sort({ createdAt: -1 });

      const totalSpent = ads.reduce((sum, ad) => {
        return sum + (ad.payment?.amount || 0);
      }, 0);

      const completedPayments = ads.filter(ad => ad.payment?.status === 'completed');
      const pendingPayments = ads.filter(ad => ad.payment?.status === 'pending');
      const failedPayments = ads.filter(ad => ad.payment?.status === 'failed');

      return {
        totalSpent,
        totalTransactions: ads.length,
        completedPayments: completedPayments.length,
        pendingPayments: pendingPayments.length,
        failedPayments: failedPayments.length,
        paymentHistory: ads.map(ad => ({
          id: ad._id,
          title: ad.title,
          type: ad.type,
          amount: ad.payment?.amount || 0,
          currency: 'XOF',
          status: ad.payment?.status || 'pending',
          createdAt: ad.createdAt,
          paidAt: ad.payment?.paidAt,
          failedAt: ad.payment?.failedAt,
          failureReason: ad.payment?.failureReason
        }))
      };
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  }

  // Get payment analytics for admin
  async getPaymentAnalytics(startDate, endDate) {
    try {
      const dateFilter = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const ads = await Advertisement.find(dateFilter)
        .populate('advertiser', 'name email')
        .select('title type payment advertiser createdAt');

      const totalRevenue = ads.reduce((sum, ad) => {
        return sum + (ad.payment?.status === 'completed' ? ad.payment.amount : 0);
      }, 0);

      const pendingRevenue = ads.reduce((sum, ad) => {
        return sum + (ad.payment?.status === 'pending' ? ad.payment.amount : 0);
      }, 0);

      const completedPayments = ads.filter(ad => ad.payment?.status === 'completed');
      const pendingPayments = ads.filter(ad => ad.payment?.status === 'pending');
      const failedPayments = ads.filter(ad => ad.payment?.status === 'failed');

      // Get top advertisers by spending
      const advertiserSpending = {};
      ads.forEach(ad => {
        if (ad.payment?.status === 'completed' && ad.advertiser) {
          const advertiserId = ad.advertiser._id.toString();
          if (!advertiserSpending[advertiserId]) {
            advertiserSpending[advertiserId] = {
              advertiser: ad.advertiser,
              totalSpent: 0,
              adCount: 0
            };
          }
          advertiserSpending[advertiserId].totalSpent += ad.payment.amount;
          advertiserSpending[advertiserId].adCount += 1;
        }
      });

      const topAdvertisers = Object.values(advertiserSpending)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

      return {
        overview: {
          totalRevenue,
          pendingRevenue,
          completedPayments: completedPayments.length,
          pendingPayments: pendingPayments.length,
          failedPayments: failedPayments.length,
          totalTransactions: ads.length
        },
        topAdvertisers,
        recentPayments: ads
          .filter(ad => ad.payment?.status === 'completed')
          .sort((a, b) => new Date(b.payment.paidAt) - new Date(a.payment.paidAt))
          .slice(0, 10)
          .map(ad => ({
            id: ad._id,
            title: ad.title,
            advertiser: ad.advertiser?.name,
            amount: ad.payment.amount,
            paidAt: ad.payment.paidAt
          }))
      };
    } catch (error) {
      console.error('Error getting payment analytics:', error);
      throw error;
    }
  }

  // Generate payment instructions for manual payment
  generatePaymentInstructions(amount, currency = 'XOF') {
    return {
      amount,
      currency,
      instructions: [
        {
          method: 'Bank Transfer',
          details: {
            bankName: 'Banque Atlantique Sénégal',
            accountName: 'Foy Lekke SARL',
            accountNumber: '12345678901234567890',
            swiftCode: 'BATLSNDA',
            reference: 'Please include your user ID and ad title as reference'
          }
        },
        {
          method: 'Mobile Money',
          details: {
            provider: 'Orange Money',
            number: '+221 77 123 45 67',
            name: 'Foy Lekke',
            reference: 'Include your user ID and ad title'
          }
        },
        {
          method: 'Wave',
          details: {
            number: '+221 77 123 45 67',
            name: 'Foy Lekke',
            reference: 'Include your user ID and ad title'
          }
        }
      ],
      note: 'After payment, please send proof of payment to admin@foylekke.com for verification.'
    };
  }
}

module.exports = new SimplePaymentService(); 