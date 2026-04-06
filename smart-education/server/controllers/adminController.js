const User = require('../models/User');
const Progress = require('../models/Progress');
const ConcentrationReport = require('../models/ConcentrationReport');
const StudyMaterial = require('../models/StudyMaterial');
const UploadedFile = require('../models/UploadedFile');

// Admin Analytics Dashboard
const getDashboardStats = async (req, res) => {
  try {
    const studentCount = await User.countDocuments({ role: 'student' });
    const totalMaterials = await StudyMaterial.countDocuments();
    const activeSessions = await ConcentrationReport.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // last 24h
    });

    const averageFocusProgress = await Progress.aggregate([
      { $group: { _id: null, avgFocus: { $avg: '$averageFocusScore' } } }
    ]);

    const avgFocus = averageFocusProgress.length > 0 ? Math.round(averageFocusProgress[0].avgFocus) : 0;

    res.json({ studentCount, totalMaterials, activeSessions, avgFocus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin manage materials
const getAllLibraryMaterials = async (req, res) => {
  try {
    const materials = await StudyMaterial.find().sort('-createdAt');
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getDashboardStats, getAllLibraryMaterials, getStudents };
