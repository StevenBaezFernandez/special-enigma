import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { UserOrmEntity } from './user.orm-entity';
import { v4 as uuidv4 } from 'uuid';

@Entity({ schema: 'identity', tableName: 'session' })
export class SessionOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => UserOrmEntity)
  user!: UserOrmEntity;

  @Property()
  ipAddress!: string;

  @Property()
  userAgent!: string;

  @Property({ nullable: true })
  deviceFingerprint?: string;

  @Property()
  riskScore = 0;

  @Property({ nullable: true })
  currentRefreshTokenHash?: string;

  @Property()
  isActive = true;

  @Property()
  expiresAt!: Date;

  @Property()
  createdAt: Date = new Date();
}
