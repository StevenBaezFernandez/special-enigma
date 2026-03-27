
import type { Company } from './company.entity';
import { UserAuthenticator } from './user-authenticator.entity';
import { v4 as uuidv4 } from 'uuid';

export class User {
  id: string = uuidv4();
  email!: string;
  passwordHash!: string;
  firstName!: string;
  lastName!: string;
  country!: string;
  timezone!: string;
  phone?: string;
  avatarUrl?: string;
  preferredLanguage = 'es';
  role = 'user'; // 'admin', 'user', etc.
  company!: Company;
  isActive = true;
  status = 'PENDING';
  invitationToken?: string;
  invitationExpiresAt?: Date;

  // New fields for Authentication Security
  riskScore = 0; // 0-100, dynamic or static baseline
  mfaEnabled = false;
  mfaSecret?: string;
  lastLoginAt?: Date;
  failedLoginAttempts = 0;
  lockedUntil?: Date;

  // Social Identity fields
  googleId?: string;
  microsoftId?: string;
  oktaId?: string;

  // Passkey Authenticators
  authenticators: UserAuthenticator[] = [];

  // Reset Password fields
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: Date;

  // Backup Codes (stored as hashes with metadata)
  backupCodes: {
    hash: string;
    isUsed: boolean;
    createdAt: Date;
    expiresAt?: Date;
  }[] = [];

  createdAt: Date = new Date();

  updatedAt: Date = new Date();

  constructor(email: string, passwordHash: string, firstName: string, lastName: string, country: string, company: Company) {
    this.email = email;
    this.passwordHash = passwordHash;
    this.firstName = firstName;
    this.lastName = lastName;
    this.country = country;
    this.company = company;
    this.timezone = 'UTC';
  }

  updateProfile(firstName?: string, lastName?: string, phone?: string, preferredLanguage?: string): void {
    if (firstName) this.firstName = firstName;
    if (lastName) this.lastName = lastName;
    if (phone) this.phone = phone;
    if (preferredLanguage) this.preferredLanguage = preferredLanguage;
  }

  activate(): void {
    this.isActive = true;
    this.status = 'ACTIVE';
  }
}
