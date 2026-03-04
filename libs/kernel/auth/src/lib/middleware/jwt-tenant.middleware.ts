import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { runWithTenantContext } from '../storage/tenant-context.storage';
import { TenantContext } from '../interfaces/tenant-context.interface';

@Injectable()
export class JwtTenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(JwtTenantMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const tenantIdHeader = req.headers['x-virteex-tenant-id'];

    if (!authHeader && !tenantIdHeader) {
      return next();
    }

    const token = authHeader?.split(' ')[1];

    if (!token) {
      if (tenantIdHeader) {
        this.logger.error('Attempted tenant access via header without signed context');
        throw new UnauthorizedException('Signed tenant context required');
      }
      return next();
    }

    try {
      const jwtSecret = process.env['JWT_SECRET'];
      const isProduction = process.env['NODE_ENV'] === 'production';

      if (isProduction && (!jwtSecret || jwtSecret === 'dev-secret')) {
        this.logger.error('[SECURITY CRITICAL] Insecure JWT_SECRET in production');
        throw new Error('Insecure JWT_SECRET configuration');
      }

      const secret = jwtSecret || 'dev-secret';
      const decoded: any = jwt.verify(token, secret);

      if (decoded && decoded.tenantId) {
        if (tenantIdHeader && tenantIdHeader !== decoded.tenantId) {
          this.logger.error(`Tenant mismatch: Header=${tenantIdHeader}, Token=${decoded.tenantId}`);
          throw new UnauthorizedException('Tenant context mismatch');
        }

        const context: TenantContext = {
          tenantId: decoded.tenantId,
          userId: decoded.sub,
          role: decoded.roles || [],
          permissions: decoded.permissions || [],
          region: decoded.region || 'US',
          currency: decoded.currency || 'USD',
          language: decoded.language || 'en',
        };

        (req as any).tenantContext = context;

        runWithTenantContext(context, () => {
          next();
        });
      } else {
        this.logger.error('Invalid JWT payload: missing tenantId');
        throw new UnauthorizedException('Missing tenant identification in token');
      }
    } catch (err: any) {
      this.logger.error(`Tenant context verification failed: ${err.message}`);
      throw new UnauthorizedException(err.name === 'TokenExpiredError' ? 'Tenant session expired' : 'Invalid tenant context');
    }
  }
}
