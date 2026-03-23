import { Entity, PrimaryKey, Property, ManyToOne, Unique, OneToMany, Collection } from '@mikro-orm/core';
import { Company } from '@virteex/domain-identity-domain';
import { UserAuthenticatorOrmEntity } from './user-authenticator.orm-entity';
import { v4 as uuidv4 } from 'uuid';

@Entity({ schema: 'identity', tableName: 'user' })
export class UserOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property()
  @Unique()
  email!: string;

  @Property()
  passwordHash!: string;

  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property()
  country!: string;

  @Property()
  timezone!: string;

  @Property({ nullable: true })
  phone?: string;

  @Property({ nullable: true })
  avatarUrl?: string;

  @Property()
  role = 'user'; // 'admin', 'user', etc.

  @ManyToOne('Company')
  company!: Company;

  @Property()
  isActive = true;

  @Property()
  status = 'PENDING';

  @Property({ nullable: true })
  invitationToken?: string;

  @Property({ nullable: true })
  invitationExpiresAt?: Date;

  // New fields for Authentication Security
  @Property()
  riskScore = 0; // 0-100, dynamic or static baseline

  @Property()
  mfaEnabled = false;

  @Property({ nullable: true })
  mfaSecret?: string;

  @Property({ nullable: true })
  lastLoginAt?: Date;

  @Property()
  failedLoginAttempts = 0;

  @Property({ nullable: true })
  lockedUntil?: Date;

  // Social Identity fields
  @Property({ nullable: true })
  @Unique()
  googleId?: string;

  @Property({ nullable: true })
  @Unique()
  microsoftId?: string;

  @Property({ nullable: true })
  @Unique()
  oktaId?: string;

  // Reset Password fields
  @Property({ nullable: true })
  resetPasswordToken?: string;

  @Property({ nullable: true })
  resetPasswordExpiresAt?: Date;

  // Passkey Authenticators
  @OneToMany(() => UserAuthenticatorOrmEntity, (a) => a.user, { orphanRemoval: true })
  authenticators = new Collection<UserAuthenticatorOrmEntity>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
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
}
