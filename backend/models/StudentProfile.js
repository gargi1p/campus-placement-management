const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  technologies: [String],
  link: String,
});

const certificationSchema = new mongoose.Schema({
  name: String,
  issuer: String,
  year: Number,
  link: String,
});

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    rollNumber: { type: String, unique: true, sparse: true },
    phone: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: String,
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    branch: String,
    graduationYear: Number,
    cgpa: { type: Number, min: 0, max: 10 },
    tenthPercentage: { type: Number, min: 0, max: 100 },
    twelfthPercentage: { type: Number, min: 0, max: 100 },
    backlogs: { type: Number, default: 0, min: 0 },
    skills: [String],
    projects: [projectSchema],
    certifications: [certificationSchema],
    socialLinks: {
      github: String,
      linkedin: String,
      portfolio: String,
    },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    placementStatus: {
      type: String,
      enum: ['not_placed', 'applied', 'shortlisted', 'selected', 'placed', 'rejected'],
      default: 'not_placed',
    },
    profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

studentProfileSchema.index({ department: 1 });
studentProfileSchema.index({ branch: 1 });
studentProfileSchema.index({ graduationYear: 1 });
studentProfileSchema.index({ cgpa: 1 });
studentProfileSchema.index({ placementStatus: 1 });

studentProfileSchema.methods.calculateProfileCompletion = function () {
  const fields = [
    this.rollNumber,
    this.phone,
    this.branch,
    this.graduationYear,
    this.cgpa,
    this.tenthPercentage,
    this.twelfthPercentage,
    this.skills?.length,
    this.projects?.length,
    this.resume,
    this.socialLinks?.github || this.socialLinks?.linkedin,
  ];
  const filled = fields.filter((f) => f !== undefined && f !== null && f !== '').length;
  this.profileCompletion = Math.round((filled / fields.length) * 100);
  return this.profileCompletion;
};

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
