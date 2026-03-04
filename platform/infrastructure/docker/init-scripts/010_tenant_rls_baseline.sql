CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.current_tenant_id() RETURNS uuid AS $$
BEGIN
  RETURN current_setting('app.current_tenant')::uuid;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t text;
  tenant_col_type text;
  tenant_predicate text;
BEGIN
  FOR t, tenant_col_type IN
    SELECT table_name, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = 'tenant_id'
  LOOP
    tenant_predicate := CASE
      WHEN tenant_col_type = 'uuid' THEN 'tenant_id = app.current_tenant_id()'
      ELSE 'tenant_id::text = app.current_tenant_id()::text'
    END;

    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I;', t);
    EXECUTE format('CREATE POLICY tenant_isolation ON %I USING (%s) WITH CHECK (%s);', t, tenant_predicate, tenant_predicate);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', t);
  END LOOP;
END $$;
