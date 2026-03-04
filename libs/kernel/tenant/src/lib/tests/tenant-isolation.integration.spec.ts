import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MikroORM, EntityManager } from '@mikro-orm/postgresql';
import { TenantModelSubscriber } from '../subscribers/tenant-model.subscriber';
import { TenantControlRecord } from '../entities/tenant-control-record.entity';
import { TenantStatus } from '../interfaces/tenant-config.interface';
import * as AuthModule from '@virteex/kernel-auth';

/**
 * Enterprise Adversarial Integration Test: Tenant Isolation
 *
 * Objective: Verify that the TenantModelSubscriber and DB-level enforcement
 * correctly block cross-tenant write attempts and respect tenant freezing.
 */

vi.mock('@virteex/kernel-auth', () => ({
    getTenantContext: vi.fn(),
}));

class MockEntity {
    tenantId!: string;
}

describe('Tenant Isolation Adversarial Tests', () => {
    let subscriber: TenantModelSubscriber;
    let em: EntityManager;

    beforeEach(() => {
        subscriber = new TenantModelSubscriber();
        em = {
            findOne: vi.fn(),
            getConnection: vi.fn().mockReturnValue({ execute: vi.fn() }),
        } as any;
    });

    it('SHOULD BLOCK cross-tenant write (Adversarial Bypass Attempt)', async () => {
        (AuthModule.getTenantContext as any).mockReturnValue({ tenantId: 'tenant-legit' });

        const entity = new MockEntity();
        entity.tenantId = 'tenant-victim';

        (em.findOne as any).mockResolvedValue({
            status: TenantStatus.ACTIVE,
            isFrozen: false
        });

        const args = { entity, em } as any;

        await expect(subscriber.beforeUpdate(args)).rejects.toThrow('Cross-tenant write operation blocked.');
        expect(em.getConnection().execute).toHaveBeenCalled(); // Audit journal entry
    });

    it('SHOULD BLOCK write when tenant is FROZEN (DR/Failover scenario)', async () => {
        (AuthModule.getTenantContext as any).mockReturnValue({ tenantId: 'tenant-1' });

        const entity = new MockEntity();
        entity.tenantId = 'tenant-1';

        (em.findOne as any).mockResolvedValue({
            status: TenantStatus.ACTIVE,
            isFrozen: true
        });

        const args = { entity, em } as any;

        await expect(subscriber.beforeUpdate(args)).rejects.toThrow('Tenant tenant-1 is currently frozen.');
    });

    it('SHOULD BLOCK write when tenant is SUSPENDED (Compliance gate)', async () => {
        (AuthModule.getTenantContext as any).mockReturnValue({ tenantId: 'tenant-1' });

        const entity = new MockEntity();
        entity.tenantId = 'tenant-1';

        (em.findOne as any).mockResolvedValue({
            status: TenantStatus.SUSPENDED,
            isFrozen: false
        });

        const args = { entity, em } as any;

        await expect(subscriber.beforeUpdate(args)).rejects.toThrow('Tenant tenant-1 is suspended. Writes are disabled.');
    });
});
