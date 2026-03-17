import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { UserOrmEntity } from './user.orm-entity';
import { v4 as uuidv4 } from 'uuid';

@Entity({ schema: 'identity', tableName: 'user_authenticator' })
export class UserAuthenticatorOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property({ type: 'blob' })
  credentialID!: Uint8Array;

  @Property({ type: 'blob' })
  publicKey!: Uint8Array;

  @Property()
  counter!: number;

  @Property()
  credentialDeviceType!: string;

  @Property()
  credentialBackedUp!: boolean;

  @Property({ type: 'json', nullable: true })
  transports?: string[];

  @ManyToOne(() => UserOrmEntity)
  user!: UserOrmEntity;

  constructor(
    credentialID: Uint8Array,
    publicKey: Uint8Array,
    counter: number,
    credentialDeviceType: string,
    credentialBackedUp: boolean,
    user: UserOrmEntity,
    transports?: string[]
  ) {
    this.credentialID = credentialID;
    this.publicKey = publicKey;
    this.counter = counter;
    this.credentialDeviceType = credentialDeviceType;
    this.credentialBackedUp = credentialBackedUp;
    this.user = user;
    this.transports = transports;
  }
}
