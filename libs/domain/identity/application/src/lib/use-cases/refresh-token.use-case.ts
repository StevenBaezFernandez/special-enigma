import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import { RefreshTokenDto, LoginResponseDto } from '@virteex/domain-identity-contracts';
import {
  SessionRepository,
  AuditLogRepository,
  AuditLog,
  UserRepository,
  CachePort
} from '@virteex/domain-identity-domain';
import { TokenGenerationService } from '../services/token-generation.service';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(SessionRepository) private readonly sessionRepository: SessionRepository,
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
    @Inject(CachePort) private readonly cachePort: CachePort,
    @Inject(TokenGenerationService) private readonly tokenGenerationService: TokenGenerationService
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
       throw new DomainException('Invalid token format', 'UNAUTHORIZED');
    }

    const sessionStatus = await this.cachePort.get(`session:${sessionId}`);
    if (!sessionStatus || sessionStatus !== 'valid') {
        // Fallback or treat as invalid
    }

    const session = await this.sessionRepository.findById(sessionId);

    if (!session) {
       throw new DomainException('Session not found', 'UNAUTHORIZED');
    }

    if (!session.isActive) {
        throw new DomainException('Session is inactive', 'UNAUTHORIZED');
    }

    if (session.expiresAt < new Date()) {
        throw new DomainException('Session expired', 'UNAUTHORIZED');
    }

    const secretHash = crypto.createHash('sha256').update(secret).digest('hex');

    if (session.currentRefreshTokenHash !== secretHash) {
        session.isActive = false;
        await this.sessionRepository.save(session);

        await this.cachePort.del(`session:${sessionId}`);

        const userId = session.user.id || (session.user as any);
        await this.auditLogRepository.save(new AuditLog('TOKEN_REUSE_DETECTED', userId, { sessionId: session.id, ip: context.ip }));

        throw new DomainException('Token reuse detected. Session revoked.', 'UNAUTHORIZED');
    }

    let user = session.user;
    if (!user.email) {
        const foundUser = await this.userRepository.findById(user.id);
        if (!foundUser) throw new DomainException('User not found', 'UNAUTHORIZED');
        user = foundUser;
    }

    const { accessToken, refreshToken, expiresIn } = await this.tokenGenerationService.rotateSessionToken(session, user);

    await this.auditLogRepository.save(new AuditLog('TOKEN_REFRESHED', user.id, { sessionId: session.id, ip: context.ip }));

    return {
      accessToken,
      refreshToken,
      expiresIn,
      mfaRequired: false
    };
  }
}
