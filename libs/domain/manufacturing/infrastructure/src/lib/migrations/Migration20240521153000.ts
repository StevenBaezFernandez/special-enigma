import { Migration } from '@mikro-orm/migrations';

export class Migration20240521153000 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "production_order" ("id" uuid not null default gen_random_uuid(), "tenant_id" varchar(255) not null, "product_sku" varchar(255) not null, "warehouse_id" varchar(255) not null, "quantity" int not null, "status" varchar(255) not null, "due_date" timestamptz not null, constraint "production_order_pkey" primary key ("id"));');

    this.addSql('create table if not exists "bill_of_materials" ("id" uuid not null default gen_random_uuid(), "tenant_id" varchar(255) not null, "product_sku" varchar(255) not null, "version" varchar(255) not null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), constraint "bill_of_materials_pkey" primary key ("id"));');

    this.addSql('create table if not exists "bill_of_materials_component" ("id" uuid not null default gen_random_uuid(), "tenant_id" varchar(255) not null, "component_product_sku" varchar(255) not null, "quantity" numeric(10,4) not null, "unit" varchar(255) not null, "bill_of_materials_id" uuid not null, constraint "bill_of_materials_component_pkey" primary key ("id"));');

    this.addSql('alter table "bill_of_materials_component" add constraint "bill_of_materials_component_bill_of_materials_id_foreign" foreign key ("bill_of_materials_id") references "bill_of_materials" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "bill_of_materials_component" drop constraint "bill_of_materials_component_bill_of_materials_id_foreign";');
    this.addSql('drop table if exists "bill_of_materials_component";');
    this.addSql('drop table if exists "bill_of_materials";');
    this.addSql('drop table if exists "production_order";');
  }

}
