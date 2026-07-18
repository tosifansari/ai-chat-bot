import express from 'express';
import { handleChat, getUserChats, getChatById } from '../controllers/chatController.js';

const router = express.Router();

// 🎯 Mapping exactly to match frontend fetch requirements
router.post('/send', handleChat);
router.get('/user/:userId', getUserChats);
router.get('/session/:chatId', getChatById);

export default router;