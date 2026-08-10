const mongoose = require('mongoose');

const candidateResultSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    attendance: { type: String, enum: ['present', 'absent', 'pending'], default: 'pending' },
    result: { type: String, enum: ['pass', 'fail', 'pending'], default: 'pending' },
    score: Number,
    remarks: String,
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    jobDrive: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDrive', required: true },
    selectionRound: { type: mongoose.Schema.Types.ObjectId, ref: 'SelectionRound' },
    type: { type: String, enum: ['technical', 'hr', 'group_discussion', 'other'], required: true },
    scheduledAt: { type: Date, required: true },
    endTime: Date,
    venue: String,
    meetingLink: String,
    interviewer: { type: String, required: true },
    candidates: [candidateResultSchema],
    status: { type: String, enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], default: 'scheduled' },
    notes: String,
  },
  { timestamps: true }
);

interviewSchema.index({ jobDrive: 1 });
interviewSchema.index({ scheduledAt: 1 });
interviewSchema.index({ 'candidates.application': 1 });

module.exports = mongoose.model('Interview', interviewSchema);
