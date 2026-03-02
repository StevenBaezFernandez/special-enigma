import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import type { Company } from './company.entity';
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
  @Property()
  createdAt: Date = new Date();
  @Property()
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

  updateProfile(firstName?: string, lastName?: string, phone?: string): void {
    if (firstName) this.firstName = firstName;
    if (lastName) this.lastName = lastName;
    if (phone) this.phone = phone;
  }

  activate(): void {
    this.isActive = true;
    this.status = 'ACTIVE';
  }
}
