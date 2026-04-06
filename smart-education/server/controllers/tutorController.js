const ChatHistory = require('../models/ChatHistory');
const PersonalAITutor = require('../models/PersonalAITutor');
const Progress = require('../models/Progress');
const { getTutorResponse } = require('../utils/openai');

const chatWithTutor = async (req, res) => {
  const { message, subject, emotionState } = req.body;

  try {
    let chatHistory = await ChatHistory.findOne({ userId: req.user._id, subject });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        userId: req.user._id,
        subject,
        messages: [],
      });
    }

    // Fetch personal AI settings and student progress
    let tutorSettings = await PersonalAITutor.findOne({ userId: req.user._id });
    if (!tutorSettings) tutorSettings = { name: 'Nova', personality: 'Friendly' };
    
    let progress = await Progress.findOne({ userId: req.user._id, subject });

    // Add user message
    chatHistory.messages.push({ role: 'user', content: message });
    
    if (emotionState) {
        chatHistory.emotionState = emotionState;
    }

    // Get simple messages array for OpenAI
    const apiMessages = chatHistory.messages.map(m => ({ role: m.role, content: m.content }));

    // Get AI response (now passing extra context)
    const aiResponse = await getTutorResponse(apiMessages, chatHistory.emotionState, subject, tutorSettings, progress, req.user.name);

    // Add AI response
    chatHistory.messages.push({ role: 'assistant', content: aiResponse });
    await chatHistory.save();

    res.json({ response: aiResponse, chatHistory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHistory = async (req, res) => {
  const { subject } = req.params;
  try {
    const history = await ChatHistory.findOne({ userId: req.user._id, subject });
    res.json(history || { messages: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAITutorSettings = async (req, res) => {
  try {
    let settings = await PersonalAITutor.findOne({ userId: req.user._id });
    if (!settings) {
      settings = await PersonalAITutor.create({ userId: req.user._id });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAITutorSettings = async (req, res) => {
  try {
    let settings = await PersonalAITutor.findOne({ userId: req.user._id });
    if (!settings) {
      settings = new PersonalAITutor({ userId: req.user._id });
    }
    
    if (req.body.name) settings.name = req.body.name;
    if (req.body.personality) settings.personality = req.body.personality;
    if (req.body.voiceEnabled !== undefined) settings.voiceEnabled = req.body.voiceEnabled;
    if (req.body.preferredVoice) settings.preferredVoice = req.body.preferredVoice;
    
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { chatWithTutor, getHistory, getAITutorSettings, updateAITutorSettings };
