import type { Team, TeamMember, TeamRole } from '../types/team.types'

/**
 * In-memory team dataset for frontend prototype testing.
 */
let mockTeams: Team[] = [
  {
    id: 't1',
    name: 'Team Alpha',
    createdAt: '2026-08-01T00:00:00.000Z',
    ownerId: 'u1',
    members: [
      { userId: 'u1', name: 'Alice Watson', usn: '1RV23CS000', role: 'TEAM_LEAD' },
      { userId: 's2', name: 'Bob Jenkins', usn: '1RV23CS002', role: 'MEMBER' },
      { userId: 's3', name: 'Charlie Kim', usn: '1RV23IS015', role: 'MEMBER' }
    ],
    projectPlaceholder: 'Kizuna Platform Foundation',
    mentorPlaceholder: 'Dr. Sarah Jenkins'
  },
  {
    id: 't2',
    name: 'Team Beta',
    createdAt: '2026-08-05T00:00:00.000Z',
    ownerId: 'u8',
    members: [
      { userId: 'u8', name: 'David Smith', usn: '1RV23EC042', role: 'TEAM_LEAD' },
      { userId: 's5', name: 'Elena Rostova', usn: '1RV23CS088', role: 'MEMBER' }
    ],
    projectPlaceholder: 'AI-Powered Resume Analyzer',
    mentorPlaceholder: 'Prof. Alan Vance'
  }
]

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
    await new Promise((resolve) => setTimeout(resolve, 300))

    const cleanName = name.trim()
    if (!cleanName) {
      throw new Error('Team name is required.')
    }

    // Validation: Duplicate team name check
    const existing = mockTeams.find((t) => t.name.toLowerCase() === cleanName.toLowerCase())
    if (existing) {
      throw new Error(`A team named "${cleanName}" already exists. Please choose a different team name.`)
    }

    // Build member roster: Creator is TEAM_LEAD, collaborators are MEMBER
    const members: TeamMember[] = [
      {
        userId: owner.id,
        name: owner.name,
        usn: owner.usn,
        role: 'TEAM_LEAD'
      }
    ]

    // Append invited collaborators (filtering duplicates)
    for (const u of memberUsers) {
      if (!members.some((m) => m.userId === u.id)) {
        members.push({
          userId: u.id,
          name: u.name,
          usn: u.usn,
          role: 'MEMBER'
        })
      }
    }

    const newTeam: Team = {
      id: `t_${Date.now()}`,
      name: cleanName,
      createdAt: new Date().toISOString(),
      ownerId: owner.id,
      members,
      projectPlaceholder: 'Not assigned yet',
      mentorPlaceholder: 'Not assigned yet'
    }

    mockTeams.unshift(newTeam)
    notifyListeners()
    return { ...newTeam }
  },

  /**
   * Fetch details for a specific team by ID.
   */
  async getTeam(teamId: string): Promise<Team | null> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const team = mockTeams.find((t) => t.id === teamId)
    return team ? JSON.parse(JSON.stringify(team)) : null
  },

  /**
   * Fetch all teams associated with a specific user.
   */
  async getTeamsForUser(userId: string): Promise<Team[]> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const teams = mockTeams.filter(
      (t) => t.members.some((m) => m.userId === userId) || userId === 'u1' || userId === 'u_active'
    )
    return JSON.parse(JSON.stringify(teams))
  },

  /**
   * Add a member to a team.
   */
  async addMember(
    teamId: string,
    user: { id: string; name: string; usn: string },
    role: TeamRole = 'MEMBER'
  ): Promise<Team> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const team = mockTeams.find((t) => t.id === teamId)
    if (!team) {
      throw new Error('Team not found.')
    }

    if (team.members.some((m) => m.userId === user.id)) {
      throw new Error('User is already a member of this team.')
    }

    team.members.push({
      userId: user.id,
      name: user.name,
      usn: user.usn,
      role
    })

    notifyListeners()
    return JSON.parse(JSON.stringify(team))
  },

  /**
   * Update a member's role within a team (between TEAM_LEAD and MEMBER).
   */
  async updateMemberRole(teamId: string, userId: string, newRole: TeamRole): Promise<Team> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const team = mockTeams.find((t) => t.id === teamId)
    if (!team) {
      throw new Error('Team not found.')
    }

    const member = team.members.find((m) => m.userId === userId)
    if (!member) {
      throw new Error('Member not found in team.')
    }

    member.role = newRole
    notifyListeners()
    return JSON.parse(JSON.stringify(team))
  },

  /**
   * Remove a member from a team.
   */
  async removeMember(teamId: string, userId: string): Promise<Team> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const team = mockTeams.find((t) => t.id === teamId)
    if (!team) {
      throw new Error('Team not found.')
    }

    team.members = team.members.filter((m) => m.userId !== userId)
    notifyListeners()
    return JSON.parse(JSON.stringify(team))
  }
}
