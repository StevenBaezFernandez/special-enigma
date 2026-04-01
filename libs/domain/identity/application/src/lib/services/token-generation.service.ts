import { Injectable, Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import { SessionRepository, AuthService, CachePort, User, Session } from '@virteex/domain-identity-domain';
import { SUBSCRIPTION_REPOSITORY, type SubscriptionRepository } from '@virteex/domain-subscription-domain';

export interface TokenGenerationResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  session: Session;
}

@Injectable()
export class TokenGenerationService {
  constructor(
    @Inject(SessionRepository) private readonly sessionRepository: SessionRepository,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(CachePort) private readonly cachePort: CachePort,
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptionRepository: SubscriptionRepository
  ) {}

  async createSessionAndTokens(
    user: User,
    context: { ip: string; userAgent: string },
    riskScore: number = 0,
    mfaVerified = false
  ): Promise<TokenGenerationResult> {
    const refreshTokenSecret = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenSecret).digest('hex');

    const SESSION_TTL = 7 * 24 * 3600; // 7 days in seconds
    const expiresAt = new Date(Date.now() + SESSION_TTL * 1000);

    const session = new Session(user, context.ip, context.userAgent, expiresAt, riskScore);
    session.currentRefreshTokenHash = refreshTokenHash;
    await this.sessionRepository.save(session);

    await this.cachePort.set(`session:${session.id}`, 'valid', SESSION_TTL);

    const subscription = await this.subscriptionRepository.findByTenantId(user.company.id);
    const entitlements = subscription?.getPlan()?.features || [];

    const accessToken = await this.authService.generateToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.company.id,
      companyId: user.company.id,
      country: user.country,
      sessionId: session.id,
      entitlements,
      amr: mfaVerified ? ['pwd', 'mfa'] : ['pwd'],
      mfa_verified_at: mfaVerified ? Math.floor(Date.now() / 1000) : undefined
    }, { tokenType: 'access', subject: user.id });

    const refreshToken = Buffer.from(`${session.id}:${refreshTokenSecret}`).toString('base64');

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes
      session
    };
  }

  async rotateSessionToken(session: Session, user: User, mfaVerified = false): Promise<TokenGenerationResult> {
    const refreshTokenSecret = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenSecret).digest('hex');

    const SESSION_TTL = 7 * 24 * 3600;
    session.expiresAt = new Date(Date.now() + SESSION_TTL * 1000);
    session.currentRefreshTokenHash = refreshTokenHash;

    await this.sessionRepository.save(session);
    await this.cachePort.set(`session:${session.id}`, 'valid', SESSION_TTL);

    const subscription = await this.subscriptionRepository.findByTenantId(user.company.id);
    const entitlements = subscription?.getPlan()?.features || [];

    const accessToken = await this.authService.generateToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.company.id,
      companyId: user.company.id,
      country: user.country,
      sessionId: session.id,
      entitlements,
      amr: mfaVerified ? ['pwd', 'mfa'] : ['pwd'],
      mfa_verified_at: mfaVerified ? Math.floor(Date.now() / 1000) : undefined
    }, { tokenType: 'access', subject: user.id });

    const refreshToken = Buffer.from(`${session.id}:${refreshTokenSecret}`).toString('base64');

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      session
    };
  }
}
