import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SecretManagerService } from '../services/secret-manager.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
      private reflector: Reflector,
      private configService: ConfigService,
      private secretManager: SecretManagerService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    let token = null;

    if (request.cookies && request.cookies['access_token']) {
      token = request.cookies['access_token'];
    } else {
      const authHeader = request.headers.authorization;
      if (authHeader) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      throw new UnauthorizedException('Missing Authentication Token');
    }

    const secrets = this.secretManager.getJwtVerificationSecrets();

    // P1: Enforce strict audience and issuer validation if configured
    const audience = this.configService.get<string>('JWT_AUDIENCE');
    const issuer = this.configService.get<string>('JWT_ISSUER');

    const verifyOptions: jwt.VerifyOptions = {};
    if (audience) verifyOptions.audience = audience;
    if (issuer) verifyOptions.issuer = issuer;

    for (const secret of secrets) {
        try {
            const payload = jwt.verify(token, secret, verifyOptions);
            request.user = payload;
            return true;
        } catch (err: any) {
            if (err.name === 'TokenExpiredError') {
                 // If signature matches but expired, it is expired.
                 throw new UnauthorizedException('Token Expired');
            }
            // If invalid signature, try next key (rotation support)
        }
    }

    throw new UnauthorizedException('Invalid Token');
  }
}
