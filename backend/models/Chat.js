import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'model'], // 'user' matlab aap, 'model' matlab Gemini/Llama AI
    required: true
  },
  parts: [{
    text: { type: String, required: true }
  }]
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [messageSchema]
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;