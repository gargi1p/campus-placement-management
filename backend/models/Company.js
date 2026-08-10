const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    website: String,
    logo: String,
    industry: String,
    location: String,
    size: { type: String, enum: ['startup', 'small', 'medium', 'large', 'enterprise'] },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

companySchema.index({ name: 'text', industry: 'text' });
companySchema.index({ isVerified: 1 });

module.exports = mongoose.model('Company', companySchema);
