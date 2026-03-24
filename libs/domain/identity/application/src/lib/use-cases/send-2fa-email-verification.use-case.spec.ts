import { Test, TestingModule } from '@nestjs/testing';
import { Send2faEmailVerificationUseCase } from './send-2fa-email-verification.use-case';
import { UserRepository, NotificationService, CachePort } from '@virteex/domain-identity-domain';

describe('Send2faEmailVerificationUseCase', () => {
  let useCase: Send2faEmailVerificationUseCase;
  const mockUserRepo = { findById: vi.fn() };
  const mockNotification = { sendNotification: vi.fn() };
  const mockCache = { set: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Send2faEmailVerificationUseCase,
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: NotificationService, useValue: mockNotification },
        { provide: CachePort, useValue: mockCache },
      ],
    }).compile();
    useCase = module.get<Send2faEmailVerificationUseCase>(Send2faEmailVerificationUseCase);
  });

  it('should send notification', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'u1' });
    await useCase.execute('u1');
    expect(mockNotification.sendNotification).toHaveBeenCalled();
  });
});
