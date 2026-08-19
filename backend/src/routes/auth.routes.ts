import { Router } from 'express';
import { userRepository, sessionRepository } from '../repositories/index.js';
import { AuthService } from '../services/auth.service.js';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

const authService = new AuthService(userRepository, sessionRepository);
const authController = new AuthController(authService);

router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', requireAuth, authController.me);

export default router;
