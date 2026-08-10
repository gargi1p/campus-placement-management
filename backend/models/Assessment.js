const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    jobDrive: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDrive', required: true },
    selectionRound: { type: mongoose.Schema.Types.ObjectId, ref: 'SelectionRound' },
    title: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'aptitude', 'coding', 'mixed'], required: true },
    description: String,
    duration: { type: Number, required: true },
    totalMarks: { type: Number, default: 100 },
    passingMarks: { type: Number, default: 40 },
    randomizeQuestions: { type: Boolean, default: true },
    autoSubmit: { type: Boolean, default: true },
    questionCount: { type: Number, default: 10 },
    status: { type: String, enum: ['draft', 'published', 'ongoing', 'completed'], default: 'draft' },
    startTime: Date,
    endTime: Date,
  },
  { timestamps: true }
);

assessmentSchema.index({ jobDrive: 1 });
assessmentSchema.index({ status: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
