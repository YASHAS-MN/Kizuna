import { TaskRepository } from '../repositories/task.repository.js';
import { Task } from '../models/task.js';
import { ProgressSnapshot, ProgressSummary, ModuleProgress, MemberProgress } from '../models/progress.js';

export class ProgressService {
  constructor(private taskRepository: TaskRepository) {}

  async getProjectProgress(projectId: string): Promise<ProgressSnapshot> {
    const tasks = await this.taskRepository.findByProjectId(projectId);
    return this.deriveProgressSnapshot(tasks);
  }

  private deriveProgressSnapshot(tasks: Task[]): ProgressSnapshot {
    const totalTasks = tasks.length;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let reviewTasks = 0;
    let todoTasks = 0;

    const moduleMap = new Map<string, { total: number; completed: number }>();
    const memberMap = new Map<string, { memberName: string; total: number; completed: number }>();

    for (const task of tasks) {
      const isCompleted = task.status === 'COMPLETED';

      switch (task.status) {
        case 'COMPLETED':
          completedTasks++;
          break;
        case 'IN_PROGRESS':
          inProgressTasks++;
          break;
        case 'REVIEW':
          reviewTasks++;
          break;
        case 'TODO':
        default:
          todoTasks++;
          break;
      }

      // Module grouping
      const moduleName = (task.module || '').trim() || 'General';
      const currentModule = moduleMap.get(moduleName) || { total: 0, completed: 0 };
      currentModule.total++;
      if (isCompleted) {
        currentModule.completed++;
      }
      moduleMap.set(moduleName, currentModule);

      // Member grouping (only if task has an assignee)
      if (task.assigneeId && task.assigneeId.trim()) {
        const currentMember = memberMap.get(task.assigneeId) || {
          memberName: task.assigneeName || 'Unknown Member',
          total: 0,
          completed: 0
        };
        currentMember.total++;
        if (isCompleted) {
          currentMember.completed++;
        }
        if (task.assigneeName) {
          currentMember.memberName = task.assigneeName;
        }
        memberMap.set(task.assigneeId, currentMember);
      }
    }

    const overallCompletionPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const overall: ProgressSummary = {
      totalTasks,
      completedTasks,
      inProgressTasks,
      reviewTasks,
      todoTasks,
      completionPercentage: overallCompletionPercentage
    };

    const modules: ModuleProgress[] = Array.from(moduleMap.entries()).map(([module, stats]) => ({
      module,
      totalTasks: stats.total,
      completedTasks: stats.completed,
      completionPercentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    }));

    const members: MemberProgress[] = Array.from(memberMap.entries()).map(([memberId, stats]) => ({
      memberId,
      memberName: stats.memberName,
      totalTasks: stats.total,
      completedTasks: stats.completed,
      completionPercentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    }));

    return {
      overall,
      modules,
      members
    };
  }
}
