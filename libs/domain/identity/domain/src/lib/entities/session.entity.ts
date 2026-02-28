import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Session {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => User)
  user!: User;

  @Property()
  ipAddress!: string;

  @Property()
  userAgent!: string;

  @Property()
  deviceFingerprint?: string;

  @Property()
  riskScore = 0; // 0-100

  @Property({ nullable: true })
  currentRefreshTokenHash?: string;

  @Property()
  isActive = true;

  @Property()
  expiresAt!: Date;

  @Property()
  createdAt: Date = new Date();

  constructor(user: User, ipAddress: string, userAgent: string, expiresAt: Date, riskScore = 0, deviceFingerprint?: string) {
    this.user = user;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.expiresAt = expiresAt;
    this.riskScore = riskScore;
    this.deviceFingerprint = deviceFingerprint;
  }
}
