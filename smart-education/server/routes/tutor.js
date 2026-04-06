const express = require('express');
const router = express.Router();
const { chatWithTutor, getHistory } = require('../controllers/tutorController');
const { protect } = require('../middleware/auth');

router.post('/chat', protect, chatWithTutor);
router.get('/history/:subject', protect, getHistory);

module.exports = router;
