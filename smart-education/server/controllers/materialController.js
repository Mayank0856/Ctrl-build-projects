const UploadedFile = require('../models/UploadedFile');
const { processFile } = require('../utils/fileProcessor');
const fs = require('fs');

const uploadAndProcess = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const result = await processFile(req.file.path, req.file.mimetype);

    const uploaded = await UploadedFile.create({
      userId: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      subject: req.body.subject || 'General',
      summary: result.summary,
      importantQuestions: result.importantQuestions,
      keyConcepts: result.keyConcepts,
      size: req.file.size,
    });

    res.json({
      filename: req.file.originalname,
      summary: result.summary,
      importantQuestions: result.importantQuestions,
      keyConcepts: result.keyConcepts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyFiles = async (req, res) => {
  try {
    const files = await UploadedFile.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadAndProcess, getMyFiles };
