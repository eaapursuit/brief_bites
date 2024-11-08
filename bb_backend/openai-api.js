require('dotenv').config();
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;

const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function generateSummary(article_description, articleTitle, summaryType = '8') {
  let grade;
  switch (summaryType) {
    case '12':
      grade = 12;
      break;

    case '13':
      grade = NaN;
      break;
    
    default:
      grade = 8;
      break;
  }

  const userMessage = `Based on the ${articleTitle}, ${article_description}, summarize it - maximum 300 words and understandable for an ${typeof grade === 'number' ? grade + 'th grader ' + 'and below' : 'adult'}`

  const completion = await openai.chat.completions.create({
    messages: [
        { role: "system", content: "You are a helpful summarizer. Provide clear, concise summaries while maintaining accuracy." },
        { role: "user", content: userMessage }
    ],
    model: "gpt-4-turbo",
  });

  return completion.choices[0].message.content;
}

module.exports = generateSummary;