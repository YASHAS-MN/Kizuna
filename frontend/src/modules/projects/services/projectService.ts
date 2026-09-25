import type { Project } from '../types/project.types'
import type { ActivityActor } from '../../activity/types/activity.types'
import { teamService } from '../../teams/services/teamService'
import { emitActivity } from '../../activity/services/activityService'
import { fetchProjectsApi, fetchProjectByIdApi, createProjectApi, updateProjectApi } from '../../../services/api/projects'



// Pub/Sub listeners for reactive UI synchronization
type Listener = () => void
const listeners: Set<Listener> = new Set()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

/**
 * Replaceable Service Boundary for Project Management.
 * NOTE: This is an in-memory mock implementation. In a future slice,
 * these methods will make REST API requests to backend endpoints.
 */
export const projectService = {
  /**
   * Subscribe to project state updates.
   */
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  /**
   * Create a new project for a team.
   */
  async createProject(data: {
    name: string
    description: string
    teamId: string
    actor?: ActivityActor
  }): Promise<Project> {
    const newProject = await createProjectApi(data)
    emitActivity({
      projectId: newProject.id,
      actorId: data.actor?.id || 'system',
      actorName: data.actor?.name || 'System',
      type: 'PROJECT_CREATED',
      message: `created project "${newProject.name}"`
    })
    notifyListeners()
    return newProject
  },


  /**
   * Get project details by ID using HTTP API.
   */
  async getProject(projectId: string): Promise<Project | null> {
    try {
      return await fetchProjectByIdApi(projectId)
    } catch (err) {
      if (err instanceof Error && err.message.includes('not found')) {
        return null
      }
      throw err
    }
  },

  /**
   * Get all projects belonging to a specific team.
   */
  async getProjectsForTeam(teamId: string): Promise<Project[]> {
    // AUTHORIZATION ensures the user can access the team first
    await teamService.getTeam(teamId)
    const projects = await fetchProjectsApi()
    return projects.filter((p) => p.teamId === teamId)
  },

  /**
   * Get all projects for teams associated with a specific user.
   */
  async getProjectsForUser(_userId: string): Promise<Project[]> {
    return fetchProjectsApi()
  },

  /**
   * Get all projects assigned to a specific mentor by mentorId.
   */
  async getProjectsForMentor(_mentorId: string): Promise<Project[]> {
    return fetchProjectsApi()
  },

  /**
   * Update project fields.
   */
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const updatedProject = await updateProjectApi(projectId, updates)
    notifyListeners()
    return updatedProject
  }
}
