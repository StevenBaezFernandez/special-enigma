import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private configService: ConfigService) {}

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

    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in configuration');
    }

    try {
      // P1: Enforce strict audience and issuer validation if configured
      const audience = this.configService.get<string>('JWT_AUDIENCE');
      const issuer = this.configService.get<string>('JWT_ISSUER');

      const verifyOptions: jwt.VerifyOptions = {};
      if (audience) verifyOptions.audience = audience;
      if (issuer) verifyOptions.issuer = issuer;

      const payload = jwt.verify(token, secret, verifyOptions);
      request.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or Expired Token');
    }
  }
}
