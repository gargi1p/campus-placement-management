const express = require('express');
const { createOffer, respondToOffer, getMyOffers } = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('recruiter', 'admin'), createOffer);
router.get('/my', protect, authorize('student'), getMyOffers);
router.patch('/:id/respond', protect, authorize('student'), respondToOffer);

module.exports = router;
