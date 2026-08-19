import { API_BASE_URL } from './config'

export interface User {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'MENTOR' | 'STAFF' | 'ADMIN'
}

export interface LoginResponse {
  user: User
}

export interface MeResponse {
  user: User | null
}

/**
 * Sends a login request with credentials support to attach the HttpOnly cookie.
 */
export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  })

  if (!response.ok) {
    const errPayload = await response.json().catch(() => ({}))
    throw new Error(errPayload.message || 'Invalid credentials')
  }

  return response.json()
}

/**
 * Invalidates the user session.
 */
export async function logoutApi(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('Logout failed')
  }
}

/**
 * Fetches the currently active session user.
 */
export async function fetchCurrentUserMeApi(): Promise<MeResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 401) {
      return { user: null }
    }
    throw new Error('Failed to resolve current session')
  }

  return response.json()
}
