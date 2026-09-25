import { API_BASE_URL } from './config'
import type { Task } from '../../modules/tasks/types/task.types'
import { UnauthorizedError } from '../../modules/authorization/types/authorization.types'

export async function fetchTasksForProjectApi(projectId: string): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/tasks?projectId=${projectId}`, {
    method: 'GET',
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) throw new UnauthorizedError()
    throw new Error('Failed to fetch tasks')
  }

  return response.json()
}

export async function fetchTaskByIdApi(taskId: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'GET',
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) throw new UnauthorizedError()
    throw new Error(`Failed to fetch task with ID ${taskId}`)
  }

  return response.json()
}

export async function createTaskApi(data: any): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) throw new UnauthorizedError()
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create task')
  }

  return response.json()
}

export async function updateTaskApi(taskId: string, updates: any): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) throw new UnauthorizedError()
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update task')
  }

  return response.json()
}

export async function deleteTaskApi(taskId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) throw new UnauthorizedError()
    throw new Error('Failed to delete task')
  }
}
