const express = require('express');
const router = express.Router();
const { generateTest, submitTest, getResults } = require('../controllers/testController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generateTest);
router.post('/submit', protect, submitTest);
router.get('/results', protect, getResults);

module.exports = router;
