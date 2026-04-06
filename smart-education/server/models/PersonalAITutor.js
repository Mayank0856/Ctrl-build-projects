const mongoose = require('mongoose');

const personalAITutorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    default: 'Nova'
  },
  personality: {
    type: String,
    enum: ['Friendly', 'Strict', 'Encouraging', 'Socratic'],
    default: 'Friendly'
  },
  voiceEnabled: {
    type: Boolean,
    default: true
  },
  preferredVoice: {
    type: String,
    default: 'default'
  }
}, { timestamps: true });

module.exports = mongoose.model('PersonalAITutor', personalAITutorSchema);
