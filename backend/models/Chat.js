import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'model'], // 'user' matlab tum, 'model' matlab Gemini AI
    required: true
  },
  parts: [{
    text: { type: String, required: true }
  }]
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Yeh chat kis user ki hai usse link karne ke liye
    required: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [messageSchema] // Saari baatein is array me save hongi
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;