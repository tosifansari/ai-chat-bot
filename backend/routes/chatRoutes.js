import express from 'express';
import { handleChat, getUserChats, getChatById } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', handleChat);                
router.get('/user/:userId', getUserChats);   
router.get('/:chatId', getChatById);         

export default router; 