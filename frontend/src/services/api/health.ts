import { API_BASE_URL } from './config'

export interface HealthResponse {
  status: string
  service: string
}

export async function fetchApiHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`)
  if (!response.ok) {
    throw new Error(`API health check failed with status ${response.status}`)
  }
  return response.json()
}
