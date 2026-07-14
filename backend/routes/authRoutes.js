import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser); // POST: http://localhost:5000/api/auth/register
router.post('/login', loginUser);       // POST: http://localhost:5000/api/auth/login

export default router;