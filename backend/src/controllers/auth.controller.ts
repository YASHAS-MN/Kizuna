import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email and password are required'
        });
      }

      const { user, sessionId } = await this.authService.login(email, password);

      // Set HttpOnly, SameSite=Lax cookie
      res.cookie('sid', sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // only for local HTTP testing
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      return res.status(200).json({ user });
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        // Use generic credential failure message for safety
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password'
        });
      }
      next(error);
    }
  };

  logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.sessionId;
      if (sessionId) {
        await this.authService.logout(sessionId);
      }
      
      // Clear cookie
      res.clearCookie('sid', { path: '/' });
      return res.status(200).json({ status: 'ok' });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      return res.status(200).json({ user: req.user });
    } catch (error) {
      next(error);
    }
  };
}
