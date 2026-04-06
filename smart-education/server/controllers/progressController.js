const Progress = require('../models/Progress');

const getUserProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProgress = async (req, res) => {
  const { subject, timeSpent, lessonsCompleted } = req.body;
  try {
    let progress = await Progress.findOne({ userId: req.user._id, subject });

    if (progress) {
      if (timeSpent) progress.timeSpent += timeSpent;
      if (lessonsCompleted) progress.lessonsCompleted += lessonsCompleted;
      progress.lastStudied = Date.now();
      // Simple streak logic: if last studied was yesterday, increment. If today, keep. Else reset.
      // For MVP, just increment if timeSpent is updated.
      progress.streak += 1;
      
      await progress.save();
    } else {
      progress = await Progress.create({
        userId: req.user._id,
        subject,
        timeSpent: timeSpent || 0,
        lessonsCompleted: lessonsCompleted || 0,
        streak: 1,
      });
    }
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserProgress, updateProgress };
