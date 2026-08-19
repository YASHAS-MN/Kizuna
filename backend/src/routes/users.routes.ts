import { Router } from 'express';
import { userRepository } from '../repositories/index.js';
import { UserService } from '../services/user.service.js';
import { UserController } from '../controllers/user.controller.js';

const router = Router();

const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.get('/users', userController.getAllUsers);

export default router;
