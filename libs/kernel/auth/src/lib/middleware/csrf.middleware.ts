import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import { buildCsrfCookieOptions } from '../cookie-policy';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (this.shouldBypass(req)) {
      return next();
    }

    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      if (!req.cookies['XSRF-TOKEN']) {
        this.setCsrfCookie(res);
      }
      return next();
    }

    const csrfTokenHeader = req.headers['x-xsrf-token'] || req.headers['x-csrf-token'];
    const csrfTokenCookie = req.cookies['XSRF-TOKEN'];

    if (!csrfTokenHeader || !csrfTokenCookie || csrfTokenHeader !== csrfTokenCookie) {
      throw new ForbiddenException('Invalid CSRF Token');
    }

    next();
  }

  private shouldBypass(req: Request): boolean {
    if (req.originalUrl === '/graphql') {
      return true;
    }

    const hasBearer = req.headers.authorization?.startsWith('Bearer ');
    const hasSessionCookie = Boolean(req.cookies['access_token'] || req.cookies['refresh_token']);

    // M2M/mobile bearer tokens without cookies are not CSRF-prone.
    if (hasBearer && !hasSessionCookie) {
      return true;
    }

    return false;
  }

  private setCsrfCookie(res: Response) {
    const token = crypto.randomBytes(32).toString('hex');
    const secure = process.env['NODE_ENV'] === 'production';
    const sameSite = (process.env['COOKIE_SAME_SITE'] as 'lax' | 'strict' | 'none') || 'lax';
    const domain = process.env['COOKIE_DOMAIN'];
    res.cookie('XSRF-TOKEN', token, buildCsrfCookieOptions({ secure, sameSite, domain }));
  }
}
