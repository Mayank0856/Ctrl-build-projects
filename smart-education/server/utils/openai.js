const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getTutorResponse = async (messages, emotionState = 'neutral', subject = 'General', tutorSettings = null, progress = null, studentName = 'Student') => {
  // Mock response if no API key
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your_openai_api_key_here' || process.env.OPENAI_API_KEY.length < 10) {
    return Promise.resolve(`(Mock AI) As ${tutorSettings?.name || 'your tutor'}, I see you are studying ${subject}. Stay ${emotionState === 'frustrated' ? 'calm' : 'focused'} and let's tackle this together, ${studentName}!`);
  }

  // Build a personalized system prompt
  const tutorName = tutorSettings?.name || 'Tutor';
  const personality = tutorSettings?.personality || 'Friendly';
  let weakAreasText = progress?.weakAreas?.length ? `The student struggles with: ${progress.weakAreas.join(', ')}.` : '';

  let systemPrompt = `You are an AI Tutor named ${tutorName}. Your personality is ${personality}. 
You are currently helping a student named ${studentName} with ${subject}.
The student is currently feeling: ${emotionState}. Adjust your tone accordingly (e.g., be more encouraging if frustrated or bored).
${weakAreasText}
Please provide explanations that are easy to understand, motivating, and personalized specifically to this student. Limit responses to reasonable lengths (max 2-3 short paragraphs) to keep them engaged. Respond using normal text mixed with markdown if necessary. NEVER break character.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to get AI response');
  }
};

module.exports = { getTutorResponse };
