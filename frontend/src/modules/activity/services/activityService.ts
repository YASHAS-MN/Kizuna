import type { ActivityEmission, ActivityEvent } from '../types/activity.types'

/**
 * In-memory activity event log.
 * Events are recorded by producers (taskService, commentService, etc.)
 * via emitActivity — this module never inspects task/comment state
 * to reconstruct history.
 */
let mockEvents: ActivityEvent[] = [
  {
    id: 'act_1',
    projectId: 'p1',
    actorId: 'u1',
    actorName: 'Alice Watson',
    type: 'PROJECT_CREATED',
    message: 'created project "Kizuna Platform Foundation"',
    createdAt: '2026-08-10T09:00:00.000Z'
  },
  {
    id: 'act_2',
    projectId: 'p1',
    actorId: 'u1',
    actorName: 'Alice Watson',
    type: 'TEAM_MEMBER_ADDED',
    message: 'added Bob Jenkins to the project team',
    createdAt: '2026-08-10T09:15:00.000Z'
  },
  {
    id: 'act_3',
    projectId: 'p1',
    actorId: 'u1',
    actorName: 'Alice Watson',
    type: 'TEAM_MEMBER_ADDED',
    message: 'added Charlie Kim to the project team',
    createdAt: '2026-08-10T09:16:00.000Z'
  },
  {
    id: 'act_4',
    projectId: 'p1',
    actorId: 'u1',
    actorName: 'Alice Watson',
    type: 'TASK_CREATED',
    message: 'created task "Authentication & Session Module"',
    createdAt: '2026-08-15T10:32:00.000Z',
    taskId: 't_1'
  },
  {
    id: 'act_5',
    projectId: 'p1',
    actorId: 'u1',
    actorName: 'Alice Watson',
    type: 'TASK_STATUS_CHANGED',
    message: 'moved "Authentication & Session Module" from TODO → IN_PROGRESS',
    createdAt: '2026-08-15T14:20:00.000Z',
    taskId: 't_1',
    metadata: { from: 'TODO', to: 'IN_PROGRESS' }
  },
  {
    id: 'act_6',
    projectId: 'p1',
    actorId: 'u1',
    actorName: 'Alice Watson',
    type: 'TASK_CREATED',
    message: 'created task "Dashboard & Navigation UI"',
    createdAt: '2026-08-16T11:15:00.000Z',
    taskId: 't_2'
  },
  {
    id: 'act_7',
    projectId: 'p1',
    actorId: 'u1',
    actorName: 'Alice Watson',
    type: 'TASK_ASSIGNED',
    message: 'assigned "Dashboard & Navigation UI" to Bob Jenkins',
    createdAt: '2026-08-16T11:16:00.000Z',
    taskId: 't_2'
  },
  {
    id: 'act_8',
    projectId: 'p1',
    actorId: 'u1',
    actorName: 'Alice Watson',
    type: 'TASK_CREATED',
    message: 'created task "REST API Integration Testing"',
    createdAt: '2026-08-17T12:04:00.000Z',
    taskId: 't_3'
  },
  {
    id: 'act_9',
    projectId: 'p1',
    actorId: 'u1',
    actorName: 'Alice Watson',
    type: 'TASK_ASSIGNED',
    message: 'assigned "REST API Integration Testing" to Charlie Kim',
    createdAt: '2026-08-17T12:05:00.000Z',
    taskId: 't_3'
  },
  {
    id: 'act_10',
    projectId: 'p1',
    actorId: 's3',
    actorName: 'Charlie Kim',
    type: 'TASK_STATUS_CHANGED',
    message: 'moved "REST API Integration Testing" from TODO → REVIEW',
    createdAt: '2026-08-18T16:40:00.000Z',
    taskId: 't_3',
    metadata: { from: 'TODO', to: 'REVIEW' }
  },
  {
    id: 'act_11',
    projectId: 'p1',
    actorId: 'u1',
    actorName: 'Alice Watson',
    type: 'COMMENT_ADDED',
    message: 'commented on "Authentication & Session Module"',
    createdAt: '2026-08-20T10:12:00.000Z',
    taskId: 't_1'
  },
  {
    id: 'act_12',
    projectId: 'p1',
    actorId: 's2',
    actorName: 'Bob Jenkins',
    type: 'COMMENT_ADDED',
    message: 'commented on "Authentication & Session Module"',
    createdAt: '2026-08-20T10:35:00.000Z',
    taskId: 't_1'
  },
  {
    id: 'act_13',
    projectId: 'p2',
    actorId: 'u8',
    actorName: 'David Smith',
    type: 'PROJECT_CREATED',
    message: 'created project "AI-Powered Resume Analyzer"',
    createdAt: '2026-08-12T08:00:00.000Z'
  }
]

type Listener = () => void
const listeners: Set<Listener> = new Set()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

function resolveActor(event: ActivityEmission): { actorId: string; actorName: string } {
  const actorId = event.actorId?.trim()
  const actorName = event.actorName?.trim()
  return {
    actorId: actorId || 'system',
    actorName: actorName || 'System'
  }
}

/**
 * Service-level emission hook used by other domain services.
 * taskService and commentService call this instead of importing
 * activity collection internals. activityService does not import
 * those services (avoids circular dependencies).
 */
export function emitActivity(event: ActivityEmission): ActivityEvent {
  const actor = resolveActor(event)
  const recorded: ActivityEvent = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    projectId: event.projectId,
    actorId: actor.actorId,
    actorName: actor.actorName,
    type: event.type,
    message: event.message,
    createdAt: event.createdAt || new Date().toISOString(),
    taskId: event.taskId,
    submissionId: event.submissionId,
    metadata: event.metadata
  }

  mockEvents.unshift(recorded)
  notifyListeners()
  return { ...recorded }
}

/**
 * Replaceable Service Boundary for project activity events.
 * NOTE: In a future slice this will read/write persisted activity records.
 */
export const activityService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  async getProjectActivity(projectId: string): Promise<ActivityEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 180))

    if (!projectId || !projectId.trim()) {
      throw new Error('A valid project ID is required to load activity.')
    }

    return mockEvents
      .filter((event) => event.projectId === projectId)
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((event) => ({ ...event, metadata: event.metadata ? { ...event.metadata } : undefined }))
  },

  async addActivity(event: ActivityEmission): Promise<ActivityEvent> {
    await new Promise((resolve) => setTimeout(resolve, 80))

    if (!event.projectId?.trim()) {
      throw new Error('Activity events require a project ID.')
    }
    if (!event.message?.trim()) {
      throw new Error('Activity events require a message.')
    }

    return emitActivity(event)
  }
}
