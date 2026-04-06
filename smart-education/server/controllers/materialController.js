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
      easyExplanation: result.easyExplanation,
      importantQuestions: result.importantQuestions,
      keyConcepts: result.keyConcepts,
      size: req.file.size,
    });

    res.json({
      filename: req.file.originalname,
      summary: result.summary,
      easyExplanation: result.easyExplanation,
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

const crypto = require('crypto');
const { createVideoJob } = require('../services/videoService');
const activeJobs = new Map();

const generateVideo = async (req, res) => {
  try {
    const { text, studentName } = req.body;
    if (!text) return res.status(400).json({ message: 'Text content is required' });

    // Generate a unique ID for the job
    const jobId = crypto.randomUUID();
    
    // Send immediate response
    res.status(202).json({ jobId, status: 'processing', message: 'Video generation started' });

    activeJobs.set(jobId, { status: 'processing' });

    // Start background render worker
    createVideoJob(text, studentName || req.user.name.split(' ')[0], jobId).then(url => {
      activeJobs.set(jobId, { status: 'completed', url });
    }).catch(err => {
      console.error(err);
      activeJobs.set(jobId, { status: 'failed', error: err.message });
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVideoStatus = async (req, res) => {
  const { jobId } = req.params;
  const job = activeJobs.get(jobId);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json(job);
};

module.exports = { uploadAndProcess, getMyFiles, generateVideo, getVideoStatus };
