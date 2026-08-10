const Offer = require('../models/Offer');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const { createNotification } = require('../services/notificationService');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

const createOffer = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.body.applicationId).populate({ path: 'student', populate: { path: 'user' } });
  if (!application) throw new AppError('Application not found', 404);

  const offer = await Offer.create({
    application: application._id,
    student: application.student._id,
    company: req.body.company,
    jobDrive: req.body.jobDrive,
    role: req.body.role,
    ctc: req.body.ctc,
    joiningDate: req.body.joiningDate,
    offerLetter: req.body.offerLetter,
    expiryDate: req.body.expiryDate,
  });

  application.status = 'offer_extended';
  await application.save();

  await StudentProfile.findByIdAndUpdate(application.student._id, { placementStatus: 'placed' });

  await createNotification({
    userId: application.student.user._id,
    type: 'offer',
    title: 'Offer Extended!',
    message: `Congratulations! You have received an offer for ${req.body.role} with CTC ${req.body.ctc}.`,
    relatedEntity: { entityType: 'Offer', entityId: offer._id },
  });

  return ApiResponse.success(res, 201, 'Offer created', offer);
});

const respondToOffer = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  const offer = await Offer.findOne({ _id: req.params.id, student: profile._id });
  if (!offer) throw new AppError('Offer not found', 404);

  offer.status = req.body.status;
  offer.respondedAt = Date.now();
  await offer.save();

  return ApiResponse.success(res, 200, `Offer ${req.body.status}`, offer);
});

const getMyOffers = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  const offers = await Offer.find({ student: profile._id }).populate('company jobDrive').sort('-createdAt');
  return ApiResponse.success(res, 200, 'Offers fetched', offers);
});

module.exports = { createOffer, respondToOffer, getMyOffers };
