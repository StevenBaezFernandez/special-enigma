import { Global, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard, AuthModule } from '@virteex/kernel-auth';
import { TenantModule } from './tenant.module';
import { TenantThrottlerGuard } from './guards/tenant-throttler.guard';
import { TenantRlsInterceptor } from './interceptors/tenant-rls.interceptor';

/**
 * Reusable baseline for tenant-aware services:
 * - canonical tenant/auth middleware from AuthModule
 * - JWT auth guard
 * - tenant throttling guard
 * - tenant RLS interceptor
 * - tenant startup critical config validation through TenantModule
 */
@Global()
@Module({
  imports: [AuthModule, TenantModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: TenantThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantRlsInterceptor,
    },
  ],
  exports: [AuthModule, TenantModule],
})
export class TenantSecurityBaselineModule {}
