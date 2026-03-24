import { Injectable, Optional } from '@nestjs/common';
import { Response } from 'express';
import { SecretManagerService, buildAccessCookieOptions, buildRefreshCookieOptions } from '@virteex/kernel-auth';
import { CriticalConfigurationException } from '@virteex/kernel-exceptions';

@Injectable()
export class CookiePolicyService {
  constructor(
    @Optional() private readonly secretManager?: SecretManagerService
  ) {}

  setAuthCookies(res: Response, accessToken: string, refreshToken: string, rememberMe = true) {
      const cookieContext = this.getCookieContext();
      res.cookie('access_token', accessToken, buildAccessCookieOptions(cookieContext));
      res.cookie('refresh_token', refreshToken, buildRefreshCookieOptions(cookieContext, rememberMe));
  }

  clearAuthCookies(res: Response) {
      const cookieContext = this.getCookieContext();
      res.clearCookie('access_token', { path: '/', domain: cookieContext.domain });
      res.clearCookie('refresh_token', { path: '/api/auth/refresh', domain: cookieContext.domain });
  }

  getCookieContext() {
      const isProd = this.secretManager?.getSecret('NODE_ENV', 'development') === 'production' || process.env['NODE_ENV'] === 'production';

      if (isProd) {
          const sessionSecret = this.secretManager?.getSecret('SESSION_SECRET', '');
          if (!sessionSecret) {
              throw new CriticalConfigurationException('SESSION_SECRET must be defined in production environment');
          }
      }

      const secure = this.secretManager?.getSecret('COOKIE_SECURE', String(isProd)) === 'true';
      const sameSite = (this.secretManager?.getSecret('COOKIE_SAME_SITE', 'lax') as 'lax' | 'strict' | 'none') || 'lax';
      const domain = this.secretManager?.getSecret('COOKIE_DOMAIN', '');
      return { secure, sameSite, domain: domain || undefined };
  }
}
