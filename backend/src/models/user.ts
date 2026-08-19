export type UserRole = 'STUDENT' | 'MENTOR' | 'STAFF' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
