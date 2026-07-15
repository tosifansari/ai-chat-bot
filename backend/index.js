import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();

// Database connection initialization
connectDB();

// CORS Settings Middleware for frontend connection
app.use(cors({
  origin: ['http://localhost:5173', 'https://ai-chat-bot-delta-lilac.vercel.app'],
  credentials: true
}));

// Body parser JSON middleware
app.use(express.json());

// API Endpoints Mapping
app.use('/api/auth', authRoutes); // Auth System (Login/Register)
app.use('/api/chat', chatRoutes); // Chat System (Groq / History)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server fully operational on port ${PORT}`);
});