const mongoose = require('mongoose');

const concentrationReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true },
  focusScore: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  emotionStates: [{ state: String, count: Number }]
}, { timestamps: true });

module.exports = mongoose.model('ConcentrationReport', concentrationReportSchema);
