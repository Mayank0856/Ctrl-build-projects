const fs = require('fs');
const path = require('path');
const { getTutorResponse } = require('./openai');

const extractText = async (filePath, mimeType) => {
  if (mimeType === 'application/pdf') {
    try {
      const pdfParse = require('pdf-parse');
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text.slice(0, 4000); // Limit to 4000 chars for API
    } catch (e) {
      console.error('PDF parse error:', e);
      return '';
    }
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value.slice(0, 4000);
    } catch (e) {
      console.error('DOCX parse error:', e);
      return '';
    }
  } else if (mimeType === 'text/plain') {
    try {
      const text = fs.readFileSync(filePath, 'utf-8');
      return text.slice(0, 4000);
    } catch (e) {
      console.error('TXT parse error:', e);
      return '';
    }
  }
  return '';
};

const processFile = async (filePath, mimeType) => {
  const text = await extractText(filePath, mimeType);

  if (!text) {
    return {
      summary: 'Could not extract text from the file.',
      importantQuestions: [],
      keyConcepts: [],
      easyExplanation: '',
    };
  }

  const prompt = `Analyze the following document text and provide:
1. A concise summary (3-4 sentences)
2. 4-5 important questions students should be able to answer after studying this
3. 5-7 key concepts/terms from the document
4. A simple, easy explanation of the core topic suitable for beginners (2-3 paragraphs)

Format your response exactly as valid JSON:
{
  "summary": "...",
  "importantQuestions": ["q1", "q2", ...],
  "keyConcepts": ["concept1", "concept2", ...],
  "easyExplanation": "..."
}

Document text:
${text}`;

  try {
    const messages = [{ role: 'user', content: prompt }];
    const response = await getTutorResponse(messages, 'neutral', 'document analysis');
    const jsonStr = response.replace(/```json\n?|```\n?/g, '').trim();
    const result = JSON.parse(jsonStr);
    return result;
  } catch (e) {
    // Fallback
    return {
      summary: 'Document processed. AI analysis unavailable - missing API key.',
      importantQuestions: ['What are the main topics covered?', 'What are the key takeaways?'],
      keyConcepts: ['Key concept 1', 'Key concept 2'],
      easyExplanation: 'Unable to generate explanation without OpenAI API Key.',
    };
  }
};

module.exports = { processFile };
