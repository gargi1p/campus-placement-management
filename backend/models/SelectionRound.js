const mongoose = require('mongoose');

const selectionRoundSchema = new mongoose.Schema(
  {
    jobDrive: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDrive', required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['shortlisting', 'assessment', 'technical_interview', 'hr_interview', 'group_discussion', 'other'],
      required: true,
    },
    order: { type: Number, required: true },
    description: String,
    status: { type: String, enum: ['pending', 'ongoing', 'completed'], default: 'pending' },
    scheduledDate: Date,
  },
  { timestamps: true }
);

selectionRoundSchema.index({ jobDrive: 1, order: 1 });

module.exports = mongoose.model('SelectionRound', selectionRoundSchema);
