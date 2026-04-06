const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllLibraryMaterials, getStudents } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/materials', protect, admin, getAllLibraryMaterials);
router.get('/students', protect, admin, getStudents);

module.exports = router;
