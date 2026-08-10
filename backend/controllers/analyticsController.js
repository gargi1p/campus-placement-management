const StudentProfile = require('../models/StudentProfile');
const Offer = require('../models/Offer');
const Application = require('../models/Application');
const Department = require('../models/Department');
const Company = require('../models/Company');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const median = (arr) => {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const getPlacementRate = asyncHandler(async (req, res) => {
  const totalStudents = await StudentProfile.countDocuments();
  const placedStudents = await StudentProfile.countDocuments({ placementStatus: 'placed' });
  const rate = totalStudents ? ((placedStudents / totalStudents) * 100).toFixed(2) : 0;

  return ApiResponse.success(res, 200, 'Placement rate', {
    totalStudents,
    placedStudents,
    placementRate: parseFloat(rate),
  });
});

const getDepartmentStats = asyncHandler(async (req, res) => {
  const stats = await StudentProfile.aggregate([
    {
      $group: {
        _id: '$branch',
        total: { $sum: 1 },
        placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] } },
        avgCgpa: { $avg: '$cgpa' },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const enriched = stats.map((s) => ({
    branch: s._id || 'Unknown',
    total: s.total,
    placed: s.placed,
    placementRate: s.total ? ((s.placed / s.total) * 100).toFixed(2) : 0,
    avgCgpa: s.avgCgpa?.toFixed(2),
  }));

  return ApiResponse.success(res, 200, 'Department statistics', enriched);
});

const getYearWiseStats = asyncHandler(async (req, res) => {
  const stats = await StudentProfile.aggregate([
    {
      $group: {
        _id: '$graduationYear',
        total: { $sum: 1 },
        placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] } },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  return ApiResponse.success(res, 200, 'Year-wise statistics', stats);
});

const getCompanyWiseSelections = asyncHandler(async (req, res) => {
  const stats = await Offer.aggregate([
    { $match: { status: { $in: ['extended', 'accepted'] } } },
    { $group: { _id: '$company', selections: { $sum: 1 }, avgCtc: { $avg: '$ctc' } } },
    {
      $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'company' },
    },
    { $unwind: '$company' },
    { $project: { companyName: '$company.name', selections: 1, avgCtc: 1 } },
    { $sort: { selections: -1 } },
  ]);

  return ApiResponse.success(res, 200, 'Company-wise selections', stats);
});

const getPackageStats = asyncHandler(async (req, res) => {
  const offers = await Offer.find({ status: { $in: ['extended', 'accepted'] } }).select('ctc');
  const packages = offers.map((o) => o.ctc).filter(Boolean);

  if (!packages.length) {
    return ApiResponse.success(res, 200, 'Package statistics', {
      count: 0,
      average: 0,
      median: 0,
      highest: 0,
      lowest: 0,
      distribution: [],
    });
  }

  const ranges = [
    { label: '0-5 LPA', min: 0, max: 500000 },
    { label: '5-10 LPA', min: 500000, max: 1000000 },
    { label: '10-15 LPA', min: 1000000, max: 1500000 },
    { label: '15-20 LPA', min: 1500000, max: 2000000 },
    { label: '20+ LPA', min: 2000000, max: Infinity },
  ];

  const distribution = ranges.map((r) => ({
    range: r.label,
    count: packages.filter((p) => p >= r.min && p < r.max).length,
  }));

  return ApiResponse.success(res, 200, 'Package statistics', {
    count: packages.length,
    average: Math.round(packages.reduce((a, b) => a + b, 0) / packages.length),
    median: Math.round(median(packages)),
    highest: Math.max(...packages),
    lowest: Math.min(...packages),
    distribution,
  });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const [students, companies, drives, applications, offers, departments] = await Promise.all([
    StudentProfile.countDocuments(),
    Company.countDocuments({ isActive: true }),
    Application.distinct('jobDrive').then((d) => d.length),
    Application.countDocuments(),
    Offer.countDocuments({ status: { $in: ['extended', 'accepted'] } }),
    Department.countDocuments({ isActive: true }),
  ]);

  const placed = await StudentProfile.countDocuments({ placementStatus: 'placed' });

  return ApiResponse.success(res, 200, 'Dashboard statistics', {
    students,
    companies,
    activeDrives: drives,
    applications,
    offers,
    departments,
    placedStudents: placed,
    placementRate: students ? ((placed / students) * 100).toFixed(2) : 0,
  });
});

module.exports = {
  getPlacementRate,
  getDepartmentStats,
  getYearWiseStats,
  getCompanyWiseSelections,
  getPackageStats,
  getDashboardStats,
};
