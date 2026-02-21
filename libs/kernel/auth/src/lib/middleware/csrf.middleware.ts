import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Exempt GraphQL endpoint if necessary (often uses separate auth mechanism or specific headers)
    if (req.originalUrl === '/graphql') {
      return next();
    }

    // Exempt GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      // Set CSRF token cookie on initial load or if missing
      if (!req.cookies['XSRF-TOKEN']) {
        this.setCsrfCookie(res);
      }
      return next();
    }

    // Verify CSRF token for mutations
    const csrfTokenHeader = req.headers['x-xsrf-token'] || req.headers['x-csrf-token'];
    const csrfTokenCookie = req.cookies['XSRF-TOKEN'];

    if (!csrfTokenHeader || !csrfTokenCookie || csrfTokenHeader !== csrfTokenCookie) {
      throw new ForbiddenException('Invalid CSRF Token');
    }

    next();
  }

  private setCsrfCookie(res: Response) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // Must be readable by JS for Angular to read and send in header
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      path: '/'
    });
  }
}
