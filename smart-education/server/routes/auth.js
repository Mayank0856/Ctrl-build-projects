const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', registerUser);
router.post('/login', authUser);
router.get('/me', protect, getUserProfile);

module.exports = router;
