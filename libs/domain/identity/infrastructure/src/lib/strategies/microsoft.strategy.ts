import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('MICROSOFT_CLIENT_ID'),
      clientSecret: configService.get<string>('MICROSOFT_CLIENT_SECRET'),
      callbackURL: configService.get<string>('MICROSOFT_CALLBACK_URL') || 'http://localhost:3000/api/auth/microsoft/callback',
      scope: ['user.read'],
      tenant: configService.get<string>('MICROSOFT_TENANT', 'common'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: (err: any, user: any) => void): Promise<any> {
    const { displayName, emails, id } = profile;
    const email = emails && emails.length > 0 ? emails[0].value : profile._json.mail || profile._json.userPrincipalName;
    const names = displayName ? displayName.split(' ') : ['', ''];

    const user = {
      provider: 'microsoft',
      id: id,
      email: email,
      firstName: names[0],
      lastName: names.slice(1).join(' '),
    };
    done(null, user);
  }
}
