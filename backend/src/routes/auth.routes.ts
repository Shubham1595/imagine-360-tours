import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
