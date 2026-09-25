import type { User } from './api/auth'

let currentUser: User | null = null

export const sessionService = {
  setCurrentUser(user: User | null) {
    currentUser = user
  },

  getCurrentUser(): User | null {
    return currentUser
  }
}
