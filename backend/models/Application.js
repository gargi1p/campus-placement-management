const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    jobDrive: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDrive', required: true },
    status: {
      type: String,
      enum: [
        'applied',
        'shortlisted',
        'rejected',
        'assessment_pending',
        'assessment_completed',
        'interview_scheduled',
        'technical_interview',
        'hr_interview',
        'selected',
        'offer_extended',
        'placed',
        'withdrawn',
      ],
      default: 'applied',
    },
    eligibility: {
      isEligible: Boolean,
      reasons: [String],
      missingRequirements: [String],
    },
    currentRound: { type: String, default: 'application' },
    appliedAt: { type: Date, default: Date.now },
    shortlistedAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
    notes: String,
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, jobDrive: 1 }, { unique: true });
applicationSchema.index({ jobDrive: 1, status: 1 });
applicationSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
