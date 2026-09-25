import { TaskRepository } from '../repositories/task.repository.js';
import { Task } from '../models/task.js';

export class TaskService {
  constructor(private taskRepository: TaskRepository) {}

  async getTasksForProject(projectId: string): Promise<Task[]> {
    return this.taskRepository.findByProjectId(projectId);
  }

  async getTaskById(id: string): Promise<Task | null> {
    return this.taskRepository.findById(id);
  }

  async createTask(task: Task): Promise<void> {
    return this.taskRepository.createTask(task);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    return this.taskRepository.updateTask(id, updates);
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.taskRepository.deleteTask(id);
  }
}
