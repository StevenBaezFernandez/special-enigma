import { Migration } from '@mikro-orm/migrations';

export class Migration20250304_OperationEvidenceSchema extends Migration {
  async up(): Promise<void> {
    // Audit Trail: dr_drill_journal with signature
    this.addSql(`
      CREATE TABLE IF NOT EXISTS dr_drill_journal (
        id SERIAL PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        rto_ms FLOAT NOT NULL,
        rpo_ms FLOAT NOT NULL,
        status VARCHAR(50) NOT NULL,
        executed_at TIMESTAMP NOT NULL,
        evidence_signature VARCHAR(64) NOT NULL
      );
    `);

    // Audit Trail: tenant_operation_journal with signature for chained hashing
    this.addSql(`
      CREATE TABLE IF NOT EXISTS tenant_operation_journal (
        id SERIAL PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        operation_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        state VARCHAR(50) NOT NULL,
        payload JSONB,
        created_at TIMESTAMP NOT NULL,
        chain_hash VARCHAR(64)
      );
    `);

    // Audit Trail: security_audit_journal
    this.addSql(`
      CREATE TABLE IF NOT EXISTS security_audit_journal (
        id SERIAL PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        event_type VARCHAR(255) NOT NULL,
        severity VARCHAR(50) NOT NULL,
        payload JSONB,
        created_at TIMESTAMP NOT NULL
      );
    `);

    // Platform metrics
    this.addSql(`
      CREATE TABLE IF NOT EXISTS platform_regional_metrics (
        id SERIAL PRIMARY KEY,
        region VARCHAR(255) NOT NULL,
        load_factor FLOAT NOT NULL,
        observed_at TIMESTAMP NOT NULL
      );
    `);
  }
}
