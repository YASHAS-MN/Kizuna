import { User } from '../models/user.js';

export interface UserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
}

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [
    { id: 'u1', name: 'Alice Watson', email: 'alice@kizuna.edu', role: 'STUDENT' },
    { id: 'u2', name: 'Bob Jenkins', email: 'bob@kizuna.edu', role: 'STUDENT' },
    { id: 'u3', name: 'Charlie Kim', email: 'charlie@kizuna.edu', role: 'STUDENT' },
    { id: 'u4', name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@kizuna.edu', role: 'MENTOR' },
    { id: 'u5', name: 'Prof. Alan Vance', email: 'alan.vance@kizuna.edu', role: 'MENTOR' },
    { id: 'u6', name: 'Marcus Chen', email: 'marcus.chen@kizuna.edu', role: 'STAFF' },
    { id: 'u7', name: 'Yashas Admin', email: 'admin@kizuna.edu', role: 'ADMIN' },
    { id: 'u8', name: 'David Smith', email: 'david@kizuna.edu', role: 'STUDENT' },
    { id: 'u9', name: 'Elena Rostova', email: 'elena@kizuna.edu', role: 'STUDENT' }
  ];

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find(u => u.id === id);
    return user ? { ...user } : null;
  }
}
