const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  actionType: {
    type: String, // e.g., 'LOGIN', 'TEST_COMPLETED', 'MATERIAL_UPLOADED', 'FOCUS_SESSION_COMPLETED'
    required: true,
  },
  details: {
    type: String, // e.g., 'Scored 4/5 in Physics', 'Uploaded Assignment.pdf'
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
