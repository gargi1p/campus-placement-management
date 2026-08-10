const mongoose = require('mongoose');

const eligibilityCriteriaSchema = new mongoose.Schema(
  {
    minCgpa: { type: Number, default: 0 },
    maxBacklogs: { type: Number, default: 0 },
    minTenthPercentage: { type: Number, default: 0 },
    minTwelfthPercentage: { type: Number, default: 0 },
    allowedBranches: [String],
    allowedDepartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    graduationYears: [Number],
    requiredSkills: [String],
    customCriteria: [{ field: String, operator: String, value: mongoose.Schema.Types.Mixed }],
  },
  { _id: false }
);

const jobDriveSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true },
    title: { type: String, required: true, trim: true },
    description: String,
    role: { type: String, required: true },
    jobType: { type: String, enum: ['full-time', 'internship', 'contract'], default: 'full-time' },
    package: {
      minCtc: Number,
      maxCtc: Number,
      currency: { type: String, default: 'INR' },
    },
    location: String,
    eligibilityCriteria: { type: eligibilityCriteriaSchema, default: () => ({}) },
    applicationDeadline: { type: Date, required: true },
    driveDate: Date,
    status: {
      type: String,
      enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
      default: 'draft',
    },
    totalPositions: { type: Number, default: 1 },
    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    workflow: {
      type: [String],
      default: ['application', 'shortlisting', 'assessment', 'technical_interview', 'hr_interview', 'selection'],
    },
  },
  { timestamps: true }
);

jobDriveSchema.index({ company: 1 });
jobDriveSchema.index({ status: 1 });
jobDriveSchema.index({ applicationDeadline: 1 });
jobDriveSchema.index({ title: 'text', role: 'text' });

module.exports = mongoose.model('JobDrive', jobDriveSchema);
