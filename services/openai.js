const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const improveDescription = async (text) => {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant that improves support ticket descriptions. ' +
          'Make the text clearer, more professional, and more detailed while preserving the original meaning. ' +
          'Return only the improved text with no extra commentary.'
      },
      {
        role: 'user',
        content: text
      }
    ],
    temperature: 0.5,
    max_tokens: 1000
  });

  return response.choices[0].message.content.trim();
};

module.exports = { improveDescription };
