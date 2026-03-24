import { Test, TestingModule } from '@nestjs/testing';
import { GetSessionsUseCase } from './get-sessions.use-case';
import { SessionRepository } from '@virteex/domain-identity-domain';

describe('GetSessionsUseCase', () => {
  let useCase: GetSessionsUseCase;
  let repository: SessionRepository;

  const mockRepository = {
    findByUserId: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSessionsUseCase,
        { provide: SessionRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetSessionsUseCase>(GetSessionsUseCase);
    repository = module.get<SessionRepository>(SessionRepository);
  });

  it('should return sessions for a user', async () => {
    const userId = 'user-1';
    const mockSessions = [{ id: 'session-1' } as any];
    mockRepository.findByUserId.mockResolvedValue(mockSessions);

    const result = await useCase.execute(userId);

    expect(result).toEqual(mockSessions);
    expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId);
  });
});
