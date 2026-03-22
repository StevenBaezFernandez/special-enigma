import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TenantService } from '../tenant.service';
import { Tenant } from '../entities/tenant.entity';
import { TenantControlRecord } from '../entities/tenant-control-record.entity';
import { TenantMode, TenantStatus } from '../interfaces/tenant-config.interface';
import * as fs from 'fs';
import * as path from 'path';

function buildServiceHarness() {
  const tenants = new Map<string, Tenant>();
  const controls = new Map<string, TenantControlRecord>();

  const em: any = {
    findOne: async (entity: unknown, where: { id?: string }) => {
      if (entity === Tenant && where.id) return tenants.get(where.id) ?? null;
      return null;
    },
    findOneOrFail: async (entity: unknown, where: { tenantId: string }) => {
      if (entity === TenantControlRecord) {
        const val = controls.get(where.tenantId);
        if (!val) throw new Error('not found');
        return val;
      }
      throw new Error('unsupported');
    },
    create: (_entity: unknown, payload: any) => ({ ...payload }),
    persistAndFlush: async (entity: any) => {
      if ('tenantId' in entity) controls.set(entity.tenantId, entity);
      else tenants.set(entity.id, entity);
    },
    flush: async () => undefined,
    getConnection: () => ({ execute: async () => [] }),
    fork: () => ({ getConnection: () => ({ execute: async () => [] }) }),
    transactional: async (cb: any) => cb({ getConnection: () => ({ execute: async () => [] }) }),
  };

  const service = new TenantService(em);
  return { service, controls };
}

describe('TenantService Lifecycle Evidence', () => {
  const evidenceDir = path.join(process.cwd(), 'evidence/tenant-lifecycle');

  beforeEach(() => {
    process.env['EVIDENCE_SIGNING_SECRET'] = 'test-secret';
    if (fs.existsSync(evidenceDir)) {
      fs.rmSync(evidenceDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    delete process.env['EVIDENCE_SIGNING_SECRET'];
  });

  it('generates signed evidence on activation', async () => {
    const { service, controls } = buildServiceHarness();
    const tenantId = 'test-tenant';

    // Setup existing control record
    controls.set(tenantId, { tenantId, status: TenantStatus.PROVISIONING, version: 1 } as any);

    await service.activateTenant(tenantId);

    const files = fs.readdirSync(evidenceDir);
    expect(files.length).toBe(1);
    expect(files[0]).toContain(tenantId);
    expect(files[0]).toContain('ACTIVATE');

    const content = JSON.parse(fs.readFileSync(path.join(evidenceDir, files[0]), 'utf8'));
    expect(content.tenantId).toBe(tenantId);
    expect(content.action).toBe('ACTIVATE');
    expect(content.signature).toBeDefined();
  });
});
