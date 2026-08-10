const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    answer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    marksAwarded: { type: Number, default: 0 },
  },
  { _id: false }
);

const assessmentAttemptSchema = new mongoose.Schema(
  {
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    answers: [answerSchema],
    score: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    status: { type: String, enum: ['in_progress', 'submitted', 'auto_submitted', 'evaluated'], default: 'in_progress' },
    startedAt: { type: Date, default: Date.now },
    submittedAt: Date,
    timeSpent: Number,
    result: { type: String, enum: ['pass', 'fail', 'pending'], default: 'pending' },
  },
  { timestamps: true }
);

assessmentAttemptSchema.index({ assessment: 1, student: 1 }, { unique: true });
assessmentAttemptSchema.index({ student: 1 });

module.exports = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
