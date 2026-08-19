export interface Session {
  id: string; // Cryptographically random session ID
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}
