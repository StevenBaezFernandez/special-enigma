import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

/**
 * Enforces non-negotiable configuration for tenant-aware services.
 * Any service importing TenantModule fails fast when critical controls are missing.
 */
@Injectable()
export class TenantCriticalConfigService implements OnModuleInit {
  private readonly logger = new Logger(TenantCriticalConfigService.name);

  onModuleInit(): void {
    this.assertRequired('AUDIT_HMAC_SECRET');
    this.assertRequired('TENANT_ROUTING_HMAC_SECRET');
    this.assertRequired('JWT_SECRET');

    const env = process.env['NODE_ENV'] ?? 'development';
    if (env === 'production') {
      this.assertRequired('REDIS_URL');
    }

    this.logger.log('Tenant critical configuration validation passed.');
  }

  private assertRequired(key: string): void {
    const value = process.env[key]?.trim();
    if (!value) {
      throw new Error(`Missing critical tenant-aware configuration: ${key}`);
    }
  }
}
