import { UserRepository } from './user.repository.js';
import { User } from '../models/user.js';
import { db } from '../db/db.js';

export class SQLiteUserRepository implements UserRepository {
  async findAll(): Promise<User[]> {
    const rows = db.prepare('SELECT id, name, email, role FROM users').all() as any[];
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role
    }));
  }

  async findById(id: string): Promise<User | null> {
    const row = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(id) as any;
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = db.prepare('SELECT id, name, email, role, password_hash FROM users WHERE LOWER(email) = LOWER(?)').get(email) as any;
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      passwordHash: row.password_hash
    };
  }
}
