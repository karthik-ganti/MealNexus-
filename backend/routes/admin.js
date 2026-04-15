const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/Donation');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin)
router.get('/dashboard', auth, authorize('admin'), async (req, res) => {
  try {
    const stats = {
      users: {
        total: await User.countDocuments(),
        donors: await User.countDocuments({ role: 'donor' }),
        volunteers: await User.countDocuments({ role: 'volunteer' }),
        ngos: await User.countDocuments({ role: 'ngo' }),
        pendingVerification: await User.countDocuments({ 'verification.isVerified': false })
      },
      donations: {
        total: await Donation.countDocuments(),
        pending: await Donation.countDocuments({ status: 'pending' }),
        accepted: await Donation.countDocuments({ status: 'accepted' }),
        delivered: await Donation.countDocuments({ status: 'delivered' }),
        money: await Donation.aggregate([
          { $match: { type: 'money' } },
          { $group: { _id: null, total: { $sum: '$moneyDetails.amount' } } }
        ])
      }
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Verify user
// @access  Private (Admin)
router.put('/users/:id/verify', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        'verification.isVerified': true,
        'verification.verifiedBy': req.user.id,
        'verification.verifiedAt': new Date()
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/donations
// @desc    Get all donations
// @access  Private (Admin)
router.get('/donations', auth, authorize('admin'), async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('donor', 'name email')
      .populate('assignedNGO', 'name organization')
      .populate('assignedVolunteer', 'name')
      .sort({ createdAt: -1 });
    
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
