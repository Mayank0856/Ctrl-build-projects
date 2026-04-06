const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String
  }],
  answers: [{
    questionId: String,
    providedAnswer: String,
    isCorrect: Boolean
  }],
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('TestResult', testResultSchema);
