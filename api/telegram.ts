// Native Telegram Bot Webhook Vercel Serverless Function

// Default configuration fallback values
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8965138171:AAEvStnqro33T8u28CrKRQdlyINkkB8qKKc';
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || 'sk-7QqlOxkiFQ0WV917iwvBdAeMVQqzgYViZ8oU0chwKYUXYFt8';
const AI_ENDPOINT = process.env.VITE_CUSTOM_AI_ENDPOINT || 'https://gpt-agent.cc/v1/chat/completions';
const DEFAULT_MODEL = 'claude-fable-5';

const SYSTEM_INSTRUCTION = `You are NEXUS, an advanced autonomous AI Agent developed by the NEXUS Digital Support team.
You are interacting natively inside a Telegram chat conversation with the user (Manus Agent style).

CRITICAL FORMATTING RULES FOR TELEGRAM CHAT:
- DO NOT output raw markdown asterisks like **bold** or *italic*.
- Use clean HTML tags for formatting: <b>bold headers</b>, <i>italic</i>, and <code>code</code>.
- Use clean bullet emojis like • or 🚀 for lists.
- Keep responses readable, elegant, concise, and structured like an executive assistant.`;

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'active', message: 'NEXUS Telegram Webhook API is live!' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;
    console.log('Received Telegram Webhook update:', JSON.stringify(update, null, 2));

    if (update && update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const userText = update.message.text.trim();
      const userName = update.message.from?.first_name || 'User';

      // Handle standard /start command
      if (userText === '/start') {
        const welcomeMessage = `👋 Hello <b>${userName}</b>!\n\n🤖 I am <b>NEXUS</b>, your personal AI Agent!\n\nYou can chat with me directly right here in Telegram just like a human assistant, or tap the button below to launch the <b>NEXUS Workspace Mini App</b> anytime!`;
        
        await sendTelegramMessage(chatId, welcomeMessage, {
          inline_keyboard: [
            [
              {
                text: '🚀 Open NEXUS Workspace App',
                web_app: { url: 'https://nexus-ai-agent-beta.vercel.app/' }
              }
            ]
          ]
        });
        return res.status(200).json({ ok: true });
      }

      // Check if user is asking to generate an image
      const isImageRequest = /image|draw|picture|photo|illustration|render|generate|create/i.test(userText) && /image|photo|picture|draw|generate|create|render/i.test(userText);

      if (isImageRequest) {
        await sendTelegramChatAction(chatId, 'upload_photo');
        const cleanPrompt = userText
          .replace(/^Generate an image of\s*/i, '')
          .replace(/^Generate image of\s*/i, '')
          .replace(/^Draw a\s*/i, '')
          .replace(/^Create an image of\s*/i, '')
          .replace(/^Photo of\s*/i, '')
          .replace(/^Picture of\s*/i, '')
          .replace(/["']/g, '')
          .trim();

        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
        
        await sendTelegramPhoto(chatId, imageUrl, `🎨 <b>Generated Image:</b> ${escapeHtml(cleanPrompt)}`);
        return res.status(200).json({ ok: true });
      }

      // Send typing status indicator to Telegram while generating AI response
      await sendTelegramChatAction(chatId, 'typing');

      // Call AI Engine Backend
      const rawAiReply = await fetchAiResponse(userText);

      // Clean Markdown formatting into Telegram-compatible HTML tags
      const formattedReply = convertMarkdownToTelegramHtml(rawAiReply);

      // Send AI response back into Telegram chat with inline keyboard launcher
      await sendTelegramMessage(chatId, formattedReply, {
        inline_keyboard: [
          [
            {
              text: '💻 Open in NEXUS App',
              web_app: { url: 'https://nexus-ai-agent-beta.vercel.app/' }
            }
          ]
        ]
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Convert markdown syntax into Telegram HTML tags
function convertMarkdownToTelegramHtml(text: string): string {
  if (!text) return '';
  return text
    // Replace **bold** with <b>bold</b>
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    // Replace *italic* or _italic_ with <i>italic</i>
    .replace(/(?<!\w)\*(.*?)\*(?!\w)/g, '<i>$1</i>')
    .replace(/(?<!\w)_(.*?)_(?!\w)/g, '<i>$1</i>')
    // Replace `code` with <code>code</code>
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Clean remaining loose asterisks
    .replace(/^\*\s+/gm, '• ');
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

// Send Message back to Telegram Chat with HTML parse mode
async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  try {
    const payload: any = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
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
      console.error('Telegram HTML sendMessage failed, trying plaintext fallback...');
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

// Send Photo back to Telegram Chat
async function sendTelegramPhoto(chatId: number, photoUrl: string, caption?: string) {
  try {
    const payload: any = {
      chat_id: chatId,
      photo: photoUrl,
      caption: caption,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '💻 Open in NEXUS App',
              web_app: { url: 'https://nexus-ai-agent-beta.vercel.app/' }
            }
          ]
        ]
      }
    };

    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error('Telegram sendPhoto error:', await res.text());
    }
  } catch (e) {
    console.error('Error sending Telegram photo:', e);
  }
}
