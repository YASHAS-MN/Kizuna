import { API_BASE_URL } from './config'
import type { Submission } from '../../modules/submissions/types/submission.types'
import { UnauthorizedError } from '../../modules/authorization/types/authorization.types'

export async function fetchSubmissionsForProjectApi(projectId: string): Promise<Submission[]> {
  const response = await fetch(`${API_BASE_URL}/submissions?projectId=${encodeURIComponent(projectId)}`, {
    method: 'GET',
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError()
    throw new Error('Failed to fetch submissions')
  }

  return response.json()
}

export async function fetchSubmissionByIdApi(submissionId: string): Promise<Submission> {
  const response = await fetch(`${API_BASE_URL}/submissions/${encodeURIComponent(submissionId)}`, {
    method: 'GET',
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError()
    throw new Error(`Failed to fetch submission with ID ${submissionId}`)
  }

  return response.json()
}

export async function createSubmissionApi(data: {
  projectId: string
  title: string
  description: string
}): Promise<Submission> {
  const response = await fetch(`${API_BASE_URL}/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError()
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to create submission')
  }

  return response.json()
}

export async function updateSubmissionApi(
  submissionId: string,
  updates: { title: string; description: string }
): Promise<Submission> {
  const response = await fetch(`${API_BASE_URL}/submissions/${encodeURIComponent(submissionId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError()
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to update submission')
  }

  return response.json()
}

export async function submitSubmissionApi(submissionId: string): Promise<Submission> {
  const response = await fetch(`${API_BASE_URL}/submissions/${encodeURIComponent(submissionId)}/submit`, {
    method: 'POST',
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError()
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to submit submission')
  }

  return response.json()
}

