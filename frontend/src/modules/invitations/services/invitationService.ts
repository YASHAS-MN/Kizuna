import type { Invitation, InvitationUser } from '../types/invitation.types'

/**
 * In-memory local database for invitations during this frontend development phase.
 * Pre-populated with realistic initial seed invitations for testing.
 */
let mockInvitations: Invitation[] = [
  {
    id: 'inv_101',
    senderId: 's1',
    senderName: 'Alice Rao',
    senderUsn: '1RV23CS001',
    receiverId: 'u1', // Default logged-in student user (Alice Watson / active session user)
    receiverName: 'Alice Watson',
    receiverUsn: '1RV23CS000',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
  },
  {
    id: 'inv_102',
    senderId: 's5',
    senderName: 'Elena Rostova',
    senderUsn: '1RV23CS088',
    receiverId: 'u1',
    receiverName: 'Alice Watson',
    receiverUsn: '1RV23CS000',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
  }
]

// Pub/sub listeners for reactive UI updates across modules
type Listener = () => void
const listeners: Set<Listener> = new Set()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

/**
 * Replaceable Service Boundary for Team Invitations.
 * NOTE: This is a temporary in-memory mock implementation. In a future slice,
 * these functions will call backend REST API endpoints.
 */
export const invitationService = {
  /**
   * Subscribe to invitation state changes.
   */
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  /**
   * Send a new team invitation.
   */
  async sendInvitation(sender: InvitationUser, receiver: InvitationUser): Promise<Invitation> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Edge Case 1: Cannot invite yourself
    if (sender.id === receiver.id || (sender.usn && receiver.usn && sender.usn.toUpperCase() === receiver.usn.toUpperCase())) {
      throw new Error('You cannot send a team invitation to yourself.')
    }

    // Edge Case 2: Cannot send duplicate pending invitation
    const existing = mockInvitations.find(
      (inv) =>
        inv.senderId === sender.id &&
        inv.receiverId === receiver.id &&
        inv.status === 'PENDING'
    )
    if (existing) {
      throw new Error('An invitation has already been sent to this student.')
    }

    const newInvitation: Invitation = {
      id: `inv_${Date.now()}`,
      senderId: sender.id,
      senderName: sender.name,
      senderUsn: sender.usn,
      receiverId: receiver.id,
      receiverName: receiver.name,
      receiverUsn: receiver.usn,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }

    mockInvitations.unshift(newInvitation)
    notifyListeners()
    return newInvitation
  },

  /**
   * Fetch all received pending or historic invitations for a specific user.
   */
  async getReceivedInvitations(receiverId: string): Promise<Invitation[]> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    // Return all invitations where receiverId matches, or fallback match if testing
    return mockInvitations.filter(
      (inv) => inv.receiverId === receiverId || receiverId === 'u1' || receiverId === 'alice@kizuna.edu'
    )
  },

  /**
   * Check if a pending invitation already exists from sender to receiver.
   */
  async hasPendingInvitation(senderId: string, receiverId: string): Promise<boolean> {
    return mockInvitations.some(
      (inv) =>
        ((inv.senderId === senderId && inv.receiverId === receiverId) ||
         (inv.senderId === senderId && receiverId === 'u1')) &&
        inv.status === 'PENDING'
    )
  },

  /**
   * Accept an incoming team invitation.
   */
  async acceptInvitation(invitationId: string): Promise<Invitation> {
    await new Promise((resolve) => setTimeout(resolve, 250))
    const invitation = mockInvitations.find((inv) => inv.id === invitationId)

    if (!invitation) {
      throw new Error('Invitation not found.')
    }

    // Edge Case 3: Cannot accept already processed invitation
    if (invitation.status !== 'PENDING') {
      throw new Error(`Invitation has already been ${invitation.status.toLowerCase()}.`)
    }

    invitation.status = 'ACCEPTED'
    notifyListeners()
    return { ...invitation }
  },

  /**
   * Decline an incoming team invitation.
   */
  async declineInvitation(invitationId: string): Promise<Invitation> {
    await new Promise((resolve) => setTimeout(resolve, 250))
    const invitation = mockInvitations.find((inv) => inv.id === invitationId)

    if (!invitation) {
      throw new Error('Invitation not found.')
    }

    // Edge Case 4: Cannot decline already processed invitation
    if (invitation.status !== 'PENDING') {
      throw new Error(`Invitation has already been ${invitation.status.toLowerCase()}.`)
    }

    invitation.status = 'DECLINED'
    notifyListeners()
    return { ...invitation }
  }
}
