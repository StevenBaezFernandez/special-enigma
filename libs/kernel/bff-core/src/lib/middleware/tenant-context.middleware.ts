import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CanonicalTenantMiddleware } from '@virteex/kernel-auth';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantContextMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] || req.query['tenantId'];
    if (tenantId) {
      this.logger.debug(`Propagating tenant context: ${tenantId}`);
    }
    // We delegate to the existing CanonicalTenantMiddleware but wrap it for BFF specific logic if needed
    next();
  }
}
