const ChatHistory = require('../models/ChatHistory');
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

    // Add user message
    chatHistory.messages.push({ role: 'user', content: message });
    
    if (emotionState) {
        chatHistory.emotionState = emotionState;
    }

    // Get simple messages array for OpenAI
    const apiMessages = chatHistory.messages.map(m => ({ role: m.role, content: m.content }));

    // Get AI response
    const aiResponse = await getTutorResponse(apiMessages, chatHistory.emotionState, subject);

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

module.exports = { chatWithTutor, getHistory };
