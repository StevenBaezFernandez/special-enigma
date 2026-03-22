import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CanonicalTenantMiddleware } from '@virteex/kernel-auth';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantContextMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // 1. Level 5 hardening: BFF must not only delegate but ensure context is present and verified.
    // CanonicalTenantMiddleware must have already executed (configured in bff-core.module).
    const context = (req as any).tenantContext;

    if (!context) {
      this.logger.error('[SECURITY CRITICAL] BFF Ingress attempt without verified tenant context. Request blocked.');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Verified tenant context is required for all BFF operations.',
        code: 'MISSING_TENANT_CONTEXT'
      });
    }

    this.logger.debug(`BFF propagating verified tenant context for: ${context.tenantId}`);

    // Proceed if context is present (already validated by CanonicalTenantMiddleware)
    next();
  }
}
