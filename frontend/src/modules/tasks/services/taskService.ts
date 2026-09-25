import type { Task, TaskStatus, TaskPriority } from '../types/task.types'
import type { ActivityActor } from '../../activity/types/activity.types'
import { emitActivity } from '../../activity/services/activityService'

function actorFields(actor?: ActivityActor) {
  return {
    actorId: actor?.id || 'system',
    actorName: actor?.name || 'System'
  }
}

import { fetchTasksForProjectApi, fetchTaskByIdApi, createTaskApi, updateTaskApi, deleteTaskApi } from '../../../services/api/tasks'
// Pub/Sub listener engine for reactive UI updates
type Listener = () => void
const listeners: Set<Listener> = new Set()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

/**
 * Replaceable Service Boundary for Task Management.
 * NOTE: This is an in-memory mock implementation. In a future slice,
 * these methods will communicate via HTTP API endpoints.
 */
export const taskService = {
  /**
   * Subscribe to task updates.
   */
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  /**
   * Create a new task for a project.
   */
  async createTask(data: {
    projectId: string
    title: string
    description: string
    module: string
    assigneeId: string
    assigneeName: string
    priority: TaskPriority
    status?: TaskStatus
    dueDate?: string
    actor?: ActivityActor
  }): Promise<Task> {
    const newTask = await createTaskApi(data)

    emitActivity({
      projectId: newTask.projectId,
      ...actorFields(data.actor),
      type: 'TASK_CREATED',
      message: `created task "${newTask.title}"`,
      taskId: newTask.id
    })
    notifyListeners()
    return newTask
  },

  /**
   * Get task by ID.
   */
  async getTask(taskId: string): Promise<Task | null> {
    try {
      return await fetchTaskByIdApi(taskId)
    } catch (err) {
      if (err instanceof Error && err.message.includes('not found')) return null
      throw err
    }
  },

  /**
   * Get all tasks for a specific project.
   */
  async getTasksForProject(projectId: string): Promise<Task[]> {
    return fetchTasksForProjectApi(projectId)
  },

  /**
   * Update task status (Kanban column move).
   */
  async updateTaskStatus(taskId: string, status: TaskStatus, actor?: ActivityActor): Promise<Task> {
    const task = await this.getTask(taskId)
    if (!task) throw new Error('Task not found.')

    const previousStatus = task.status
    if (previousStatus === status) {
      return task
    }
    
    const updatedTask = await updateTaskApi(taskId, { status })
    
    emitActivity({
      projectId: updatedTask.projectId,
      ...actorFields(actor),
      type: 'TASK_STATUS_CHANGED',
      message: `moved "${updatedTask.title}" from ${previousStatus} → ${status}`,
      taskId: updatedTask.id,
      metadata: { from: previousStatus, to: status }
    })
    notifyListeners()
    return updatedTask
  },

  /**
   * Reassign task to a different team member.
   */
  async assignTask(
    taskId: string,
    assigneeId: string,
    assigneeName: string,
    actor?: ActivityActor
  ): Promise<Task> {
    const task = await this.getTask(taskId)
    if (!task) throw new Error('Task not found.')

    const previousAssigneeId = task.assigneeId
    const previousAssigneeName = task.assigneeName
    if (previousAssigneeId === assigneeId) {
      return task
    }

    const updatedTask = await updateTaskApi(taskId, { assigneeId, assigneeName })

    const isReassignment = Boolean(previousAssigneeId)
    emitActivity({
      projectId: updatedTask.projectId,
      ...actorFields(actor),
      type: isReassignment ? 'TASK_REASSIGNED' : 'TASK_ASSIGNED',
      message: isReassignment
        ? `reassigned "${updatedTask.title}" from ${previousAssigneeName} to ${assigneeName}`
        : `assigned "${updatedTask.title}" to ${assigneeName}`,
      taskId: updatedTask.id,
      metadata: {
        from: previousAssigneeName || '',
        to: assigneeName
      }
    })
    notifyListeners()
    return updatedTask
  },

  /**
   * Update arbitrary fields of a task.
   */
  async updateTask(taskId: string, updates: Partial<Task>, actor?: ActivityActor): Promise<Task> {
    const task = await this.getTask(taskId)
    if (!task) throw new Error('Task not found.')

    const previous = task
    const updated = await updateTaskApi(taskId, updates)

    if (updates.priority && updates.priority !== previous.priority) {
      emitActivity({
        projectId: updated.projectId,
        ...actorFields(actor),
        type: 'TASK_PRIORITY_CHANGED',
        message: `changed priority of "${updated.title}" from ${previous.priority} → ${updated.priority}`,
        taskId: updated.id,
        metadata: { from: previous.priority, to: updated.priority }
      })
    }

    notifyListeners()
    return updated
  },

  /**
   * Delete a task.
   */
  async deleteTask(taskId: string, actor?: ActivityActor): Promise<boolean> {
    const task = await this.getTask(taskId)
    if (!task) return false

    await deleteTaskApi(taskId)

    emitActivity({
      projectId: task.projectId,
      ...actorFields(actor),
      type: 'TASK_DELETED',
      message: `deleted task "${task.title}"`,
      taskId: task.id
    })
    notifyListeners()
    return true
  }
}
