const express = require('express');
const router = express.Router();
const mockDb = require('../mockDb');
const { auth, authorize } = require('../middleware/auth');

// Mock file upload - in production, use multer with S3/Cloudinary
const handleFileUpload = (files) => {
  if (!files || files.length === 0) return [];
  // Return mock URLs for uploaded files
  return files.map((file, index) => ({
    url: `https://mock-cdn.example.com/uploads/${Date.now()}_${index}.jpg`,
    filename: file.originalname || `image_${index}.jpg`
  }));
};

// @route   POST /api/donations
// @desc    Create new donation with photo upload
// @access  Private (Donor)
router.post('/', auth, authorize('donor'), async (req, res) => {
  try {
    const donationData = {
      donor: req.user.id,
      ...req.body
    };

    // Handle photo uploads (mock)
    if (req.body.images) {
      donationData.images = handleFileUpload(req.body.images);
    }

    const donation = await mockDb.createDonation(donationData);

    // Update donor stats
    const user = await mockDb.findUserById(req.user.id);
    if (user) {
      user.stats.totalDonations += 1;
      await mockDb.updateUser(req.user.id, { stats: user.stats });
    }

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
    let donations = await mockDb.getAllDonations();

    // Filter by user's role
    if (req.user.role === 'donor' || myDonations === 'true') {
      donations = donations.filter(d => d.donor === req.user.id);
    } else if (req.user.role === 'ngo') {
      donations = donations.filter(d => 
        d.status === 'pending' || d.assignedNGO === req.user.id
      );
    } else if (req.user.role === 'volunteer') {
      donations = donations.filter(d => 
        d.status === 'accepted' || d.assignedVolunteer === req.user.id
      );
    }

    // Apply additional filters
    if (status) donations = donations.filter(d => d.status === status);
    if (type) donations = donations.filter(d => d.type === type);
    if (priority) donations = donations.filter(d => d.priority === priority);

    // Sort by priority (urgent first) and then by date
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    donations.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/donations/:id/accept
// @desc    Accept donation (NGO) with auto-assign volunteer option
// @access  Private (NGO)
router.put('/:id/accept', auth, authorize('ngo'), async (req, res) => {
  try {
    const { autoAssign } = req.body;
    const donation = await mockDb.findDonationById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    if (donation.status !== 'pending') {
      return res.status(400).json({ message: 'Donation already processed' });
    }

    const updates = {
      status: 'accepted',
      assignedNGO: req.user.id,
      tracking: {
        ...donation.tracking,
        acceptedAt: new Date()
      }
    };

    // Auto-assign nearest volunteer if requested
    if (autoAssign && donation.pickupLocation?.coordinates) {
      const nearest = await mockDb.findNearestVolunteer(donation.pickupLocation.coordinates);
      if (nearest) {
        updates.assignedVolunteer = nearest.volunteer._id;
        updates.estimatedDistance = nearest.distance;
      }
    }

    const updatedDonation = await mockDb.updateDonation(req.params.id, updates);

    res.json(updatedDonation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/donations/:id/assign-volunteer
// @desc    Assign volunteer to donation
// @access  Private (NGO)
router.put('/:id/assign-volunteer', auth, authorize('ngo'), async (req, res) => {
  try {
    const { volunteerId } = req.body;
    
    const donation = await mockDb.findDonationById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const updatedDonation = await mockDb.updateDonation(req.params.id, {
      assignedVolunteer: volunteerId
    });

    res.json(updatedDonation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/donations/:id/status
// @desc    Update donation status with photo proof
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, notes, photo } = req.body;
    const donation = await mockDb.findDonationById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const updates = { status };
    
    if (status === 'picked') {
      updates.tracking = {
        ...donation.tracking,
        pickedAt: new Date(),
        pickupPhoto: photo
      };
    } else if (status === 'delivered') {
      updates.tracking = {
        ...donation.tracking,
        deliveredAt: new Date(),
        deliveryPhoto: photo,
        notes
      };
      
      // Update donor stats
      const donor = await mockDb.findUserById(donation.donor);
      if (donor) {
        donor.stats.peopleHelped += donation.impact?.peopleFed || 0;
        donor.stats.mealsServed += donation.impact?.mealsServed || 0;
        await mockDb.updateUser(donation.donor, { stats: donor.stats });
      }
    }

    const updatedDonation = await mockDb.updateDonation(req.params.id, updates);
    res.json(updatedDonation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/donations/:id/rate
// @desc    Rate a user (donor, volunteer, or NGO)
// @access  Private
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { userId, score, comment } = req.body;
    
    // Verify the donation exists and is completed
    const donation = await mockDb.findDonationById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    if (donation.status !== 'delivered') {
      return res.status(400).json({ message: 'Can only rate after delivery is complete' });
    }

    // Add rating
    const rating = await mockDb.addRating(userId, {
      score,
      comment,
      ratedBy: req.user.id,
      donationId: req.params.id
    });

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      rating
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
