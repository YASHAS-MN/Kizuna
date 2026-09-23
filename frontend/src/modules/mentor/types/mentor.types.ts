import type { Team } from '../../teams/types/team.types'
import type { Project } from '../../projects/types/project.types'
import type { ProgressSnapshot } from '../../progress/types/progress.types'

/**
 * A mentor-facing view of a single team, enriched with derived project count.
 * This is a UI-aggregation type — it does not replace the base Team domain model.
 */
export interface MentorTeamView {
  team: Team
  projectCount: number
}

/**
 * A mentor-facing view of a single project, enriched with derived progress.
 * This is a UI-aggregation type — it does not replace the base Project domain model.
 */
export interface MentorProjectView {
  project: Project
  teamName: string
  progress: ProgressSnapshot
}

/**
 * Aggregated dashboard data for a mentor's overview page.
 * All counters are derived from underlying domain services — they are
 * not stored independently in this type.
 */
export interface MentorDashboard {
  mentorId: string
  assignedTeams: MentorTeamView[]
  assignedProjects: MentorProjectView[]
  activeProjectCount: number
  pendingSubmissionCount: number
}
