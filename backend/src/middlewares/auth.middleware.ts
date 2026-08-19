import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.js';
import { AuthService } from '../services/auth.service.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
  sessionId?: string;
}

/**
 * Utility helper to parse headers.cookie without external libraries.
 */
export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const name = parts[0]?.trim();
    const value = parts.slice(1).join('=')?.trim();
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}

/**
 * Creates authentication resolver middleware.
 */
export function createAuthMiddleware(authService: AuthService) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const sessionId = cookies['sid'];

      if (!sessionId) {
        return next();
      }

      const user = await authService.validateSession(sessionId);
      if (user) {
        req.user = user;
        req.sessionId = sessionId;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to reject unauthenticated requests.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Session missing or expired'
    });
  }
  next();
}
