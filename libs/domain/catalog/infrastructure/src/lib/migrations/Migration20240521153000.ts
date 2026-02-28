import { Migration } from '@mikro-orm/migrations';

export class Migration20240521153000 extends Migration {

  async up(): Promise<void> {
    this.addSql('create schema if not exists "catalog";');
    this.addSql('create table if not exists "catalog"."product" ("id" serial primary key, "tenant_id" varchar(255) not null, "sku" varchar(255) not null, "name" varchar(255) not null, "price" numeric(10,2) not null, "fiscal_code" varchar(255) null, "tax_group" varchar(255) null, "is_active" boolean not null default true);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "catalog"."product";');
    this.addSql('drop schema if exists "catalog";');
  }

}
