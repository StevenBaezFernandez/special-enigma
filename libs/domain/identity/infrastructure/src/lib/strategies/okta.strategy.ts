import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-openidconnect';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport';

@Injectable()
export class OktaStrategy extends PassportStrategy(Strategy, 'okta') {
  private readonly logger = new Logger(OktaStrategy.name);

  constructor(configService: ConfigService) {
    const issuer = configService.get<string>('OKTA_ISSUER');
    const clientID = configService.get<string>('OKTA_CLIENT_ID');
    const clientSecret = configService.get<string>('OKTA_CLIENT_SECRET');
    const isConfigured = Boolean(issuer && clientID && clientSecret);
    const effectiveIssuer = issuer ?? 'https://disabled.okta.local';

    super({
      issuer: effectiveIssuer,
      authorizationURL: `${effectiveIssuer}/v1/authorize`,
      tokenURL: `${effectiveIssuer}/v1/token`,
      userInfoURL: `${effectiveIssuer}/v1/userinfo`,
      clientID: clientID ?? 'disabled-okta-client-id',
      clientSecret: clientSecret ?? 'disabled-okta-client-secret',
      callbackURL: configService.get<string>('OKTA_CALLBACK_URL') || 'http://localhost:3000/api/auth/okta/callback',
      scope: ['openid', 'profile', 'email'],
    });

    if (!isConfigured) {
      this.logger.warn('Okta OAuth credentials are not fully configured. Okta auth strategy is disabled.');
    }
  }

  async validate(
    issuer: string,
    profile: Profile,
    done: (err: Error | null, user?: Record<string, string>) => void
  ): Promise<void> {
    const user = {
      provider: 'okta',
      id: profile.id,
      email: profile.emails?.[0]?.value ?? '',
      firstName: profile.name?.givenName || '',
      lastName: profile.name?.familyName || '',
    };
    done(null, user);
  }
}
