import { User } from '../models/user.js';

export interface UserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

export class InMemoryUserRepository implements UserRepository {
  // Precomputed scrypt hash for "kizuna123"
  private devPasswordHash = 'd81a94bb2e6f47738ef9e18b449ff1b3:d0876f953d5f530c1db0cdb5e45a7bf4f513e5f9c80b5bead4ce562fb79aae4566a6a5e88cd1f3900aa7e18b71f829ab5d793aa3dc6c49c878312d78b3b26bd9';

  private users: User[] = [
    { id: 'u1', name: 'Alice Watson', email: 'alice@kizuna.edu', role: 'STUDENT', passwordHash: this.devPasswordHash },
    { id: 'u2', name: 'Bob Jenkins', email: 'bob@kizuna.edu', role: 'STUDENT', passwordHash: this.devPasswordHash },
    { id: 'u3', name: 'Charlie Kim', email: 'charlie@kizuna.edu', role: 'STUDENT', passwordHash: this.devPasswordHash },
    { id: 'u4', name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@kizuna.edu', role: 'MENTOR', passwordHash: this.devPasswordHash },
    { id: 'u5', name: 'Prof. Alan Vance', email: 'alan.vance@kizuna.edu', role: 'MENTOR', passwordHash: this.devPasswordHash },
    { id: 'u6', name: 'Marcus Chen', email: 'marcus.chen@kizuna.edu', role: 'STAFF', passwordHash: this.devPasswordHash },
    { id: 'u7', name: 'Yashas Admin', email: 'admin@kizuna.edu', role: 'ADMIN', passwordHash: this.devPasswordHash },
    { id: 'u8', name: 'David Smith', email: 'david@kizuna.edu', role: 'STUDENT', passwordHash: this.devPasswordHash },
    { id: 'u9', name: 'Elena Rostova', email: 'elena@kizuna.edu', role: 'STUDENT', passwordHash: this.devPasswordHash }
  ];

  async findAll(): Promise<User[]> {
    return this.users.map(u => this.stripSensitive(u));
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find(u => u.id === id);
    return user ? this.stripSensitive(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    // Note: We return the user WITH the password hash here so that the auth service can verify it
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : null;
  }

  private stripSensitive(user: User): User {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
