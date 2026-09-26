import type { Task } from '../../tasks/types/task.types'
import { taskService } from '../../tasks/services/taskService'
import type {
  ProgressSummary,
  ModuleProgress,
  MemberProgress,
  ProgressSnapshot
} from '../types/progress.types'
import { fetchProjectProgressApi } from '../../../services/api/progress'

type Listener = () => void
const listeners: Set<Listener> = new Set()

// Automatically propagate changes from taskService to progress listeners
taskService.subscribe(() => {
  listeners.forEach((listener) => {
    try {
      listener()
    } catch (err) {
      console.error('Error in progressService listener callback:', err)
    }
  })
})

/**
 * Pure derivation function: computes a ProgressSnapshot from an array of tasks.
 * Maintained for local computations and utility purposes.
 */
export function deriveProgressSnapshot(tasks: Task[]): ProgressSnapshot {
  const totalTasks = tasks.length
  let completedTasks = 0
  let inProgressTasks = 0
  let reviewTasks = 0
  let todoTasks = 0

  const moduleMap = new Map<string, { total: number; completed: number }>()
  const memberMap = new Map<string, { memberName: string; total: number; completed: number }>()

  for (const task of tasks) {
    const isCompleted = task.status === 'COMPLETED'

    // Status counts
    switch (task.status) {
      case 'COMPLETED':
        completedTasks++
        break
      case 'IN_PROGRESS':
        inProgressTasks++
        break
      case 'REVIEW':
        reviewTasks++
        break
      case 'TODO':
      default:
        todoTasks++
        break
    }

    // Module grouping
    const moduleName = (task.module || '').trim() || 'General'
    const currentModule = moduleMap.get(moduleName) || { total: 0, completed: 0 }
    currentModule.total++
    if (isCompleted) {
      currentModule.completed++
    }
    moduleMap.set(moduleName, currentModule)

    // Member grouping (only if task has an assignee)
    if (task.assigneeId && task.assigneeId.trim()) {
      const currentMember = memberMap.get(task.assigneeId) || {
        memberName: task.assigneeName || 'Unknown Member',
        total: 0,
        completed: 0
      }
      currentMember.total++
      if (isCompleted) {
        currentMember.completed++
      }
      if (task.assigneeName) {
        currentMember.memberName = task.assigneeName
      }
      memberMap.set(task.assigneeId, currentMember)
    }
  }

  const overallCompletionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const overall: ProgressSummary = {
    totalTasks,
    completedTasks,
    inProgressTasks,
    reviewTasks,
    todoTasks,
    completionPercentage: overallCompletionPercentage
  }

  const modules: ModuleProgress[] = Array.from(moduleMap.entries()).map(([module, stats]) => ({
    module,
    totalTasks: stats.total,
    completedTasks: stats.completed,
    completionPercentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
  }))

  const members: MemberProgress[] = Array.from(memberMap.entries()).map(([memberId, stats]) => ({
    memberId,
    memberName: stats.memberName,
    totalTasks: stats.total,
    completedTasks: stats.completed,
    completionPercentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
  }))

  return {
    overall,
    modules,
    members
  }
}

/**
 * Service Boundary for Progress Tracking.
 * Fetches calculated progress metrics from the backend API.
 */
export const progressService = {
  /**
   * Subscribe to progress state changes (fires when taskService updates).
   */
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  /**
   * Returns a progress snapshot for a project fetched from the backend API.
   */
  async getProjectProgress(projectId: string): Promise<ProgressSnapshot> {
    if (!projectId || !projectId.trim()) {
      throw new Error('A valid project ID is required to load progress.')
    }
    return fetchProjectProgressApi(projectId)
  }
}
