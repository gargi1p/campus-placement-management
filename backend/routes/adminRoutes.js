const express = require('express');
const {
  createAdmin,
  getAllUsers,
  toggleUserStatus,
  getAllStudents,
  getAllRecruiters,
  approveRecruiter,
  createDepartment,
  getDepartments,
  createCompany,
  getCompanies,
  getAllDrives,
  getAllApplications,
  getAllInterviews,
  getAllAssessments,
  getAllOffers,
  getAllDocuments,
  createAnnouncement,
  getAnnouncements,
  getAuditLogs,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.post('/admins', createAdmin);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.get('/students', getAllStudents);
router.get('/recruiters', getAllRecruiters);
router.patch('/recruiters/:id/approve', approveRecruiter);
router.post('/departments', createDepartment);
router.get('/departments', getDepartments);
router.post('/companies', createCompany);
router.get('/companies', getCompanies);
router.get('/drives', getAllDrives);
router.get('/applications', getAllApplications);
router.get('/interviews', getAllInterviews);
router.get('/assessments', getAllAssessments);
router.get('/offers', getAllOffers);
router.get('/documents', getAllDocuments);
router.post('/announcements', createAnnouncement);
router.get('/announcements', getAnnouncements);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
