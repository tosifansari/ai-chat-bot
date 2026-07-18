import Chat from '../models/Chat.js';

// 1. Send Message & Handle Chat Pipeline
export const handleChat = async (req, res) => {
  try {
    const { message, chatId, userId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ message: 'Message and userId are required!' });
    }

    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
    }

    if (!chat) {
      chat = new Chat({
        userId,
        title: message.substring(0, 30) + '...',
        messages: []
      });
    }

    // Mapping history to match standard OpenAI/Groq formats safely
    const history = chat.messages.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.parts && msg.parts[0] ? msg.parts[0].text : ''
    }));

    const url = "https://api.groq.com/openai/v1/chat/completions";
    const apiKey = "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";

    let aiResponseText = "";

    try {
      const apiResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // 🔥 PRODUCTION STABLE CORE CHOSEN
          messages: [
            ...history,
            { role: 'user', content: message }
          ]
        })
      });

      const data = await apiResponse.json();

      if (data.error || !data.choices) {
        console.error("Groq Engine Core Warning:", data.error);
        aiResponseText = `⚠️ Groq API Warning: ${data.error?.message || 'Response mismatch'}`;
      } else {
        aiResponseText = data.choices[0].message.content;
      }
    } catch (apiErr) {
      console.error("External Network Pipeline Timeout:", apiErr);
      aiResponseText = "🤖 Connection Fallback: Server is online, but external API failed to respond.";
    }

    // Database push operations remain 100% safe
    chat.messages.push({ role: 'user', parts: [{ text: message }] });
    chat.messages.push({ role: 'model', parts: [{ text: aiResponseText }] });
    await chat.save();

    res.status(200).json({
      chatId: chat._id,
      title: chat.title,
      reply: aiResponseText
    });

  } catch (error) {
    console.error('Fatal Backend Crash Stopped:', error);
    res.status(500).json({ message: "Internal Workspace Error: " + error.message });
  }
};

// 2. Fetch All Chat Sessions for Sidebar List
export const getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await Chat.find({ userId }).select('title createdAt').sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Fetch Particular Chat Details when Clicked
export const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat session not found!" });
    }
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};