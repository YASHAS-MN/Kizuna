import { API_BASE_URL } from './config'
import type { Team } from '../../modules/teams/types/team.types'
import { UnauthorizedError } from '../../modules/authorization/types/authorization.types'

export async function fetchTeamsApi(): Promise<Team[]> {
  const response = await fetch(`${API_BASE_URL}/teams`, {
    method: 'GET',
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) {
      throw new UnauthorizedError()
    }
    throw new Error('Failed to fetch teams')
  }

  return response.json()
}

export async function fetchTeamByIdApi(teamId: string): Promise<Team> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
    method: 'GET',
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) {
      throw new UnauthorizedError()
    }
    throw new Error(`Failed to fetch team with ID ${teamId}`)
  }

  return response.json()
}

export async function createTeamApi(name: string, owner: any, members: any[]): Promise<Team> {
  const response = await fetch(`${API_BASE_URL}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, owner, members }),
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) throw new UnauthorizedError()
    throw new Error('Failed to create team')
  }

  return response.json()
}

export async function addMemberApi(teamId: string, user: any, role: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, role }),
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) throw new UnauthorizedError()
    throw new Error('Failed to add member')
  }
}

export async function updateMemberRoleApi(teamId: string, userId: string, newRole: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/members/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newRole }),
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) throw new UnauthorizedError()
    throw new Error('Failed to update member role')
  }
}

export async function removeMemberApi(teamId: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/members/${userId}`, {
    method: 'DELETE',
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) throw new UnauthorizedError()
    throw new Error('Failed to remove member')
  }
}
