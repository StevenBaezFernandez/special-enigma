import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import {
  SessionRepository,
  AuditLogRepository,
  AuditLog,
  AuthService,
  UserRepository,
  CachePort
} from '@virteex/identity-domain';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(SessionRepository) private readonly sessionRepository: SessionRepository,
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
    @Inject(CachePort) private readonly cachePort: CachePort
  ) {}

  async execute(dto: RefreshTokenDto, context: { ip: string; userAgent: string }): Promise<LoginResponseDto> {
    let sessionId: string;
    let secret: string;

    try {
      const decoded = Buffer.from(dto.refreshToken, 'base64').toString('utf-8');
      const parts = decoded.split(':');
      if (parts.length !== 2) throw new Error();
      sessionId = parts[0];
      secret = parts[1];
    } catch {
       throw new UnauthorizedException('Invalid token format');
    }

    const sessionStatus = await this.cachePort.get(`session:${sessionId}`);
    if (!sessionStatus || sessionStatus !== 'valid') {
        // Fallback or treat as invalid
    }

    const session = await this.sessionRepository.findById(sessionId);

    if (!session) {
       throw new UnauthorizedException('Session not found');
    }

    if (!session.isActive) {
        throw new UnauthorizedException('Session is inactive');
    }

    if (session.expiresAt < new Date()) {
        throw new UnauthorizedException('Session expired');
    }

    const secretHash = crypto.createHash('sha256').update(secret).digest('hex');

    if (session.currentRefreshTokenHash !== secretHash) {
        session.isActive = false;
        await this.sessionRepository.save(session);

        await this.cachePort.del(`session:${sessionId}`);

        const userId = session.user.id || (session.user as any);
        await this.auditLogRepository.save(new AuditLog('TOKEN_REUSE_DETECTED', userId, { sessionId: session.id, ip: context.ip }));

        throw new UnauthorizedException('Token reuse detected. Session revoked.');
    }

    const newSecret = crypto.randomBytes(32).toString('hex');
    const newHash = crypto.createHash('sha256').update(newSecret).digest('hex');

    session.currentRefreshTokenHash = newHash;
    const SESSION_TTL = 7 * 24 * 3600;
    session.expiresAt = new Date(Date.now() + SESSION_TTL * 1000);

    await this.sessionRepository.save(session);

    await this.cachePort.set(`session:${session.id}`, 'valid', SESSION_TTL);

    let user = session.user;
    if (!user.email) {
        const foundUser = await this.userRepository.findById(user.id);
        if (!foundUser) throw new UnauthorizedException('User not found');
        user = foundUser;
    }

    const accessToken = await this.authService.generateToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.company.id,
      country: user.country,
      sessionId: session.id
    });

    const newRefreshToken = Buffer.from(`${session.id}:${newSecret}`).toString('base64');

    await this.auditLogRepository.save(new AuditLog('TOKEN_REFRESHED', user.id, { sessionId: session.id, ip: context.ip }));

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900,
      mfaRequired: false
    };
  }
}
