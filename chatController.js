// chatController.js
import { getAIResponse } from './geminiService.js';
import { saveConversation, getConversation } from './redisService.js';

const ESCALATION_KEYWORDS = [
  "I don't know",
  "I cannot",
  "I am not able to",
  "I'm just a language model",
  "I'm sorry, but",
  "As an AI",
  "unable to help",
  "outside my capabilities"
];

function checkEscalation(responseText) {
  const lowerResponse = responseText.toLowerCase();
  return ESCALATION_KEYWORDS.some(keyword => lowerResponse.includes(keyword.toLowerCase()));
}

export async function handleChat(req, res) {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const userId = req.headers['x-user-id'] || 'guest';
    const history = await getConversation(userId);

    // Format history for Gemini
    const formattedHistory = history.map(entry => ({
      role: entry.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: entry.content }]
    }));

    // Add current user message
    formattedHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const reply = await getAIResponse(formattedHistory);

    const updatedMessages = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: reply },
    ];

    await saveConversation(userId, updatedMessages);

    const escalate = checkEscalation(reply);

    res.json({ response: reply, escalate });

  } catch (err) {
    console.error('Error handling chat:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
