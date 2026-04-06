const express = require('express');
const router = express.Router();
const { uploadAndProcess, getMyFiles } = require('../controllers/materialController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, upload.single('file'), uploadAndProcess);
router.get('/my', protect, getMyFiles);

module.exports = router;
