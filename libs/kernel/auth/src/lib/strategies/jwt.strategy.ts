import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtTokenService } from '../services/jwt-token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly jwtTokenService: JwtTokenService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null;
          if (request?.cookies?.['access_token']) token = request.cookies['access_token'];
          if (!token && request.headers.authorization?.startsWith('Bearer ')) {
            token = request.headers.authorization.substring(7);
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKeyProvider: (_request: Request, rawJwtToken: string, done: (err: Error | null, secret?: string | Buffer) => void) => {
        try {
          done(null, this.jwtTokenService.getVerificationSecretForToken(rawJwtToken));
        } catch (error: any) {
          done(error);
        }
      },
      algorithms: ['HS256', 'HS384', 'HS512'],
    });
  }

  async validate(request: Request, _payload: any) {
    const token = request?.cookies?.['access_token']
      || (request.headers.authorization?.startsWith('Bearer ') ? request.headers.authorization.substring(7) : undefined);

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    return this.jwtTokenService.verifyToken(token, 'access');
  }
}
