const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getTutorResponse = async (messages, emotionState = 'neutral', subject = 'general') => {
  try {
    let systemPrompt = `You are a helpful, encouraging AI tutor named "ChatTutor". You are teaching ${subject}. `;
    
    // Adapt based on emotion
    if (emotionState === 'confused') {
      systemPrompt += `The student seems confused. Use simpler language, analogies, and break down the concepts step-by-step.`;
    } else if (emotionState === 'bored') {
      systemPrompt += `The student seems bored. Try to be more engaging, use real-world examples, and ask interactive questions.`;
    } else if (emotionState === 'frustrated') {
      systemPrompt += `The student seems frustrated. Use an encouraging tone, offer alternative explanations, and remind them that it's okay to make mistakes.`;
    } else {
      systemPrompt += `Keep your explanations clear and appropriately challenging for an engaged student.`;
    }

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: apiMessages,
      max_tokens: 500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Error:', error);
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return `[MOCK RESPONSE - NO API KEY] This is a fallback response because the OpenAI API key is missing. Emotion detected: ${emotionState}. I would normally explain ${subject} in a way that suits your mood.`;
    }
    throw error;
  }
};

module.exports = { getTutorResponse };
