export interface RegisterData {
  fullName: string
  usn: string
  email: string
  password: string
  confirmPassword: string
}

export interface RegisterResult {
  success: boolean
  message: string
  user?: {
    id: string
    name: string
    usn: string
    email: string
  }
}

/**
 * Replaceable Service Boundary for user registration.
 * NOTE: This is a temporary mock implementation. In a future slice,
 * this function will be replaced with an HTTP request to POST /api/auth/register.
 */
export async function registerUser(data: RegisterData): Promise<RegisterResult> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Basic validation
  if (!data.fullName.trim()) {
    throw new Error('Full Name is required.')
  }
  if (!data.usn.trim()) {
    throw new Error('USN (University Seat Number) is required.')
  }
  if (!data.email.trim() || !data.email.includes('@')) {
    throw new Error('A valid email address is required.')
  }
  if (!data.password || data.password.length < 6) {
    throw new Error('Password must be at least 6 characters long.')
  }
  if (data.password !== data.confirmPassword) {
    throw new Error('Passwords do not match.')
  }

  // Temporary mock success response
  return {
    success: true,
    message: 'Registration successful! You can now log in with your credentials.',
    user: {
      id: `u_${Date.now()}`,
      name: data.fullName,
      usn: data.usn.toUpperCase(),
      email: data.email
    }
  }
}
