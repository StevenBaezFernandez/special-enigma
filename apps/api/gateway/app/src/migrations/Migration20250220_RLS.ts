import { Migration } from '@mikro-orm/migrations';

export class Migration20250220_RLS extends Migration {

  async up(): Promise<void> {
    // 1. Ensure schema exists
    this.addSql('CREATE SCHEMA IF NOT EXISTS app;');

    // 2. Create the function to get current tenant ID safely
    this.addSql(`
      CREATE OR REPLACE FUNCTION app.current_tenant_id() RETURNS uuid AS $$
      BEGIN
        RETURN current_setting('app.current_tenant')::uuid;
      EXCEPTION WHEN OTHERS THEN
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 2. Enable RLS and create policy for all tables with 'tenant_id'
    this.addSql(`
      DO $$
      DECLARE
          t text;
      BEGIN
          FOR t IN
              SELECT table_name
              FROM information_schema.columns
              WHERE column_name = 'tenant_id'
              AND table_schema = 'public'
          LOOP
              -- Enable RLS
              EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);

              -- Drop existing policy if any to avoid error
              EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I;', t);

              -- Create new policy
              -- Users can only see rows where tenant_id matches the session variable
              EXECUTE format('CREATE POLICY tenant_isolation ON %I USING (tenant_id = app.current_tenant_id());', t);

              -- Force RLS even for owners
              EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', t);
          END LOOP;
      END$$;
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      DO $$
      DECLARE
          t text;
      BEGIN
          FOR t IN
              SELECT table_name
              FROM information_schema.columns
              WHERE column_name = 'tenant_id'
              AND table_schema = 'public'
          LOOP
              EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I;', t);
              EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY;', t);
          END LOOP;
      END$$;
    `);

    this.addSql('DROP FUNCTION IF EXISTS app.current_tenant_id();');
  }
}
