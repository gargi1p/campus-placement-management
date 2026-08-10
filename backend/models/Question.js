const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    type: { type: String, enum: ['mcq', 'aptitude', 'coding'], required: true },
    question: { type: String, required: true },
    options: [String],
    correctAnswer: mongoose.Schema.Types.Mixed,
    marks: { type: Number, default: 1 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    explanation: String,
    testCases: [{ input: String, expectedOutput: String }],
  },
  { timestamps: true }
);

questionSchema.index({ assessment: 1 });

module.exports = mongoose.model('Question', questionSchema);
