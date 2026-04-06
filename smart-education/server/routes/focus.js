const express = require('express');
const router = express.Router();
const { saveFocusReport, getFocusHistory } = require('../controllers/focusController');
const { protect } = require('../middleware/auth');

router.post('/report', protect, saveFocusReport);
router.get('/history', protect, getFocusHistory);

module.exports = router;
