import { Router } from 'express';
import { login, register, me, logout } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.post('/logout', authenticate, logout);
authRouter.get('/me', authenticate, me);
