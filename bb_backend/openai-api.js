require('dotenv').config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function main(abstract, summaryType = '8') {
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

  const userMessage = `Based on the abstract, ${abstract}, find the related news article and summarize it - maximum 300 words and understandable for an ${typeof grade === 'number' ? grade + 'th grader ' + 'and below' : 'adult'}`

  const completion = await openai.chat.completions.create({
    messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userMessage }
    ],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0].message.content;
}

module.exports = main;