const ConcentrationReport = require('../models/ConcentrationReport');
const Progress = require('../models/Progress');

// POST /api/focus/report
const saveFocusReport = async (req, res) => {
  try {
    const { sessionId, focusScore, duration, distractionCount, postureFlags, emotionStates } = req.body;

    const report = await ConcentrationReport.create({
      userId: req.user._id,
      sessionId,
      focusScore,
      duration,
      distractionCount,
      postureFlags,
      emotionStates
    });

    // Update global progress moving average focus score
    // Let's find first progress or create
    let progress = await Progress.findOne({ userId: req.user._id, subject: 'General' }); // Just update a generic global one for now or all
    if (!progress) {
      progress = await Progress.create({ userId: req.user._id, subject: 'General' });
    }

    const reportCount = await ConcentrationReport.countDocuments({ userId: req.user._id });
    
    // Calculate new moving average
    const currentTotal = progress.averageFocusScore * (reportCount - 1);
    const newAverage = (currentTotal + focusScore) / reportCount;
    
    progress.averageFocusScore = newAverage;
    await progress.save();

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFocusHistory = async (req, res) => {
  try {
    const reports = await ConcentrationReport.find({ userId: req.user._id }).sort('-createdAt').limit(10);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { saveFocusReport, getFocusHistory };
