const Document = require('../models/Document');
const StudentProfile = require('../models/StudentProfile');
const { uploadToCloud, deleteFromCloud } = require('../services/uploadService');
const { logActivity } = require('../services/auditService');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const result = await uploadToCloud(req.file.buffer, req.body.type || 'documents', req.file.originalname);

  const document = await Document.create({
    user: req.user._id,
    type: req.body.type || 'other',
    filename: result.public_id || result.publicId,
    originalName: req.file.originalname,
    url: result.secure_url || result.url,
    publicId: result.public_id || result.publicId,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });

  if (req.body.type === 'resume' && req.user.role === 'student') {
    await StudentProfile.findOneAndUpdate({ user: req.user._id }, { resume: document._id });
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (profile) {
      profile.calculateProfileCompletion();
      await profile.save();
    }
  }

  await logActivity({ userId: req.user._id, action: 'UPLOAD_DOCUMENT', entity: 'Document', entityId: document._id, req });

  return ApiResponse.success(res, 201, 'Document uploaded', document);
});

const getMyDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find({ user: req.user._id }).sort('-createdAt');
  return ApiResponse.success(res, 200, 'Documents fetched', documents);
});

const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({ _id: req.params.id, user: req.user._id });
  if (!document) throw new AppError('Document not found', 404);

  await deleteFromCloud(document.publicId);
  await document.deleteOne();

  return ApiResponse.success(res, 200, 'Document deleted');
});

const downloadDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) throw new AppError('Document not found', 404);
  return ApiResponse.success(res, 200, 'Document URL', { url: document.url, filename: document.originalName });
});

module.exports = { uploadDocument, getMyDocuments, deleteDocument, downloadDocument };
