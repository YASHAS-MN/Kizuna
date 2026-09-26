import { API_BASE_URL } from './config'
import type { ProgressSnapshot } from '../../modules/progress/types/progress.types'
import { UnauthorizedError } from '../../modules/authorization/types/authorization.types'

export async function fetchProjectProgressApi(projectId: string): Promise<ProgressSnapshot> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/progress`, {
    method: 'GET',
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) throw new UnauthorizedError()
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to fetch project progress')
  }

  return response.json()
}
