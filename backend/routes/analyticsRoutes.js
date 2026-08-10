const express = require('express');
const { getAnnouncements } = require('../controllers/adminController');
const { getDashboardStats, getPlacementRate, getDepartmentStats, getYearWiseStats, getCompanyWiseSelections, getPackageStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/announcements', protect, getAnnouncements);
router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.get('/placement-rate', protect, authorize('admin'), getPlacementRate);
router.get('/department-stats', protect, authorize('admin'), getDepartmentStats);
router.get('/year-wise', protect, authorize('admin'), getYearWiseStats);
router.get('/company-selections', protect, authorize('admin'), getCompanyWiseSelections);
router.get('/package-stats', protect, authorize('admin'), getPackageStats);

module.exports = router;
