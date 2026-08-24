import type { Task, TaskStatus, TaskPriority } from '../types/task.types'
import { projectService } from '../../projects/services/projectService'
import { teamService } from '../../teams/services/teamService'

/**
 * In-memory mock task repository for frontend prototype.
 * Seeded with tasks for existing project 'p1' (Kizuna Platform Foundation).
 */
let mockTasks: Task[] = [
  {
    id: 't_1',
    projectId: 'p1',
    title: 'Authentication & Session Module',
    description: 'Implement secure session-based authentication with crypto.scrypt password hashing and HttpOnly cookies.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assigneeId: 'u1',
    assigneeName: 'Alice Watson',
    module: 'Backend',
    createdAt: '2026-08-15T00:00:00.000Z',
    dueDate: '2026-08-30'
  },
  {
    id: 't_2',
    projectId: 'p1',
    title: 'Dashboard & Navigation UI',
    description: 'Design responsive command center header navbar, workspace quick links, and activity feed widgets.',
    status: 'TODO',
    priority: 'MEDIUM',
    assigneeId: 's2',
    assigneeName: 'Bob Jenkins',
    module: 'Frontend',
    createdAt: '2026-08-16T00:00:00.000Z',
    dueDate: '2026-09-02'
  },
  {
    id: 't_3',
    projectId: 'p1',
    title: 'REST API Integration Testing',
    description: 'Write end-to-end integration tests verifying CORS credentials, status codes, and error payloads.',
    status: 'REVIEW',
    priority: 'HIGH',
    assigneeId: 's3',
    assigneeName: 'Charlie Kim',
    module: 'Testing',
    createdAt: '2026-08-17T00:00:00.000Z',
    dueDate: '2026-08-28'
  }
]

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
  }): Promise<Task> {
    await new Promise((resolve) => setTimeout(resolve, 250))

    const cleanTitle = data.title.trim()
    const cleanDesc = data.description.trim()
    const cleanModule = data.module.trim()

    if (!cleanTitle) {
      throw new Error('Task title is required.')
    }
    if (!cleanDesc) {
      throw new Error('Task description is required.')
    }
    if (!cleanModule) {
      throw new Error('Module/Responsibility tag is required.')
    }
    if (!data.assigneeId) {
      throw new Error('Task assignee must be selected.')
    }

    // Verify project exists
    const project = await projectService.getProject(data.projectId)
    if (!project) {
      throw new Error(`Project with ID "${data.projectId}" does not exist.`)
    }

    // Verify assignee belongs to project's team
    const team = await teamService.getTeam(project.teamId)
    if (team) {
      const isMember = team.members.some((m) => m.userId === data.assigneeId)
      if (!isMember) {
        throw new Error(`Assignee "${data.assigneeName}" does not belong to the project team "${team.name}".`)
      }
    }

    const newTask: Task = {
      id: `t_${Date.now()}`,
      projectId: data.projectId,
      title: cleanTitle,
      description: cleanDesc,
      status: data.status || 'TODO',
      priority: data.priority,
      assigneeId: data.assigneeId,
      assigneeName: data.assigneeName,
      module: cleanModule,
      createdAt: new Date().toISOString(),
      dueDate: data.dueDate || undefined
    }

    mockTasks.unshift(newTask)
    notifyListeners()
    return { ...newTask }
  },

  /**
   * Get task by ID.
   */
  async getTask(taskId: string): Promise<Task | null> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    const task = mockTasks.find((t) => t.id === taskId)
    return task ? { ...task } : null
  },

  /**
   * Get all tasks for a specific project.
   */
  async getTasksForProject(projectId: string): Promise<Task[]> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return mockTasks.filter((t) => t.projectId === projectId).map((t) => ({ ...t }))
  },

  /**
   * Update task status (Kanban column move).
   */
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const task = mockTasks.find((t) => t.id === taskId)
    if (!task) {
      throw new Error('Task not found.')
    }
    task.status = status
    notifyListeners()
    return { ...task }
  },

  /**
   * Reassign task to a different team member.
   */
  async assignTask(taskId: string, assigneeId: string, assigneeName: string): Promise<Task> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const task = mockTasks.find((t) => t.id === taskId)
    if (!task) {
      throw new Error('Task not found.')
    }

    // Verify new assignee belongs to team
    const project = await projectService.getProject(task.projectId)
    if (project) {
      const team = await teamService.getTeam(project.teamId)
      if (team && !team.members.some((m) => m.userId === assigneeId)) {
        throw new Error(`User "${assigneeName}" is not a member of team "${team.name}".`)
      }
    }

    task.assigneeId = assigneeId
    task.assigneeName = assigneeName
    notifyListeners()
    return { ...task }
  },

  /**
   * Update arbitrary fields of a task.
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const index = mockTasks.findIndex((t) => t.id === taskId)
    if (index === -1) {
      throw new Error('Task not found.')
    }

    mockTasks[index] = {
      ...mockTasks[index],
      ...updates
    }

    notifyListeners()
    return { ...mockTasks[index] }
  },

  /**
   * Delete a task.
   */
  async deleteTask(taskId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const initialLength = mockTasks.length
    mockTasks = mockTasks.filter((t) => t.id !== taskId)
    if (mockTasks.length !== initialLength) {
      notifyListeners()
      return true
    }
    return false
  }
}
