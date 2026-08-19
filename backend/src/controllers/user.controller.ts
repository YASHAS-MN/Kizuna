import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';

export class UserController {
  constructor(private userService: UserService) {}

  getAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };
}
