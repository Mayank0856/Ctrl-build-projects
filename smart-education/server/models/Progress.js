const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  lessonsCompleted: {
    type: Number,
    default: 0,
  },
  totalLessons: {
    type: Number,
    default: 10, // Example default
  },
  testScores: [{
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestResult' },
    score: Number,
    date: { type: Date, default: Date.now },
  }],
  accuracy: {
    type: Number,
    default: 0,
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0,
  },
  streak: {
    type: Number,
    default: 0,
  },
  weakAreas: [{ type: String }],
  lastStudied: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
