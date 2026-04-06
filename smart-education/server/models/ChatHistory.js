const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  messages: [{
    role: {
      type: String, // 'user', 'assistant', 'system'
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    }
  }],
  emotionState: {
    type: String,
    default: 'neutral',
  }
}, { timestamps: true });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
