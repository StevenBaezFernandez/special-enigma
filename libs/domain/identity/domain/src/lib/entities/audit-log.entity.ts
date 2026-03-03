
import { v4 as uuidv4 } from 'uuid';

export class AuditLog {
  id: string = uuidv4();
  userId?: string; // Optional because failed login might not have user
  event!: string; // 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'REGISTER', 'LOGOUT', 'LOCKOUT'
  metadata?: Record<string, any>; // IP, Device, Reason
  timestamp: Date = new Date();
  hash?: string;
  previousHash?: string;

  constructor(event: string, userId?: string, metadata?: Record<string, any>) {
    this.id = uuidv4();
    this.event = event;
    this.userId = userId;
    this.metadata = metadata;
  }

  setHash(hash: string, previousHash?: string) {
    this.hash = hash;
    this.previousHash = previousHash;
  }
}
