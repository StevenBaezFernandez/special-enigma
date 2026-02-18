import { Injectable, Inject, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';
import { LoginUserDto } from '../dto/login-user.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import {
  UserRepository, SessionRepository, Session, AuditLogRepository, AuditLog,
  RiskEngineService, AuthService
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
    @Inject(RiskEngineService) private readonly riskEngineService: RiskEngineService
  ) {}

  async execute(dto: LoginUserDto, context: LoginContext = { ip: 'unknown', userAgent: 'unknown' }): Promise<LoginResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);

    // 1. Check if user exists
    if (!user) {
      await this.auditLogRepository.save(new AuditLog('LOGIN_FAILED_USER_NOT_FOUND', undefined, { email: dto.email, ip: context.ip }));
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Check Lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.auditLogRepository.save(new AuditLog('LOGIN_FAILED_LOCKED', user.id, { ip: context.ip }));
      throw new ForbiddenException(`Account locked until ${user.lockedUntil.toISOString()}`);
    }

    // 3. Verify Password
    const isPasswordValid = await this.authService.verifyPassword(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= 3) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        await this.auditLogRepository.save(new AuditLog('ACCOUNT_LOCKED', user.id, { ip: context.ip, reason: 'Too many failed attempts' }));
      } else {
        await this.auditLogRepository.save(new AuditLog('LOGIN_FAILED_BAD_PASSWORD', user.id, { ip: context.ip }));
      }

      await this.userRepository.save(user); // Persist attempts
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Verify Active Status
    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    // 5. Calculate Risk
    const riskScore = await this.riskEngineService.calculateRisk({
      ip: context.ip,
      country: user.country, // Expected country vs actual IP
      userAgent: context.userAgent,
      email: user.email
    });

    // 6. MFA Logic (Adaptive)
    let mfaRequired = false;

    if (user.mfaEnabled || riskScore > 60) {
      // If risk is high or MFA enforced, we require MFA.

      // If Risk > 90, we block.
      if (riskScore > 90) {
          await this.auditLogRepository.save(new AuditLog('LOGIN_BLOCKED_HIGH_RISK', user.id, { score: riskScore }));
          throw new ForbiddenException('Login blocked due to suspicious activity. Contact support.');
      }

      mfaRequired = true;
      await this.auditLogRepository.save(new AuditLog('LOGIN_MFA_CHALLENGE', user.id, { score: riskScore }));
    }

    // 7. Reset Lockout counters on success (partial success if MFA required)
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    user.riskScore = riskScore; // Update baseline
    await this.userRepository.save(user);

    if (mfaRequired) {
        // Generate partial token (e.g. valid for 5 mins, only for MFA verification)
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

    // 8. Generate Secure Refresh Token
    const refreshTokenSecret = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenSecret).digest('hex');

    // 9. Create Session (Only if MFA passed or not required)
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour
    const session = new Session(user, context.ip, context.userAgent, expiresAt, riskScore);
    session.currentRefreshTokenHash = refreshTokenHash;
    await this.sessionRepository.save(session);

    // 10. Generate Tokens
    const token = await this.authService.generateToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.company.id,
      country: user.country,
      sessionId: session.id
    });

    // Composite Refresh Token: sessionId:secret (base64 encoded)
    const refreshToken = Buffer.from(`${session.id}:${refreshTokenSecret}`).toString('base64');

    await this.auditLogRepository.save(new AuditLog('LOGIN_SUCCESS', user.id, { ip: context.ip, sessionId: session.id, risk: riskScore }));

    return {
      accessToken: token,
      refreshToken: refreshToken,
      expiresIn: 3600,
      mfaRequired: false
    };
  }
}
