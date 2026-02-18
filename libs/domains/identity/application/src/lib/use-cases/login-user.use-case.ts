import { Injectable, Inject, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';
import { LoginUserDto } from '../dto/login-user.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import {
  UserRepository, SessionRepository, Session, AuditLogRepository, AuditLog,
  RiskEngineService, AuthService, CachePort
} from '@virteex/identity-domain';

export interface LoginContext {
  ip: string;
  userAgent: string;
  country?: string; // Detected country
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(SessionRepository) private readonly sessionRepository: SessionRepository,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
    @Inject(RiskEngineService) private readonly riskEngineService: RiskEngineService,
    @Inject(CachePort) private readonly cachePort: CachePort
  ) {}

  async execute(dto: LoginUserDto, context: LoginContext = { ip: 'unknown', userAgent: 'unknown' }): Promise<LoginResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      await this.auditLogRepository.save(new AuditLog('LOGIN_FAILED_USER_NOT_FOUND', undefined, { email: dto.email, ip: context.ip }));
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.auditLogRepository.save(new AuditLog('LOGIN_FAILED_LOCKED', user.id, { ip: context.ip }));
      throw new ForbiddenException(`Account locked until ${user.lockedUntil.toISOString()}`);
    }

    const isPasswordValid = await this.authService.verifyPassword(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= 3) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        await this.auditLogRepository.save(new AuditLog('ACCOUNT_LOCKED', user.id, { ip: context.ip, reason: 'Too many failed attempts' }));
      } else {
        await this.auditLogRepository.save(new AuditLog('LOGIN_FAILED_BAD_PASSWORD', user.id, { ip: context.ip }));
      }

      await this.userRepository.save(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    const riskScore = await this.riskEngineService.calculateRisk({
      ip: context.ip,
      country: user.country,
      userAgent: context.userAgent,
      email: user.email
    });

    let mfaRequired = false;

    if (user.mfaEnabled || riskScore > 60) {
      if (riskScore > 90) {
          await this.auditLogRepository.save(new AuditLog('LOGIN_BLOCKED_HIGH_RISK', user.id, { score: riskScore }));
          throw new ForbiddenException('Login blocked due to suspicious activity. Contact support.');
      }

      mfaRequired = true;
      await this.auditLogRepository.save(new AuditLog('LOGIN_MFA_CHALLENGE', user.id, { score: riskScore }));
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    user.riskScore = riskScore;
    await this.userRepository.save(user);

    if (mfaRequired) {
        const tempToken = await this.authService.generateToken({
            sub: user.id,
            email: user.email,
            partial: true,
            riskScore
        });

        return {
            mfaRequired: true,
            tempToken
        };
    }

    const refreshTokenSecret = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenSecret).digest('hex');

    const SESSION_TTL = 7 * 24 * 3600; // seconds
    const expiresAt = new Date(Date.now() + SESSION_TTL * 1000);

    const session = new Session(user, context.ip, context.userAgent, expiresAt, riskScore);
    session.currentRefreshTokenHash = refreshTokenHash;
    await this.sessionRepository.save(session);

    await this.cachePort.set(`session:${session.id}`, 'valid', SESSION_TTL);

    const token = await this.authService.generateToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.company.id,
      country: user.country,
      sessionId: session.id
    });

    const refreshToken = Buffer.from(`${session.id}:${refreshTokenSecret}`).toString('base64');

    await this.auditLogRepository.save(new AuditLog('LOGIN_SUCCESS', user.id, { ip: context.ip, sessionId: session.id, risk: riskScore }));

    return {
      accessToken: token,
      refreshToken: refreshToken,
      expiresIn: 900,
      mfaRequired: false
    };
  }
}
