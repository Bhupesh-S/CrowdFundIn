const express = require('express');
const { body, validationResult } = require('express-validator');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Create payment intent for donation (simplified for testing)
// @route   POST /api/donations/create-payment-intent
// @access  Private
router.post('/create-payment-intent', protect, [
  body('campaignId').isMongoId().withMessage('Valid campaign ID is required'),
  body('amount').isNumeric().isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('isAnonymous').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { campaignId, amount, isAnonymous = false } = req.body;

    // Check if campaign exists and is active
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status !== 'active') {
      return res.status(400).json({ message: 'Campaign is not active' });
    }

    // Check if campaign deadline has passed
    if (new Date() > new Date(campaign.deadline)) {
      return res.status(400).json({ message: 'Campaign deadline has passed' });
    }

    // Generate a mock payment intent ID for testing
    const paymentIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      clientSecret: `pi_test_secret_${paymentIntentId}`,
      paymentIntentId: paymentIntentId
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Server error creating payment intent' });
  }
});

// @desc    Confirm donation after successful payment (simplified for testing)
// @route   POST /api/donations/confirm
// @access  Private
router.post('/confirm', protect, [
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
  body('campaignId').isMongoId().withMessage('Valid campaign ID is required'),
  body('amount').isNumeric().isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('message').optional().isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters'),
  body('isAnonymous').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { paymentIntentId, campaignId, amount, message = '', isAnonymous = false } = req.body;

    // Check if donation already exists
    const existingDonation = await Donation.findOne({ paymentIntentId });
    if (existingDonation) {
      return res.status(400).json({ message: 'Donation already processed' });
    }

    // Get campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Create donation record
    const donation = await Donation.create({
      donor: req.user._id,
      campaign: campaignId,
      amount: parseFloat(amount),
      message,
      isAnonymous,
      paymentIntentId,
      paymentStatus: 'succeeded'
    });

    // Update campaign
    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { currentAmount: parseFloat(amount) },
      $push: {
        donors: {
          user: req.user._id,
          amount: parseFloat(amount),
          isAnonymous,
          donatedAt: new Date()
        }
      }
    });

    // Update user donations
    await User.findByIdAndUpdate(req.user._id, {
      $push: { donations: donation._id }
    });

    // Check if campaign goal is reached
    const updatedCampaign = await Campaign.findById(campaignId);
    if (updatedCampaign.currentAmount >= updatedCampaign.goalAmount) {
      updatedCampaign.status = 'completed';
      await updatedCampaign.save();
    }

    const populatedDonation = await Donation.findById(donation._id)
      .populate('donor', 'name profilePicture')
      .populate('campaign', 'title');

    res.status(201).json({
      message: 'Donation successful!',
      donation: populatedDonation
    });
  } catch (error) {
    console.error('Confirm donation error:', error);
    res.status(500).json({ message: 'Server error confirming donation' });
  }
});

// @desc    Get donations for a campaign
// @route   GET /api/donations/campaign/:campaignId
// @access  Public
router.get('/campaign/:campaignId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const donations = await Donation.find({ 
      campaign: req.params.campaignId,
      paymentStatus: 'succeeded'
    })
      .populate('donor', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out anonymous donations' donor info
    const filteredDonations = donations.map(donation => {
      if (donation.isAnonymous) {
        return {
          ...donation.toObject(),
          donor: { name: 'Anonymous', profilePicture: '' }
        };
      }
      return donation;
    });

    const total = await Donation.countDocuments({ 
      campaign: req.params.campaignId,
      paymentStatus: 'succeeded'
    });

    res.json({
      donations: filteredDonations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalDonations: total
      }
    });
  } catch (error) {
    console.error('Get campaign donations error:', error);
    res.status(500).json({ message: 'Server error fetching donations' });
  }
});

// @desc    Get user's donations
// @route   GET /api/donations/my-donations
// @access  Private
router.get('/my-donations', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const donations = await Donation.find({ 
      donor: req.user._id,
      paymentStatus: 'succeeded'
    })
      .populate('campaign', 'title image status currentAmount goalAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Donation.countDocuments({ 
      donor: req.user._id,
      paymentStatus: 'succeeded'
    });

    res.json({
      donations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalDonations: total
      }
    });
  } catch (error) {
    console.error('Get user donations error:', error);
    res.status(500).json({ message: 'Server error fetching user donations' });
  }
});

// @desc    Get donation statistics
// @route   GET /api/donations/stats
// @access  Private (Admin only)
router.get('/stats', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalDonations = await Donation.countDocuments({ paymentStatus: 'succeeded' });
    const totalAmount = await Donation.aggregate([
      { $match: { paymentStatus: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyDonations = await Donation.aggregate([
      {
        $match: {
          paymentStatus: 'succeeded',
          createdAt: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalDonations,
      totalAmount: totalAmount[0]?.total || 0,
      monthlyDonations
    });
  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({ message: 'Server error fetching donation statistics' });
  }
});

module.exports = router;
