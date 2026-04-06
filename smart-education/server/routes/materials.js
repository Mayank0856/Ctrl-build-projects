const express = require('express');
const router = express.Router();
const { uploadAndProcess, getMyFiles, generateVideo, getVideoStatus } = require('../controllers/materialController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, upload.single('file'), uploadAndProcess);
router.get('/', protect, getMyFiles);
router.post('/generate-video', protect, generateVideo);
router.get('/video-status/:jobId', protect, getVideoStatus);

module.exports = router;
