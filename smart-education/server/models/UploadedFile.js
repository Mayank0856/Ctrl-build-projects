const mongoose = require('mongoose');

const uploadedFileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  fileType: { type: String, required: true },
  subject: { type: String, default: 'General' },
  summary: { type: String, default: '' },
  importantQuestions: [{ type: String }],
  keyConcepts: [{ type: String }],
  size: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('UploadedFile', uploadedFileSchema);
