import { Task, TaskStatus, TaskPriority } from '../models/task.js';

export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  findByProjectId(projectId: string): Promise<Task[]>;
  createTask(task: Task): Promise<void>;
  updateTask(id: string, updates: Partial<Task>): Promise<void>;
  deleteTask(id: string): Promise<boolean>;
}

export class InMemoryTaskRepository implements TaskRepository {
  async findById(id: string): Promise<Task | null> { return null; }
  async findByProjectId(projectId: string): Promise<Task[]> { return []; }
  async createTask(task: Task): Promise<void> {}
  async updateTask(id: string, updates: Partial<Task>): Promise<void> {}
  async deleteTask(id: string): Promise<boolean> { return false; }
}
