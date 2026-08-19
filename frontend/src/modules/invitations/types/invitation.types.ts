export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED'

export interface InvitationUser {
  id: string
  name: string
  usn: string
}

export interface Invitation {
  id: string
  senderId: string
  senderName: string
  senderUsn: string
  receiverId: string
  receiverName: string
  receiverUsn: string
  status: InvitationStatus
  createdAt: string
}
