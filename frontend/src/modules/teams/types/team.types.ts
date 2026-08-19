export type TeamRole = 'TEAM_LEAD' | 'MEMBER'

export interface TeamMember {
  userId: string
  name: string
  usn: string
  role: TeamRole
}

export interface Team {
  id: string
  name: string
  createdAt: string
  ownerId: string
  members: TeamMember[]
  projectPlaceholder?: string
  mentorPlaceholder?: string
}
