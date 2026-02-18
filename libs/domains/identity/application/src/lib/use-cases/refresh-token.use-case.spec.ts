import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import {
  SessionRepository,
  UserRepository,
  AuthService,
  AuditLogRepository,
  User,
  Session,
  Company
} from '@virteex/identity-domain';
import { UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let sessionRepository: SessionRepository;
  let userRepository: UserRepository;
  let authService: AuthService;
  let auditLogRepository: AuditLogRepository;

  const mockSessionRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    findById: jest.fn(),
  };

  const mockAuthService = {
    generateToken: jest.fn(),
  };

  const mockAuditLogRepository = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        { provide: SessionRepository, useValue: mockSessionRepository },
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuditLogRepository, useValue: mockAuditLogRepository },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    sessionRepository = module.get<SessionRepository>(SessionRepository);
    userRepository = module.get<UserRepository>(UserRepository);
    authService = module.get<AuthService>(AuthService);
    auditLogRepository = module.get<AuditLogRepository>(AuditLogRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw if token format is invalid', async () => {
    await expect(useCase.execute({ refreshToken: 'invalid' }, { ip: '1.2.3.4', userAgent: 'test' }))
      .rejects.toThrow(UnauthorizedException);
  });

  it('should throw if session not found', async () => {
    const sessionId = 'session-1';
    const secret = 'secret';
    const token = Buffer.from(`${sessionId}:${secret}`).toString('base64');
    mockSessionRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ refreshToken: token }, { ip: '1.2.3.4', userAgent: 'test' }))
      .rejects.toThrow(UnauthorizedException);
  });

  it('should revoke session if hash mismatch (reuse)', async () => {
    const sessionId = 'session-1';
    const secret = 'secret';
    const token = Buffer.from(`${sessionId}:${secret}`).toString('base64');

    const user = { id: 'user-1' } as User;
    const session = {
      id: sessionId,
      isActive: true,
      expiresAt: new Date(Date.now() + 10000),
      currentRefreshTokenHash: 'different-hash',
      user: user
    } as Session;

    mockSessionRepository.findById.mockResolvedValue(session);

    await expect(useCase.execute({ refreshToken: token }, { ip: '1.2.3.4', userAgent: 'test' }))
      .rejects.toThrow(UnauthorizedException);

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

    mockSessionRepository.findById.mockResolvedValue(session);
    mockAuthService.generateToken.mockResolvedValue('new-access-token');

    const result = await useCase.execute({ refreshToken: token }, { ip: '1.2.3.4', userAgent: 'test' });

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBeDefined();
    expect(session.currentRefreshTokenHash).not.toBe(secretHash); // Rotated
    expect(mockSessionRepository.save).toHaveBeenCalledWith(session);
  });
});
