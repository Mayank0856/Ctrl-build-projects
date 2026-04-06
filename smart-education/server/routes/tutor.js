const express = require('express');
const router = express.Router();
const { chatWithTutor, getHistory, getAITutorSettings, updateAITutorSettings } = require('../controllers/tutorController');
const { protect } = require('../middleware/auth');

router.post('/chat', protect, chatWithTutor);
router.get('/history/:subject', protect, getHistory);
router.get('/settings', protect, getAITutorSettings);
router.put('/settings', protect, updateAITutorSettings);

module.exports = router;
