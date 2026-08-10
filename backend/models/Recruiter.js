const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    designation: String,
    phone: String,
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

recruiterSchema.index({ company: 1 });

module.exports = mongoose.model('Recruiter', recruiterSchema);
