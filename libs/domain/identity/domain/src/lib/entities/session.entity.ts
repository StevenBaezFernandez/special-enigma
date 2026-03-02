import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { v4 as uuidv4 } from 'uuid';
import type { User } from './user.entity';

export class Session {
  id: string = uuidv4();
  user!: User;
  ipAddress!: string;
  userAgent!: string;
  deviceFingerprint?: string;
  riskScore = 0; // 0-100
  currentRefreshTokenHash?: string;
  isActive = true;
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
