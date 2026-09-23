export type ActivityEventType =
  | 'TASK_CREATED'
  | 'TASK_ASSIGNED'
  | 'TASK_REASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_PRIORITY_CHANGED'
  | 'TASK_DELETED'
  | 'PROJECT_CREATED'
  | 'TEAM_MEMBER_ADDED'
  | 'TEAM_MEMBER_REMOVED'
  | 'TEAM_MEMBER_ROLE_CHANGED'
  | 'COMMENT_ADDED'
  | 'COMMENT_DELETED'

export interface ActivityActor {
  id: string
  name: string
}

export interface ActivityEvent {
  id: string
  projectId: string
  actorId: string
  actorName: string
  type: ActivityEventType
  message: string
  createdAt: string
  taskId?: string
  metadata?: Record<string, string>
}

export type ActivityEmission = Omit<ActivityEvent, 'id' | 'createdAt'> & {
  createdAt?: string
}
