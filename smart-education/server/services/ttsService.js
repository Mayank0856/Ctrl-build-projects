const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const crypto = require('crypto');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generateSpeech = async (text) => {
  // Mock fallback
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    return null; // Signals mock audio
  }

  const cacheDir = path.join(__dirname, '..', 'public', 'audio');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  // Hash content so we don't regenerate existing speech
  const hash = crypto.createHash('md5').update(text).digest('hex');
  const filename = `${hash}.mp3`;
  const filePath = path.join(cacheDir, filename);
  const publicUrl = `/audio/${filename}`;

  if (fs.existsSync(filePath)) {
    return filePath;
  }

  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy', // friendly robotic voice
      input: text,
    });
    
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(filePath, buffer);
    return filePath;
  } catch (error) {
    console.error('Error generating TTS:', error);
    throw new Error('Failed to generate speech');
  }
};
