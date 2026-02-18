import { Injectable, Inject, BadRequestException, UnauthorizedException } from '@nestjs/common';
import {
  AuthService, NotificationService, UserRepository, CompanyRepository,
  AuditLogRepository, AuditLog, RiskEngineService,
  User, Company, Session, SessionRepository, CachePort
} from '@virteex/identity-domain';
import { IsString, IsNotEmpty } from 'class-validator';
import { EntityManager } from '@mikro-orm/core';
import * as crypto from 'crypto';

export class CompleteOnboardingDto {
  @IsString()
  @IsNotEmpty()
  onboardingToken!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  phone!: string;

  @IsString()
  companyName!: string;

  @IsString()
  taxId!: string;

  @IsString()
  country!: string;

  @IsString()
  regime!: string;

  @IsString()
  industry!: string;
}

@Injectable()
export class CompleteOnboardingUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(CompanyRepository) private readonly companyRepository: CompanyRepository,
    @Inject(SessionRepository) private readonly sessionRepository: SessionRepository,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(NotificationService) private readonly notificationService: NotificationService,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
    @Inject(RiskEngineService) private readonly riskEngineService: RiskEngineService,
    @Inject(CachePort) private readonly cachePort: CachePort,
    private readonly em: EntityManager
  ) {}

  async execute(dto: CompleteOnboardingDto, context: { ip: string, userAgent: string }) {
    let email: string;
    try {
        const payload = await this.authService.verifyToken(dto.onboardingToken);
        if (!payload.verified || payload.scope !== 'onboarding') {
            throw new Error();
        }
        email = payload.email;
    } catch {
        throw new UnauthorizedException('Invalid or expired onboarding token');
    }

    const key = `signup:${email}`;
    const storedData = await this.cachePort.get(key);
    if (!storedData) {
        throw new BadRequestException('Signup session expired. Please restart.');
    }

    const { passwordHash } = JSON.parse(storedData);

    // Validate Tax ID
    this.validateTaxId(dto.country, dto.taxId);

    const result = await this.em.transactional(async (em) => {
        const company = new Company(dto.companyName, dto.taxId, dto.country);
        if (dto.country === 'CO') {
            company.settings = { fiscalRegime: dto.regime, taxProvider: 'DIAN' };
            company.currency = 'COP';
        } else if (dto.country === 'MX') {
             company.settings = { fiscalRegime: dto.regime, taxProvider: 'SAT' };
             company.currency = 'MXN';
        } else {
             company.settings = { fiscalRegime: dto.regime };
             company.currency = 'USD';
        }

        em.persist(company);

        const user = new User(
            email,
            passwordHash,
            dto.firstName,
            dto.lastName,
            dto.country,
            company
        );
        user.role = 'admin';
        user.phone = dto.phone;
        user.isActive = true;

        const rawSecret = this.authService.generateMfaSecret();
        user.mfaSecret = await this.authService.encrypt(rawSecret);
        user.mfaEnabled = true;

        em.persist(user);

        return { user, company, rawSecret };
    });

    const { user } = result;

    await this.cachePort.del(key);

    const refreshTokenSecret = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenSecret).digest('hex');
    const SESSION_TTL = 7 * 24 * 3600;
    const expiresAt = new Date(Date.now() + SESSION_TTL * 1000);

    const riskScore = 0;

    const session = new Session(user, context.ip, context.userAgent, expiresAt, riskScore);
    session.currentRefreshTokenHash = refreshTokenHash;

    await this.sessionRepository.save(session);
    await this.cachePort.set(`session:${session.id}`, 'valid', SESSION_TTL);

    const accessToken = await this.authService.generateToken({
        sub: user.id,
        email: user.email,
        role: user.role,
        companyId: user.company.id,
        country: user.country,
        sessionId: session.id
    });

    const refreshToken = Buffer.from(`${session.id}:${refreshTokenSecret}`).toString('base64');

    await this.auditLogRepository.save(new AuditLog('REGISTER_SUCCESS', user.id, { ip: context.ip }));

    console.log(`[MOCK EMAIL] Welcome ${user.email}`);

    return {
        accessToken,
        refreshToken,
        expiresIn: 900,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            companyName: user.company.name
        }
    };
  }

  private validateTaxId(country: string, taxId: string): void {
    const countryCode = country.toUpperCase();
    let isValid = true;
    let errorMsg = '';

    switch (countryCode) {
      case 'CO': {
        const nit = taxId.replace(/[^0-9]/g, '');
        if (!/^\d{9,10}$/.test(nit)) {
          isValid = false;
          errorMsg = 'Invalid NIT for Colombia. Must be 9-10 digits.';
        }
        break;
      }
      case 'MX': {
        const rfc = taxId.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (rfc.length < 12 || rfc.length > 13) {
             isValid = false;
             errorMsg = 'Invalid RFC for Mexico. Must be 12-13 alphanumeric characters.';
        } else if (!/^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/.test(rfc)) {
             isValid = false;
             errorMsg = 'Invalid RFC format.';
        }
        break;
      }
      case 'US': {
        const ein = taxId.replace(/[^0-9]/g, '');
        if (!/^\d{9}$/.test(ein)) {
          isValid = false;
          errorMsg = 'Invalid EIN for USA. Must be 9 digits.';
        }
        break;
      }
      default:
        if (taxId.length < 5) {
            isValid = false;
            errorMsg = 'Tax ID too short.';
        }
        break;
    }

    if (!isValid) {
      throw new BadRequestException(errorMsg);
    }
  }
}
