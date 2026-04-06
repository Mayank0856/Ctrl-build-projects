const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true, // e.g., 'application/pdf'
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubjectCategory',
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Should be an admin
  }
}, { timestamps: true });

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
