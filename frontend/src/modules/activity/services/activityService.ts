import type { ActivityEmission, ActivityEvent } from '../types/activity.types'
import { fetchProjectActivityApi, createActivityApi } from '../../../services/api/activity'

type Listener = () => void
const listeners: Set<Listener> = new Set()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

/**
 * Service-level emission hook used by other domain services.
 * taskService, commentService, etc. call this instead of importing
 * activity collection internals. activityService does not import
 * those services (avoids circular dependencies).
 */
export function emitActivity(event: ActivityEmission): ActivityEvent {
  const recorded: ActivityEvent = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    projectId: event.projectId,
    actorId: event.actorId || 'system',
    actorName: event.actorName || 'System',
    type: event.type,
    message: event.message,
    createdAt: event.createdAt || new Date().toISOString(),
    taskId: event.taskId,
    submissionId: event.submissionId,
    metadata: event.metadata
  }

  createActivityApi(event)
    .then(() => {
      notifyListeners()
    })
    .catch((err) => {
      console.error('Failed to persist activity event:', err)
    })

  notifyListeners()
  return recorded
}

/**
 * Replaceable Service Boundary for project activity events.
 * Persists and fetches activity records via backend APIs.
 */
export const activityService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  async getProjectActivity(projectId: string): Promise<ActivityEvent[]> {
    if (!projectId || !projectId.trim()) {
      throw new Error('A valid project ID is required to load activity.')
    }
    return fetchProjectActivityApi(projectId)
  },

  async addActivity(event: ActivityEmission): Promise<ActivityEvent> {
    if (!event.projectId?.trim()) {
      throw new Error('Activity events require a project ID.')
    }
    if (!event.message?.trim()) {
      throw new Error('Activity events require a message.')
    }
    const created = await createActivityApi(event)
    notifyListeners()
    return created
  }
}
