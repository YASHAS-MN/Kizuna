import { sessionService } from '../../../services/sessionService'
import { UnauthorizedError } from '../types/authorization.types'
import type { Team } from '../../teams/types/team.types'
import type { Project } from '../../projects/types/project.types'
import type { Task } from '../../tasks/types/task.types'
import type { Submission } from '../../submissions/types/submission.types'

/**
 * Reusable authorization checks.
 * Uses the global sessionService to determine the acting user.
 * Throws UnauthorizedError if access is denied.
 */
export const authorizationService = {
  /** TEAM AUTHORIZATION **/
  assertCanAccessTeam(team: Team) {
    const user = sessionService.getCurrentUser()
    if (!user) throw new UnauthorizedError()

    if (user.role === 'MENTOR') {
      if (team.mentorId !== user.id) {
        throw new UnauthorizedError()
      }
      return
    }

    if (user.role === 'STUDENT') {
      if (!team.members.some((m) => m.userId === user.id)) {
        throw new UnauthorizedError()
      }
      return
    }

    throw new UnauthorizedError()
  },

  assertCanModifyTeam(team: Team) {
    const user = sessionService.getCurrentUser()
    if (!user) throw new UnauthorizedError()

    if (user.role === 'MENTOR') {
      throw new UnauthorizedError('Mentors cannot modify teams.')
    }

    if (user.role === 'STUDENT') {
      if (!team.members.some((m) => m.userId === user.id)) {
        throw new UnauthorizedError()
      }
      return
    }

    throw new UnauthorizedError()
  },

  /** PROJECT AUTHORIZATION **/
  assertCanAccessProject(project: Project, team: Team) {
    const user = sessionService.getCurrentUser()
    if (!user) throw new UnauthorizedError()

    if (user.role === 'MENTOR') {
      if (project.mentorId !== user.id && team.mentorId !== user.id) {
        throw new UnauthorizedError()
      }
      return
    }

    if (user.role === 'STUDENT') {
      if (!team.members.some((m) => m.userId === user.id)) {
        throw new UnauthorizedError()
      }
      return
    }

    throw new UnauthorizedError()
  },

  assertCanModifyProject(_project: Project, team: Team) {
    const user = sessionService.getCurrentUser()
    if (!user) throw new UnauthorizedError()

    if (user.role === 'MENTOR') {
      throw new UnauthorizedError('Mentors cannot modify projects.')
    }

    if (user.role === 'STUDENT') {
      if (!team.members.some((m) => m.userId === user.id)) {
        throw new UnauthorizedError()
      }
      return
    }

    throw new UnauthorizedError()
  },

  /** TASK AUTHORIZATION **/
  assertCanAccessTask(_task: Task, project: Project, team: Team) {
    // Task access derives completely from Project access
    this.assertCanAccessProject(project, team)
  },

  assertCanModifyTask(_task: Task, project: Project, team: Team) {
    // Task modification derives from Project modification
    this.assertCanModifyProject(project, team)
  },

  /** SUBMISSION AUTHORIZATION **/
  assertCanAccessSubmission(_submission: Submission, project: Project, team: Team) {
    // Submission access derives from Project access
    this.assertCanAccessProject(project, team)
  },

  assertCanModifySubmission(_submission: Submission, project: Project, team: Team) {
    const user = sessionService.getCurrentUser()
    if (!user) throw new UnauthorizedError()

    if (user.role === 'MENTOR') {
      throw new UnauthorizedError('Mentors cannot modify student submissions.')
    }

    if (user.role === 'STUDENT') {
      this.assertCanModifyProject(project, team)
      return
    }

    throw new UnauthorizedError()
  },

  assertCanReviewSubmission(_submission: Submission, project: Project, team: Team) {
    const user = sessionService.getCurrentUser()
    if (!user) throw new UnauthorizedError()

    if (user.role !== 'MENTOR') {
      throw new UnauthorizedError('Only mentors can review submissions.')
    }

    // Mentor must have access to the project
    if (project.mentorId !== user.id && team.mentorId !== user.id) {
      throw new UnauthorizedError()
    }
  },

  /** ACTIVITY/PROGRESS/COMMENTS AUTHORIZATION **/
  // Accessing these sub-resources derives from Project access
  assertCanAccessProjectResources(project: Project, team: Team) {
    this.assertCanAccessProject(project, team)
  },

  assertCanModifyProjectResources(project: Project, team: Team) {
    this.assertCanModifyProject(project, team)
  }
}
