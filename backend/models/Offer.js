const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, unique: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    jobDrive: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDrive', required: true },
    role: { type: String, required: true },
    ctc: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    joiningDate: Date,
    offerLetter: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    status: {
      type: String,
      enum: ['extended', 'accepted', 'rejected', 'revoked', 'expired'],
      default: 'extended',
    },
    extendedAt: { type: Date, default: Date.now },
    respondedAt: Date,
    expiryDate: Date,
    notes: String,
  },
  { timestamps: true }
);

offerSchema.index({ student: 1 });
offerSchema.index({ company: 1 });
offerSchema.index({ status: 1 });

module.exports = mongoose.model('Offer', offerSchema);
