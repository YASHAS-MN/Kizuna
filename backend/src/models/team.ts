export interface Team {
  id: string;
  name: string;
  createdAt: Date;
  mentorId?: string;
}

export interface TeamMember {
  teamId: string;
  userId: string;
  membershipRole: string;
}
