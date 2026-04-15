const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const { auth, authorize } = require('../middleware/auth');

// Calculate priority based on expiry time
const calculatePriority = (expiryTime) => {
  const now = new Date();
  const expiry = new Date(expiryTime);
  const hoursUntilExpiry = (expiry - now) / (1000 * 60 * 60);
  
  if (hoursUntilExpiry <= 2) return 'urgent';
  if (hoursUntilExpiry <= 4) return 'high';
  if (hoursUntilExpiry <= 8) return 'medium';
  return 'low';
};

// @route   POST /api/donations
// @desc    Create new donation
// @access  Private (Donor)
router.post('/', auth, authorize('donor'), async (req, res) => {
  try {
    const donationData = {
      donor: req.user.id,
      ...req.body
    };

    // Auto-calculate priority for food donations
    if (req.body.type === 'food' && req.body.foodDetails?.expiryTime) {
      donationData.priority = calculatePriority(req.body.foodDetails.expiryTime);
    }

    const donation = new Donation(donationData);
    await donation.save();

    // Update donor stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.totalDonations': 1 }
    });

    res.status(201).json(donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/donations
// @desc    Get all donations (with filters)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, type, priority, myDonations } = req.query;
    let query = {};

    // Filter by user's role
    if (req.user.role === 'donor' || myDonations === 'true') {
      query.donor = req.user.id;
    } else if (req.user.role === 'ngo') {
      query.$or = [
        { status: 'pending' },
        { assignedNGO: req.user.id }
      ];
    } else if (req.user.role === 'volunteer') {
      query.$or = [
        { status: 'accepted' },
        { assignedVolunteer: req.user.id }
      ];
    }

    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const donations = await Donation.find(query)
      .populate('donor', 'name phone organization')
      .populate('assignedNGO', 'name organization')
      .populate('assignedVolunteer', 'name phone')
      .sort({ priority: 1, createdAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/donations/:id/accept
// @desc    Accept donation (NGO)
// @access  Private (NGO)
router.put('/:id/accept', auth, authorize('ngo'), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    if (donation.status !== 'pending') {
      return res.status(400).json({ message: 'Donation already processed' });
    }

    donation.status = 'accepted';
    donation.assignedNGO = req.user.id;
    donation.tracking.acceptedAt = new Date();
    await donation.save();

    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/donations/:id/assign-volunteer
// @desc    Assign volunteer to donation
// @access  Private (NGO)
router.put('/:id/assign-volunteer', auth, authorize('ngo'), async (req, res) => {
  try {
    const { volunteerId } = req.body;
    
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    donation.assignedVolunteer = volunteerId;
    await donation.save();

    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/donations/:id/status
// @desc    Update donation status
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, notes, photo } = req.body;
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    donation.status = status;
    
    if (status === 'picked') {
      donation.tracking.pickedAt = new Date();
      donation.tracking.pickupPhoto = photo;
    } else if (status === 'delivered') {
      donation.tracking.deliveredAt = new Date();
      donation.tracking.deliveryPhoto = photo;
      donation.tracking.notes = notes;
      
      // Update stats
      await User.findByIdAndUpdate(donation.donor, {
        $inc: { 
          'stats.peopleHelped': donation.impact?.peopleFed || 0,
          'stats.mealsServed': donation.impact?.mealsServed || 0
        }
      });
    }

    await donation.save();
    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
