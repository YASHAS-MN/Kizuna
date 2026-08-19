import { Router } from 'express';
import { InMemoryUserRepository } from '../repositories/user.repository.js';
import { UserService } from '../services/user.service.js';
import { UserController } from '../controllers/user.controller.js';

const router = Router();

const userRepository = new InMemoryUserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.get('/users', userController.getAllUsers);

export default router;
