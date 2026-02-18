import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import {
  SessionRepository,
  AuditLogRepository,
  AuditLog,
  AuthService,
  UserRepository
} from '@virteex/identity-domain';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(SessionRepository) private readonly sessionRepository: SessionRepository,
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository
  ) {}

  async execute(dto: RefreshTokenDto, context: { ip: string; userAgent: string }): Promise<LoginResponseDto> {
    // 1. Decode Token
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

    // 2. Find Session
    // Assuming findById loads the relation or we load user separately
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

    // 3. Verify Hash (Rotation Check)
    const secretHash = crypto.createHash('sha256').update(secret).digest('hex');

    if (session.currentRefreshTokenHash !== secretHash) {
        // REUSE DETECTED!
        // Invalidate session immediately
        session.isActive = false;
        await this.sessionRepository.save(session);
        // Assuming session.user is loaded or has an ID
        const userId = session.user.id || (session.user as any);
        await this.auditLogRepository.save(new AuditLog('TOKEN_REUSE_DETECTED', userId, { sessionId: session.id, ip: context.ip }));
        throw new UnauthorizedException('Token reuse detected. Session revoked.');
    }

    // 4. Rotate Token
    const newSecret = crypto.randomBytes(32).toString('hex');
    const newHash = crypto.createHash('sha256').update(newSecret).digest('hex');

    session.currentRefreshTokenHash = newHash;
    session.expiresAt = new Date(Date.now() + 3600 * 1000); // +1 hour

    await this.sessionRepository.save(session);

    // 5. Generate Access Token
    // Ensure we have the user data
    let user = session.user;
    if (!user.email) { // If not populated
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
      expiresIn: 3600,
      mfaRequired: false
    };
  }
}
