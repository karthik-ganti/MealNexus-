const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const { auth } = require('../middleware/auth');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret'
});

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify payment and create donation record
// @access  Private
router.post('/verify', auth, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      amount,
      campaignId,
      isRecurring 
    } = req.body;

    // Create money donation record
    const donation = new Donation({
      donor: req.user.id,
      type: 'money',
      moneyDetails: {
        amount,
        currency: 'INR',
        paymentMethod: 'razorpay',
        transactionId: razorpay_payment_id,
        isRecurring: isRecurring || false,
        campaign: campaignId || null
      },
      status: 'delivered' // Money donations are instant
    });

    await donation.save();

    // Update campaign if applicable
    if (campaignId) {
      await Campaign.findByIdAndUpdate(campaignId, {
        $inc: { 'progress.current': amount },
        $addToSet: { 'progress.donors': req.user.id },
        $set: { 'progress.lastUpdated': new Date() }
      });
    }

    res.json({ 
      success: true, 
      message: 'Payment verified and donation recorded',
      donation 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
});

// @route   GET /api/payments/history
// @desc    Get user's payment history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const donations = await Donation.find({
      donor: req.user.id,
      type: 'money'
    }).sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payments/tax-receipt/:donationId
// @desc    Generate tax receipt
// @access  Private
router.get('/tax-receipt/:donationId', auth, async (req, res) => {
  try {
    const donation = await Donation.findOne({
      _id: req.params.donationId,
      donor: req.user.id,
      type: 'money'
    });

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Generate receipt data
    const receiptData = {
      receiptNumber: `80G-${donation._id.toString().slice(-8)}`,
      donorName: req.user.name,
      amount: donation.moneyDetails.amount,
      date: donation.createdAt,
      transactionId: donation.moneyDetails.transactionId,
      purpose: 'Charitable Donation'
    };

    res.json(receiptData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
