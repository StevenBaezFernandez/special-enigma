import { Entity, PrimaryKey, Property, Unique, OneToMany, Collection } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity({ tableName: 'templates' })
@Unique({ properties: ['name'] })
export class NotificationTemplate {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  name!: string;

  @Property()
  description?: string;

  @Property({ default: true })
  isActive: boolean = true;

  @OneToMany(() => TemplateVersion, (version) => version.template)
  versions = new Collection<TemplateVersion>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

@Entity({ tableName: 'template_versions' })
@Unique({ properties: ['template', 'version'] })
export class TemplateVersion {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => NotificationTemplate)
  template!: NotificationTemplate;

  @Property()
  version!: string;

  @Property({ type: 'text' })
  content!: string;

  @Property({ type: 'json' })
  metadata?: Record<string, any>;

  @Property({ default: false })
  isDefault: boolean = false;

  @Property()
  createdAt: Date = new Date();

  @Property({ nullable: true })
  approvedAt?: Date;

  @Property({ nullable: true })
  approvedBy?: string;
}

import { ManyToOne } from '@mikro-orm/core';
