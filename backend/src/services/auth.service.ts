import { UserRepository } from '../repositories/user.repository.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { verifyPassword } from '../utils/crypto.js';
import { randomBytes } from 'crypto';

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository
  ) {}

  /**
   * Validates user credentials and creates a secure session.
   */
  async login(email: string, password: string): Promise<{ user: User; sessionId: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new Error('Invalid credentials');
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const sessionId = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

    const session: Session = {
      id: sessionId,
      userId: user.id,
      createdAt: new Date(),
      expiresAt
    };

    await this.sessionRepository.save(session);

    const { passwordHash, ...safeUser } = user;
    return { user: safeUser, sessionId };
  }

  /**
   * Resolves a session ID into an authenticated user.
   */
  async validateSession(sessionId: string): Promise<User | null> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) return null;

    return this.userRepository.findById(session.userId);
  }

  /**
   * Destroys a session.
   */
  async logout(sessionId: string): Promise<void> {
    await this.sessionRepository.delete(sessionId);
  }
}
