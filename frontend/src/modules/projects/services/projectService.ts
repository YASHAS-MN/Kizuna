import type { Project } from '../types/project.types'
import type { ActivityActor } from '../../activity/types/activity.types'
import { teamService } from '../../teams/services/teamService'
import { emitActivity } from '../../activity/services/activityService'
import { authorizationService } from '../../authorization/services/authorizationService'
import { fetchProjectsApi, fetchProjectByIdApi } from '../../../services/api/projects'

/**
 * In-memory mock database for projects during frontend prototyping.
 * Seeded with projects for existing teams (t1 Team Alpha, t2 Team Beta).
 */
let mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Kizuna Platform Foundation',
    description: 'Initial scaffolding, modular architecture, and structural styling for the student collaborative ecosystem.',
    status: 'ACTIVE',
    teamId: 't1',
    createdAt: '2026-08-10T00:00:00.000Z',
    mentorInfo: 'Dr. Sarah Jenkins',
    mentorId: 'u4'
  },
  {
    id: 'p2',
    name: 'AI-Powered Resume Analyzer',
    description: 'An AI-driven parsing assistant that checks resume alignment with tech job descriptions and provides automated feedback.',
    status: 'PLANNING',
    teamId: 't2',
    createdAt: '2026-08-12T00:00:00.000Z',
    mentorInfo: 'Prof. Alan Vance',
    mentorId: 'u5'
  }
]

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
    await new Promise((resolve) => setTimeout(resolve, 300))

    // AUTHORIZATION
    const team = await teamService.getTeam(data.teamId) // Throws if team is inaccessible
    if (!team) throw new Error('Project team not found')
    authorizationService.assertCanModifyTeam(team)

    const cleanName = data.name.trim()
    const cleanDesc = data.description.trim()

    if (!cleanName) {
      throw new Error('Project name is required.')
    }
    if (!cleanDesc) {
      throw new Error('Project description is required.')
    }
    if (!data.teamId) {
      throw new Error('Associated team must be selected.')
    }

    // Check duplicate project name within the same team
    const duplicate = mockProjects.find(
      (p) => p.teamId === data.teamId && p.name.toLowerCase() === cleanName.toLowerCase()
    )
    if (duplicate) {
      throw new Error(`A project named "${cleanName}" already exists for this team.`)
    }

    const newProject: Project = {
      id: `p_${Date.now()}`,
      name: cleanName,
      description: cleanDesc,
      status: 'PLANNING',
      teamId: data.teamId,
      createdAt: new Date().toISOString(),
      mentorInfo: 'Not assigned yet'
    }

    mockProjects.unshift(newProject)
    emitActivity({
      projectId: newProject.id,
      actorId: data.actor?.id || 'system',
      actorName: data.actor?.name || 'System',
      type: 'PROJECT_CREATED',
      message: `created project "${newProject.name}"`
    })
    notifyListeners()
    return { ...newProject }
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
    await new Promise((resolve) => setTimeout(resolve, 200))
    const index = mockProjects.findIndex((p) => p.id === projectId)
    if (index === -1) {
      throw new Error('Project not found.')
    }

    const project = mockProjects[index]
    const team = await teamService.getTeam(project.teamId) // Throws if team is inaccessible
    if (!team) throw new Error('Project team not found')

    // AUTHORIZATION
    authorizationService.assertCanModifyProject(project, team)

    mockProjects[index] = {
      ...mockProjects[index],
      ...updates
    }

    notifyListeners()
    return { ...mockProjects[index] }
  }
}
