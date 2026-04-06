const express = require('express');
const router = express.Router();
const { getUserProgress, updateProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getUserProgress)
  .post(protect, updateProgress);

module.exports = router;
