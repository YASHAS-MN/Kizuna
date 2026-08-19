export interface Team {
  id: string;
  name: string;
  createdAt: Date;
}

export interface TeamMember {
  teamId: string;
  userId: string;
  membershipRole: string;
}
