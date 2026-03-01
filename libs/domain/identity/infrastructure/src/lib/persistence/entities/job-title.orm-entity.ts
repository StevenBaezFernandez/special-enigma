import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity({ schema: 'identity', tableName: 'job_title' })
export class JobTitleOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property()
  title!: string;
}
