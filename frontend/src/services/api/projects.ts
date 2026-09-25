import { API_BASE_URL } from './config'
import type { Project } from '../../modules/projects/types/project.types'
import { UnauthorizedError } from '../../modules/authorization/types/authorization.types'

export async function fetchProjectsApi(): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'GET',
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) {
      throw new UnauthorizedError()
    }
    throw new Error('Failed to fetch projects')
  }

  return response.json()
}

export async function fetchProjectByIdApi(projectId: string): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'GET',
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) {
      throw new UnauthorizedError()
    }
    throw new Error(`Failed to fetch project with ID ${projectId}`)
  }

  return response.json()
}
