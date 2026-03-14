import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import { SessionRepository, UserRepository, AuthService, AuditLogRepository, CachePort, User, Session, Company } from '@virteex/domain-identity-domain';
import { TokenGenerationService } from '../services/token-generation.service';
import { DomainException } from '@virteex/shared-util-server-server-config';
import * as crypto from 'crypto';
import { vi, Mock } from 'vitest';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let sessionRepository: SessionRepository;
  let userRepository: UserRepository;
  let authService: AuthService;
  let auditLogRepository: AuditLogRepository;
  let cachePort: CachePort;
  let tokenGenerationService: TokenGenerationService;

  const mockSessionRepository = {
    findById: vi.fn(),
    save: vi.fn(),
  };

  const mockUserRepository = {
    findById: vi.fn(),
  };

  const mockAuthService = {
    generateToken: vi.fn(),
  };

  const mockAuditLogRepository = {
    save: vi.fn(),
  };

  const mockCachePort = {
    get: vi.fn(),
    del: vi.fn(),
    set: vi.fn()
  };

  const mockTokenGenerationService = {
    rotateSessionToken: vi.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        { provide: SessionRepository, useValue: mockSessionRepository },
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuditLogRepository, useValue: mockAuditLogRepository },
        { provide: CachePort, useValue: mockCachePort },
        { provide: TokenGenerationService, useValue: mockTokenGenerationService }
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    sessionRepository = module.get<SessionRepository>(SessionRepository);
    userRepository = module.get<UserRepository>(UserRepository);
    authService = module.get<AuthService>(AuthService);
    auditLogRepository = module.get<AuditLogRepository>(AuditLogRepository);
    cachePort = module.get<CachePort>(CachePort);
    tokenGenerationService = module.get<TokenGenerationService>(TokenGenerationService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw if token format is invalid', async () => {
      // Mock base64 failure implicitly by passing garbage that might fail split
    await expect(useCase.execute({ refreshToken: 'invalid' }, { ip: '1.2.3.4', userAgent: 'test' }))
      .rejects.toThrow(DomainException);
  });

  it('should throw if session not found', async () => {
    const sessionId = 'session-1';
    const secret = 'secret';
    const token = Buffer.from(`${sessionId}:${secret}`).toString('base64');
    (mockCachePort.get as Mock).mockResolvedValue('valid');
    (mockSessionRepository.findById as Mock).mockResolvedValue(null);

    await expect(useCase.execute({ refreshToken: token }, { ip: '1.2.3.4', userAgent: 'test' }))
      .rejects.toThrow(DomainException);
  });

  it('should revoke session if hash mismatch (reuse)', async () => {
    const sessionId = 'session-1';
    const secret = 'secret';
    const token = Buffer.from(`${sessionId}:${secret}`).toString('base64');
    const secretHash = crypto.createHash('sha256').update(secret).digest('hex');

    const user = { id: 'user-1' } as User;
    const session = {
      id: sessionId,
      isActive: true,
      expiresAt: new Date(Date.now() + 10000),
      currentRefreshTokenHash: 'different-hash',
      user: user
    } as Session;

    (mockCachePort.get as Mock).mockResolvedValue('valid');
    (mockSessionRepository.findById as Mock).mockResolvedValue(session);

    await expect(useCase.execute({ refreshToken: token }, { ip: '1.2.3.4', userAgent: 'test' }))
      .rejects.toThrow(DomainException);

    expect(session.isActive).toBe(false);
    expect(mockSessionRepository.save).toHaveBeenCalledWith(session);
    expect(mockAuditLogRepository.save).toHaveBeenCalled();
  });

  it('should rotate token if valid', async () => {
    const sessionId = 'session-1';
    const secret = 'secret';
    const token = Buffer.from(`${sessionId}:${secret}`).toString('base64');
    const secretHash = crypto.createHash('sha256').update(secret).digest('hex');

    const user = { id: 'user-1', email: 'test@example.com', role: 'admin', company: { id: 'comp-1'} as Company, country: 'US' } as User;
    const session = {
      id: sessionId,
      isActive: true,
      expiresAt: new Date(Date.now() + 10000),
      currentRefreshTokenHash: secretHash,
      user: user
    } as Session;

    (mockCachePort.get as Mock).mockResolvedValue('valid');
    (mockSessionRepository.findById as Mock).mockResolvedValue(session);

    (mockTokenGenerationService.rotateSessionToken as Mock).mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
        session: session
    });

    const result = await useCase.execute({ refreshToken: token }, { ip: '1.2.3.4', userAgent: 'test' });

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(mockTokenGenerationService.rotateSessionToken).toHaveBeenCalledWith(session, user);
  });
});
