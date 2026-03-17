import { EntitySchema } from '@mikro-orm/core';
import { User, Company, AuditLog, Session, JobTitle, UserAuthenticator } from '@virteex/domain-identity-domain';

export const UserSchema = new EntitySchema<any>({
  class: User,
  schema: 'identity',
  tableName: 'user',
  properties: {
    id: { primary: true, type: 'uuid' },
    email: { type: 'string', unique: true },
    passwordHash: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    country: { type: 'string' },
    timezone: { type: 'string', default: 'UTC' },
    phone: { type: 'string', nullable: true },
    avatarUrl: { type: 'string', nullable: true },
    role: { type: 'string', default: 'user' },
    company: { kind: 'm:1', entity: 'Company' },
    isActive: { type: 'boolean', default: true },
    status: { type: 'string', default: 'PENDING' },
    invitationToken: { type: 'string', nullable: true },
    invitationExpiresAt: { type: 'Date', nullable: true },
    riskScore: { type: 'number', default: 0 },
    mfaEnabled: { type: 'boolean', default: false },
    mfaSecret: { type: 'string', nullable: true },
    lastLoginAt: { type: 'Date', nullable: true },
    failedLoginAttempts: { type: 'number', default: 0 },
    lockedUntil: { type: 'Date', nullable: true },
    googleId: { type: 'string', nullable: true, unique: true },
    microsoftId: { type: 'string', nullable: true, unique: true },
    oktaId: { type: 'string', nullable: true, unique: true },
    authenticators: { kind: '1:m', entity: 'UserAuthenticator', mappedBy: 'user', orphanRemoval: true },
    createdAt: { type: 'Date', onCreate: () => new Date() },
    updatedAt: { type: 'Date', onCreate: () => new Date(), onUpdate: () => new Date() },
  },
});

export const CompanySchema = new EntitySchema<any>({
  class: Company,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    name: { type: 'string' },
    taxId: { type: 'string', nullable: true },
    address: { type: 'string', nullable: true },
  },
});

export const AuditLogSchema = new EntitySchema<any>({
  class: AuditLog,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    userId: { type: 'string' },
    action: { type: 'string' },
    entityName: { type: 'string' },
    entityId: { type: 'string' },
    payload: { type: 'json', nullable: true },
    createdAt: { type: 'Date', onCreate: () => new Date() },
  },
});

export const SessionSchema = new EntitySchema<any>({
  class: Session,
  properties: {
    id: { primary: true, type: 'uuid' },
    userId: { type: 'string' },
    token: { type: 'string' },
    expiresAt: { type: 'Date' },
    createdAt: { type: 'Date', onCreate: () => new Date() },
  },
});

export const JobTitleSchema = new EntitySchema<any>({
  class: JobTitle,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    name: { type: 'string' },
  },
});

export const UserAuthenticatorSchema = new EntitySchema<any>({
  class: UserAuthenticator,
  schema: 'identity',
  tableName: 'user_authenticator',
  properties: {
    id: { primary: true, type: 'uuid' },
    credentialID: { type: 'blob' },
    publicKey: { type: 'blob' },
    counter: { type: 'number' },
    credentialDeviceType: { type: 'string' },
    credentialBackedUp: { type: 'boolean' },
    transports: { type: 'json', nullable: true },
    user: { kind: 'm:1', entity: 'User' },
  },
});
