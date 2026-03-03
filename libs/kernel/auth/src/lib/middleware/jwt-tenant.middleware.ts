import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { runWithTenantContext } from '../storage/tenant-context.storage';
import { TenantContext } from '../interfaces/tenant-context.interface';

@Injectable()
export class JwtTenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    try {
      // ENFORCEMENT: JWT signature MUST be verified to establish trust
      const jwtSecret = process.env['JWT_SECRET'] || 'dev-secret';
      const decoded: any = jwt.verify(token, jwtSecret);

      if (decoded && decoded.tenantId) {
        const context: TenantContext = {
          tenantId: decoded.tenantId,
          userId: decoded.sub, // 'sub' is standard for user ID in JWT
          role: decoded.roles || [],
          // Populate optional fields if available in token or let them be undefined
          permissions: decoded.permissions || [],
          region: decoded.region || 'US',
          currency: decoded.currency || 'USD',
          language: decoded.language || 'en',
        };

        // Attach to request for logging/other guards if needed
        (req as any).tenantContext = context;

        runWithTenantContext(context, () => {
          next();
        });
      } else {
        next();
      }
    } catch (err) {
      // If decode fails, just continue, Guard will handle auth failure
      next();
    }
  }
}
