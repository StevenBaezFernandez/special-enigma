import { Migration } from '@mikro-orm/migrations';

export class Migration20250220_RLS extends Migration {
  async up(): Promise<void> {
    this.addSql('CREATE SCHEMA IF NOT EXISTS app;');
    this.addSql(`
      CREATE OR REPLACE FUNCTION app.current_tenant_id() RETURNS uuid AS $$
      BEGIN
        RETURN current_setting('app.current_tenant')::uuid;
      EXCEPTION WHEN OTHERS THEN
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    this.addSql(`
      DO $$
      DECLARE
        t text;
        s text;
        tenant_col_type text;
        tenant_predicate text;
      BEGIN
        FOR s, t, tenant_col_type IN
          SELECT table_schema, table_name, udt_name
          FROM information_schema.columns
          WHERE column_name = 'tenant_id'
          AND table_schema NOT IN ('information_schema', 'pg_catalog', 'app')
        LOOP
          tenant_predicate := CASE
            WHEN tenant_col_type = 'uuid' THEN 'tenant_id = app.current_tenant_id()'
            ELSE 'tenant_id::text = app.current_tenant_id()::text'
          END;

          EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', s, t);
          EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I.%I;', s, t);
          EXECUTE format('CREATE POLICY tenant_isolation ON %I.%I USING (%s) WITH CHECK (%s);', s, t, tenant_predicate, tenant_predicate);
          EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY;', s, t);
        END LOOP;
      END $$;
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      DO $$
      DECLARE
        t text;
        s text;
      BEGIN
        FOR s, t IN
          SELECT table_schema, table_name
          FROM information_schema.columns
          WHERE column_name = 'tenant_id'
          AND table_schema NOT IN ('information_schema', 'pg_catalog', 'app')
        LOOP
          EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I.%I;', s, t);
          EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY;', s, t);
          EXECUTE format('ALTER TABLE %I.%I NO FORCE ROW LEVEL SECURITY;', s, t);
        END LOOP;
      END $$;
    `);
    this.addSql('DROP FUNCTION IF EXISTS app.current_tenant_id();');
    // We might want to keep the schema if other things use it, but for a clean rollback:
    this.addSql('DROP SCHEMA IF EXISTS app CASCADE;');
  }
}
