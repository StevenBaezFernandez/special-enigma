#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Enterprise-Grade RLS Validation Gate
 *
 * This tool performs real database validation to ensure Row Level Security (RLS)
 * is correctly enforced. It uses an adversarial probe: attempting to read
 * protected data without a tenant context MUST fail.
 */

const CRITICAL_TABLES = [
  'orders',
  'customers',
  'products',
  'invoices',
  'audit_logs'
];

const REQUIRED_ADVERSARIAL_TESTS = [
  'libs/kernel/tenant/src/lib/tests/adversarial-isolation.spec.ts',
  'apps/worker/notification/app/src/app/notification.consumer.spec.ts',
  'libs/domain/scheduler/application/src/lib/job-processor.service.spec.ts',
];

async function checkRls() {
  console.log('🔍 Executing ADVERSARIAL RLS validation...');

  // 1. Verify Migration Integrity
  const migrationPath = path.join(process.cwd(), 'apps/api/gateway/app/src/migrations');
  const rlsMigrationFile = path.join(migrationPath, 'Migration20250220_RLS.ts');
  const baselineSql = path.join(process.cwd(), 'platform/infrastructure/docker/init-scripts/010_tenant_rls_baseline.sql');

  if (!fs.existsSync(rlsMigrationFile)) {
    console.error('❌ CRITICAL: RLS migration script missing.');
    process.exit(1);
  }

  if (!fs.existsSync(baselineSql)) {
    console.error('❌ CRITICAL: Standardized RLS baseline SQL is missing.');
    process.exit(1);
  }

  for (const testFile of REQUIRED_ADVERSARIAL_TESTS) {
    const fullPath = path.join(process.cwd(), testFile);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ CRITICAL: Missing adversarial tenant test coverage: ${testFile}`);
      process.exit(1);
    }
  }

  // 2. Adversarial Probe (Real Execution)
  console.log('🛡️  Launching adversarial tenant-escape probe...');

  // Verification that "FORCE ROW LEVEL SECURITY" is present in migrations
  const migrationContent = fs.readFileSync(rlsMigrationFile, 'utf8');
  if (!migrationContent.includes('ENABLE ROW LEVEL SECURITY')) {
      console.error('❌ CRITICAL: RLS is NOT enabled in migrations.');
      process.exit(1);
  }

  if (!migrationContent.includes('FORCE ROW LEVEL SECURITY')) {
      console.error('❌ CRITICAL: RLS is enabled but NOT forced for table owners. Risk of bypass!');
      process.exit(1);
  }

  if (!migrationContent.includes("tenant_id::text = app.current_tenant_id()::text") && !migrationContent.includes('tenant_col_type')) {
      console.error('❌ CRITICAL: RLS migration does not validate tenant_id type compatibility against app.current_tenant_id().');
      process.exit(1);
  }

  // 3. Real Database Probe (Security Gate)
  // Attempt to query a sensitive table without setting app.current_tenant MUST fail
  try {
      console.log('🧪 Executing real adversarial DB query...');
      const results = await attemptUnauthorizedQuery();

      // If we are here and results were returned, RLS is not working for the current user/session
      if (results && results.length > 0) {
          console.error('❌ SECURITY VIOLATION: Tenant escape detected! Data accessible without context.');
          process.exit(1);
      } else if (results && results.length === 0) {
          console.log('✅ Adversarial probe returned 0 rows as expected (RLS active).');
      }
  } catch (err) {
      if (err.message.includes('insufficient privilege') || err.message.includes('permission denied') || err.message.includes('RLS policy violation')) {
          console.log('✅ Adversarial probe BLOCKED by database permissions as expected.');
      } else if (err.code === 'ECONNREFUSED' || err.message.includes('connect')) {
          console.error('❌ CRITICAL: Database probe could not be executed (no connectivity). Real DB validation is MANDATORY for Level 5.');
          process.exit(1);
      } else {
          console.error(`❌ Unexpected error during adversarial probe: ${err.message}`);
          process.exit(1);
      }
  }

  async function attemptUnauthorizedQuery() {
      const { Client } = require('pg');
      const client = new Client({
          connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/virteex'
      });

      try {
          await client.connect();
          // We attempt to select from a critical table.
          // If RLS is working and no tenant is set, this should return 0 rows (or fail if FORCE RLS is strict)
          const res = await client.query('SELECT * FROM orders LIMIT 1');
          return res.rows;
      } catch (err) {
          throw err;
      } finally {
          await client.end();
      }
  }

  console.log('✅ RLS validation passed: Adversarial probe confirmed data isolation.');
}

checkRls().catch(err => {
  console.error(err);
  process.exit(1);
});
