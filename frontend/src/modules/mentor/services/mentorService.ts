import { teamService } from '../../teams/services/teamService'
import { projectService } from '../../projects/services/projectService'
import { progressService } from '../../progress/services/progressService'
import { submissionService } from '../../submissions/services/submissionService'
import type { MentorDashboard, MentorProjectView, MentorTeamView } from '../types/mentor.types'

/**
 * Pub/sub listeners for the mentor service.
 * The service forwards change notifications from the underlying domain services
 * so that mentor UI components can react to any downstream state change.
 */
type Listener = () => void
const listeners: Set<Listener> = new Set()

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener()
    } catch (err) {
      console.error('Error in mentorService listener callback:', err)
    }
  })
}

// Forward domain service changes to mentor listeners.
// Dependency direction: mentorService → domain services (never the reverse).
teamService.subscribe(() => notifyListeners())
projectService.subscribe(() => notifyListeners())
progressService.subscribe(() => notifyListeners())
submissionService.subscribe(() => notifyListeners())

/**
 * Replaceable Service Boundary for Mentor-facing read operations.
 *
 * This service is a pure composition/read layer. It:
 *   - Does NOT store its own state
 *   - Does NOT mutate any domain service
 *   - Is NOT imported by teamService, projectService, progressService, or submissionService
 *
 * Dependency direction:
 *   Mentor UI → mentorService → teamService / projectService / progressService / submissionService
 */
export const mentorService = {
  /**
   * Subscribe to mentor-relevant state changes.
   * Fires whenever any underlying domain service notifies a change.
   */
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  /**
   * Returns mentor-team view objects for all teams assigned to this mentor.
   */
  async getMentorTeams(mentorId: string): Promise<MentorTeamView[]> {
    const teams = await teamService.getTeamsForMentor(mentorId)

    const views: MentorTeamView[] = await Promise.all(
      teams.map(async (team) => {
        const projects = await projectService.getProjectsForTeam(team.id)
        return {
          team,
          projectCount: projects.length
        }
      })
    )

    return views
  },

  /**
   * Returns mentor-project view objects for all projects assigned to this mentor,
   * enriched with team name and derived progress snapshot.
   */
  async getMentorProjects(mentorId: string): Promise<MentorProjectView[]> {
    const projects = await projectService.getProjectsForMentor(mentorId)

    const views: MentorProjectView[] = await Promise.all(
      projects.map(async (project) => {
        const [team, progress] = await Promise.all([
          teamService.getTeam(project.teamId),
          progressService.getProjectProgress(project.id)
        ])
        return {
          project,
          teamName: team?.name ?? 'Unknown Team',
          progress
        }
      })
    )

    return views
  },

  /**
   * Builds a full MentorDashboard aggregation for the given mentor.
   * Derives all counts from underlying domain services — no duplicate counters.
   */
  async getMentorDashboard(mentorId: string): Promise<MentorDashboard> {
    const [assignedTeams, assignedProjects] = await Promise.all([
      mentorService.getMentorTeams(mentorId),
      mentorService.getMentorProjects(mentorId)
    ])

    const activeProjectCount = assignedProjects.filter(
      ({ project }) => project.status === 'ACTIVE'
    ).length

    // Count submissions across all assigned projects that require mentor attention.
    // SUBMITTED and UNDER_REVIEW are both considered pending for this first slice.
    let pendingSubmissionCount = 0
    await Promise.all(
      assignedProjects.map(async ({ project }) => {
        const submissions = await submissionService.getSubmissionsForProject(project.id)
        const pending = submissions.filter(
          (s) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW'
        )
        pendingSubmissionCount += pending.length
      })
    )

    return {
      mentorId,
      assignedTeams,
      assignedProjects,
      activeProjectCount,
      pendingSubmissionCount
    }
  }
}
