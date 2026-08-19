import { Session } from '../models/session.js';

export interface SessionRepository {
  save(session: Session): Promise<void>;
  findById(id: string): Promise<Session | null>;
  delete(id: string): Promise<void>;
}

export class InMemorySessionRepository implements SessionRepository {
  private sessions: Session[] = [];

  async save(session: Session): Promise<void> {
    // Evict any old session for this user to ensure single active session per user in memory
    this.sessions = this.sessions.filter(s => s.userId !== session.userId);
    this.sessions.push({ ...session });
  }

  async findById(id: string): Promise<Session | null> {
    const session = this.sessions.find(s => s.id === id);
    if (!session) return null;

    // Check if the session is expired
    if (new Date() > session.expiresAt) {
      await this.delete(id);
      return null;
    }

    return { ...session };
  }

  async delete(id: string): Promise<void> {
    this.sessions = this.sessions.filter(s => s.id !== id);
  }
}
