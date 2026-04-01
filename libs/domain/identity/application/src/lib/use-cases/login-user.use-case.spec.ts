import { Test, TestingModule } from '@nestjs/testing';
import { EntityNotFoundException } from "@virteex/kernel-exceptions";
import { LoginUserUseCase } from './login-user.use-case';
import { UserRepository, AuditLogRepository, AuthService, RiskEngineService, RecaptchaPort } from '@virteex/domain-identity-domain';
import { TokenGenerationService } from '../services/token-generation.service';
import { ForbiddenException, UnauthorizedException } from '@virteex/kernel-exceptions';
import { vi, Mock } from 'vitest';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let userRepository: UserRepository;
  let authService: AuthService;
  let auditLogRepository: AuditLogRepository;
  let riskEngineService: RiskEngineService;
  let tokenGenerationService: TokenGenerationService;
  let recaptchaService: RecaptchaPort;

  const mockUser = {
      id: '123',
      email: 'test@test.com',
      passwordHash: 'hash',
      isActive: true,
      country: 'CO',
      role: 'user',
      failedLoginAttempts: 0,
      mfaEnabled: false,
      company: { id: 'co_123' },
      lockedUntil: undefined
  };

  const mockSession = { id: 'session_123' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserUseCase,
        {
          provide: UserRepository,
          useValue: { findByEmail: vi.fn().mockResolvedValue(mockUser), save: vi.fn() }
        },
        {
          provide: AuthService,
          useValue: { verifyPassword: vi.fn().mockResolvedValue(true), generateToken: vi.fn().mockResolvedValue('token') }
        },
        {
          provide: AuditLogRepository,
          useValue: { save: vi.fn() }
        },
        {
          provide: RiskEngineService,
          useValue: { calculateRisk: vi.fn().mockResolvedValue(0) }
        },
        {
          provide: TokenGenerationService,
          useValue: {
              createSessionAndTokens: vi.fn().mockResolvedValue({
                  accessToken: 'token',
                  refreshToken: 'refresh',
                  expiresIn: 900,
                  session: mockSession
              })
          }
        },
        {
          provide: RecaptchaPort,
          useValue: { verify: vi.fn().mockResolvedValue(true) }
        }
      ]
    }).compile();

    useCase = module.get<LoginUserUseCase>(LoginUserUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
    authService = module.get<AuthService>(AuthService);
    auditLogRepository = module.get<AuditLogRepository>(AuditLogRepository);
    riskEngineService = module.get<RiskEngineService>(RiskEngineService);
    tokenGenerationService = module.get<TokenGenerationService>(TokenGenerationService);
    recaptchaService = module.get<RecaptchaPort>(RecaptchaPort);
  });

  it('should allow valid login', async () => {
    const dto = { email: 'test@test.com', password: 'pass', recaptchaToken: 'valid-token' };
    const result = await useCase.execute(dto);
    expect(result).toHaveProperty('accessToken', 'token');
    expect(result.mfaRequired).toBeFalsy();
  });

  it('should lock account after 3 failed attempts', async () => {
      const dto = { email: 'test@test.com', password: 'wrong', recaptchaToken: 'valid-token' };
      (authService.verifyPassword as Mock).mockResolvedValue(false);

      const userClone = { ...mockUser, failedLoginAttempts: 2 };
      (userRepository.findByEmail as Mock).mockResolvedValue(userClone);

      await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);

      expect(userClone.failedLoginAttempts).toBe(3);
      expect(userClone.lockedUntil).toBeDefined();
      expect(auditLogRepository.save).toHaveBeenCalledWith(expect.objectContaining({ event: 'ACCOUNT_LOCKED' }));
  });

  it('should require MFA if risk score is high', async () => {
      const dto = { email: 'test@test.com', password: 'pass', recaptchaToken: 'valid-token' };
      (riskEngineService.calculateRisk as Mock).mockResolvedValue(75);

      const result = await useCase.execute(dto);
      expect(result.mfaRequired).toBe(true);
      expect(result.tempToken).toBe('token'); // Mocked generateToken
      expect(result.accessToken).toBeUndefined();
  });

  it('should block login if risk score is critical (> 90)', async () => {
      const dto = { email: 'test@test.com', password: 'pass', recaptchaToken: 'valid-token' };
      (riskEngineService.calculateRisk as Mock).mockResolvedValue(95);

      await expect(useCase.execute(dto)).rejects.toThrow(ForbiddenException);
      expect(auditLogRepository.save).toHaveBeenCalledWith(expect.objectContaining({ event: 'LOGIN_BLOCKED_HIGH_RISK' }));
  });
});
