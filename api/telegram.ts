// Native Telegram Bot Webhook Vercel Serverless Function

// Default configuration fallback values
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8965138171:AAEvStnqro33T8u28CrKRQdlyINkkB8qKKc';
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || 'sk-7QqlOxkiFQ0WV917iwvBdAeMVQqzgYViZ8oU0chwKYUXYFt8';
const AI_ENDPOINT = process.env.VITE_CUSTOM_AI_ENDPOINT || 'https://gpt-agent.cc/v1/chat/completions';
const DEFAULT_MODEL = 'claude-fable-5';

const SYSTEM_INSTRUCTION = `You are NEXUS, an advanced autonomous AI Agent developed by the NEXUS Digital Support team.
You are interacting natively inside a Telegram chat conversation with the user.
Your personality is professional, proactive, futuristic, and helpful.
Format your responses using clean Markdown styling when appropriate. Keep messages concise and clear for mobile reading.`;

export default async function handler(req: any, res: any) {
  // Allow simple GET check to confirm endpoint is healthy
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'active', message: 'NEXUS Telegram Webhook API is live!' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;
    console.log('Received Telegram Webhook update:', JSON.stringify(update, null, 2));

    // Handle normal text message from Telegram
    if (update && update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const userText = update.message.text.trim();
      const userName = update.message.from?.first_name || 'User';

      // Handle standard /start command
      if (userText === '/start') {
        const welcomeMessage = `👋 Hello *${userName}*!\n\n🤖 I am *NEXUS*, your personal AI Agent!\n\nYou can chat with me directly right here in Telegram just like a human assistant, or tap the button below to open the full *NEXUS Workspace Mini App* for Project Plans and Artifacts!`;
        
        await sendTelegramMessage(chatId, welcomeMessage, {
          inline_keyboard: [
            [
              {
                text: '🚀 Open NEXUS Workspace',
                web_app: { url: 'https://nexus-ai-agent-beta.vercel.app/' }
              }
            ]
          ]
        });
        return res.status(200).json({ ok: true });
      }

      // Send typing status indicator to Telegram while generating AI response
      await sendTelegramChatAction(chatId, 'typing');

      // Call AI Engine Backend (Custom OpenAI-compatible Endpoint)
      const aiReply = await fetchAiResponse(userText);

      // Send AI response back into Telegram chat
      await sendTelegramMessage(chatId, aiReply);
    }

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

// Fetch response from AI Engine
async function fetchAiResponse(userPrompt: string): Promise<string> {
  try {
    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI API error:', response.status, errText);
      return `⚠️ NEXUS AI Engine encountered an issue (HTTP ${response.status}). Please try again!`;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'I processed your request, but received no response text.';
  } catch (err: any) {
    console.error('Failed to communicate with AI API:', err);
    return '⚠️ Unable to connect to NEXUS AI server at the moment.';
  }
}

// Send typing indicator to Telegram chat
async function sendTelegramChatAction(chatId: number, action: string) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        action: action
      })
    });
  } catch (e) {
    console.error('Error sending chat action:', e);
  }
}

// Send Message back to Telegram Chat
async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  try {
    const payload: any = {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    };

    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      // Fallback without markdown parsing if syntax error occurs
      delete payload.parse_mode;
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
  } catch (e) {
    console.error('Error sending Telegram message:', e);
  }
}
