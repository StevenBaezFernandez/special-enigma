import { Test, TestingModule } from '@nestjs/testing';
import { RevokeSessionUseCase } from './revoke-session.use-case';
import { SessionRepository, CachePort } from '@virteex/domain-identity-domain';
import { UnauthorizedException } from '@nestjs/common';

describe('RevokeSessionUseCase', () => {
  let useCase: RevokeSessionUseCase;
  let repository: SessionRepository;
  let cache: CachePort;

  const mockRepository = {
    findById: vi.fn(),
    delete: vi.fn(),
  };
  const mockCache = {
    del: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevokeSessionUseCase,
        { provide: SessionRepository, useValue: mockRepository },
        { provide: CachePort, useValue: mockCache },
      ],
    }).compile();

    useCase = module.get<RevokeSessionUseCase>(RevokeSessionUseCase);
    repository = module.get<SessionRepository>(SessionRepository);
    cache = module.get<CachePort>(CachePort);
  });

  it('should revoke session if owned by user', async () => {
    const userId = 'user-1';
    const sessionId = 'session-1';
    mockRepository.findById.mockResolvedValue({ id: sessionId, user: { id: userId } });

    await useCase.execute(userId, sessionId);

    expect(mockCache.del).toHaveBeenCalledWith(`session:${sessionId}`);
    expect(mockRepository.delete).toHaveBeenCalledWith(sessionId);
  });

  it('should throw UnauthorizedException if session not owned by user', async () => {
    const userId = 'user-1';
    const sessionId = 'session-1';
    mockRepository.findById.mockResolvedValue({ id: sessionId, user: { id: 'other-user' } });

    await expect(useCase.execute(userId, sessionId)).rejects.toThrow(UnauthorizedException);
  });
});
