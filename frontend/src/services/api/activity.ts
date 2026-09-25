import { API_BASE_URL } from './config'
import type { ActivityEvent, ActivityEmission } from '../../modules/activity/types/activity.types'
import { UnauthorizedError } from '../../modules/authorization/types/authorization.types'

export async function fetchProjectActivityApi(projectId: string): Promise<ActivityEvent[]> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/activity`, {
    method: 'GET',
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) throw new UnauthorizedError()
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to fetch project activity')
  }

  return response.json()
}

export async function createActivityApi(event: ActivityEmission): Promise<ActivityEvent> {
  const response = await fetch(`${API_BASE_URL}/projects/${event.projectId}/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) throw new UnauthorizedError()
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to record activity')
  }

  return response.json()
}
