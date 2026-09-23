export interface ProgressSummary {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  reviewTasks: number
  todoTasks: number
  completionPercentage: number
}

export interface ModuleProgress {
  module: string
  totalTasks: number
  completedTasks: number
  completionPercentage: number
}

export interface MemberProgress {
  memberId: string
  memberName: string
  totalTasks: number
  completedTasks: number
  completionPercentage: number
}

export interface ProgressSnapshot {
  overall: ProgressSummary
  modules: ModuleProgress[]
  members: MemberProgress[]
}
