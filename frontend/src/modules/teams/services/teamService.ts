import type { Team, TeamRole } from '../types/team.types'
import { fetchTeamsApi, fetchTeamByIdApi, createTeamApi, addMemberApi, updateMemberRoleApi, removeMemberApi } from '../../../services/api/teams'


// Pub/sub listeners for reactive UI sync across team modules
type Listener = () => void
const listeners: Set<Listener> = new Set()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

/**
 * Replaceable Service Boundary for Team Formation & Management.
 * NOTE: This is an in-memory mock implementation. In a future slice,
 * these functions will issue REST API calls to the backend.
 */
export const teamService = {
  /**
   * Subscribe to team state updates.
   */
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  /**
   * Create a new team workspace.
   */
  async createTeam(
    name: string,
    owner: { id: string; name: string; usn: string },
    memberUsers: { id: string; name: string; usn: string }[]
  ): Promise<Team> {
    const newTeam = await createTeamApi(name, owner, memberUsers)
    notifyListeners()
    return newTeam
  },


  /**
   * Fetch details for a specific team by ID using the HTTP API.
   */
  async getTeam(teamId: string): Promise<Team | null> {
    try {
      return await fetchTeamByIdApi(teamId)
    } catch (err) {
      if (err instanceof Error && err.message.includes('not found')) {
        return null
      }
      throw err
    }
  },

  /**
   * Fetch all teams associated with a specific user.
   */
  async getTeamsForUser(_userId: string): Promise<Team[]> {
    return fetchTeamsApi()
  },

  /**
   * Fetch all teams assigned to a specific mentor.
   */
  async getTeamsForMentor(_mentorId: string): Promise<Team[]> {
    return fetchTeamsApi()
  },

  /**
   * Add a member to a team.
   */
  async addMember(
    teamId: string,
    user: { id: string; name: string; usn: string },
    role: TeamRole = 'MEMBER'
  ): Promise<Team> {
    await addMemberApi(teamId, user, role)
    notifyListeners()
    return this.getTeam(teamId) as Promise<Team>
  },

  /**
   * Update a member's role within a team (between TEAM_LEAD and MEMBER).
   */
  async updateMemberRole(teamId: string, userId: string, newRole: TeamRole): Promise<Team> {
    await updateMemberRoleApi(teamId, userId, newRole)
    notifyListeners()
    return this.getTeam(teamId) as Promise<Team>
  },

  /**
   * Remove a member from a team.
   */
  async removeMember(teamId: string, userId: string): Promise<Team> {
    await removeMemberApi(teamId, userId)
    notifyListeners()
    return this.getTeam(teamId) as Promise<Team>
  }
}
