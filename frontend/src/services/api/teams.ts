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
