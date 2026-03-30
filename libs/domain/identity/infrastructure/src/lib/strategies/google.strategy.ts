import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const isConfigured = Boolean(clientID && clientSecret);

    super({
      clientID: clientID ?? 'disabled-google-client-id',
      clientSecret: clientSecret ?? 'disabled-google-client-secret',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/api/auth/google/callback',
      scope: ['email', 'profile'],
    });

    if (!isConfigured) {
      this.logger.warn('Google OAuth credentials are not fully configured. Google auth strategy is disabled.');
    }
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { name, emails, id } = profile;
    const user = {
      provider: 'google',
      id: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
    };
    done(null, user);
  }
}
