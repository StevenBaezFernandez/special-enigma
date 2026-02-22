import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecretManagerService } from '../services/secret-manager.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly secretManager: SecretManagerService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null;
          if (request && request.cookies && request.cookies['access_token']) {
            token = request.cookies['access_token'];
          }
          if (!token && request.headers.authorization) {
              const authHeader = request.headers.authorization;
              if (authHeader.startsWith('Bearer ')) {
                  token = authHeader.substring(7);
              }
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secretManager.getJwtSecret(),
      audience: configService.get<string>('JWT_AUDIENCE'),
      issuer: configService.get<string>('JWT_ISSUER'),
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
