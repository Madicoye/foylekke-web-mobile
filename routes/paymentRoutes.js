const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const simplePaymentService = require('../services/simplePaymentService');

// Create payment record for ad purchase
router.post('/create-payment-record', auth, async (req, res) => {
  try {
    const { adData } = req.body;
    
    if (!adData || !adData.budget || !adData.budget.amount) {
      return res.status(400).json({ message: 'Invalid ad data or budget' });
    }

    const paymentRecord = await simplePaymentService.createPaymentRecord(req.user._id, adData);
    const paymentInstructions = simplePaymentService.generatePaymentInstructions(
      adData.budget.amount,
      'XOF'
    );

    res.json({
      paymentRecord,
      paymentInstructions,
      message: 'Payment record created. Please follow the payment instructions.'
    });
  } catch (error) {
    console.error('Error creating payment record:', error);
    res.status(500).json({ message: 'Failed to create payment record' });
  }
});

// Get payment instructions
router.get('/payment-instructions/:amount', auth, async (req, res) => {
  try {
    const { amount } = req.params;
    const instructions = simplePaymentService.generatePaymentInstructions(
      parseFloat(amount),
      'XOF'
    );
    res.json(instructions);
  } catch (error) {
    console.error('Error getting payment instructions:', error);
    res.status(500).json({ message: 'Failed to get payment instructions' });
  }
});

// Confirm payment (admin only)
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { paymentId, adId } = req.body;
    
    if (!paymentId || !adId) {
      return res.status(400).json({ message: 'Payment ID and ad ID are required' });
    }

    const ad = await simplePaymentService.confirmPayment(paymentId, adId, req.user._id);
    res.json({ message: 'Payment confirmed successfully', ad });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
});

// Mark payment as failed (admin only)
router.post('/mark-payment-failed', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { paymentId, adId, reason } = req.body;
    
    if (!paymentId || !adId || !reason) {
      return res.status(400).json({ message: 'Payment ID, ad ID, and reason are required' });
    }

    const ad = await simplePaymentService.markPaymentFailed(paymentId, adId, reason);
    res.json({ message: 'Payment marked as failed', ad });
  } catch (error) {
    console.error('Error marking payment as failed:', error);
    res.status(500).json({ message: 'Failed to mark payment as failed' });
  }
});

// Get payment history for user
router.get('/history', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const history = await simplePaymentService.getPaymentHistory(req.user._id, start, end);
    res.json(history);
  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({ message: 'Failed to get payment history' });
  }
});

// Get payment analytics (admin only)
router.get('/admin/analytics', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { startDate, endDate } = req.query;
    
    const analytics = await simplePaymentService.getPaymentAnalytics(startDate, endDate);
    res.json(analytics);
  } catch (error) {
    console.error('Error getting payment analytics:', error);
    res.status(500).json({ message: 'Failed to get payment analytics' });
  }
});

module.exports = router; 