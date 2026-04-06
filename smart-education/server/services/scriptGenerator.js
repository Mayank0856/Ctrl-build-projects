const { config } = require('../utils/openai');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a video script from the file text.
 * The script provides an array of scenes. Each scene has a short title, text for the prompt/bullet point, and the spoken dialogue.
 */
exports.generateVideoScript = async (fileText, studentName = 'Student') => {
  // Mock fallback if API key is not provided
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.log("Using mock script generator because real OpenAI key is missing.");
    return [
      {
        sceneNumber: 1,
        title: "Introduction to Databases",
        bullets: ["Structured collection of data", "Stored electronically"],
        dialogue: `Hello ${studentName}! Today we are learning about databases. They are organized structures used to store data electronically.`,
        animationHint: "explaining"
      },
      {
        sceneNumber: 2,
        title: "Key Concepts",
        bullets: ["Speed and Efficiency", "Data Integrity"],
        dialogue: "With databases, we can retrieve exactly what we need, instantly! Ensure your data is safe and organized.",
        animationHint: "pointing"
      }
    ];
  }

  try {
    const prompt = `
    You are an expert AI educational scriptwriter. Outline an animated explainer video script designed for a 2D animated tutor character to present to a student named ${studentName}.
    Summarize the following text into a 3 to 5 scenes engaging 1-minute video script.
    
    TEXT:
    """
    ${fileText}
    """
    
    Structure the response as a JSON array of scenes. 
    Each scene must have:
     - "sceneNumber": integer
     - "title": string (short header for the slide)
     - "bullets": array of 1-3 short strings to display on screen
     - "dialogue": string (the exact words the tutor will say. make it conversational, encouraging, and clear)
     - "animationHint": string (a short suggestion for the tutor's animation state, e.g., "smiling", "explaining", "pointing", "thinking")
    
    Output strictly in this format:
    {
      "scenes": [
         { "sceneNumber": 1, "title": "Introduction...", ... }
      ]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-1106',
      messages: [{ role: 'system', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    return parsed.scenes;

  } catch (error) {
    console.error('Error in script generator:', error);
    throw new Error('Failed to generate video script');
  }
};
