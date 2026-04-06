const { getTutorResponse } = require('../utils/openai');
const TestResult = require('../models/TestResult');

const generateTest = async (req, res) => {
  const { subject, totalQuestions = 5 } = req.body;

  const prompt = `Generate exactly ${totalQuestions} multiple choice quiz questions about "${subject}". 
  Format the response as a JSON array like this:
  [
    {
      "question": "Question text here?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A"
    }
  ]
  Only respond with the JSON array, no other text.`;

  try {
    const messages = [{ role: 'user', content: prompt }];
    const response = await getTutorResponse(messages, 'neutral', subject);
    
    let questions;
    try {
      questions = JSON.parse(response.replace(/```json\n?|```\n?/g, '').trim());
    } catch {
      // Fallback if JSON parse fails
      questions = [
        { question: `What is a key concept in ${subject}?`, options: ['Concept A', 'Concept B', 'Concept C', 'Concept D'], correctAnswer: 'Concept A' },
      ];
    }
    
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitTest = async (req, res) => {
  const { subject, questions, answers, timeTaken } = req.body;

  let score = 0;
  const processedAnswers = questions.map((q, i) => {
    const isCorrect = answers[i] === q.correctAnswer;
    if (isCorrect) score++;
    return { questionId: String(i), providedAnswer: answers[i], isCorrect };
  });

  try {
    const result = await TestResult.create({
      userId: req.user._id,
      subject,
      questions,
      answers: processedAnswers,
      score,
      totalQuestions: questions.length,
      timeTaken: timeTaken || 0,
    });

    res.json({ score, totalQuestions: questions.length, timeTaken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getResults = async (req, res) => {
  try {
    const results = await TestResult.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(10);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateTest, submitTest, getResults };
