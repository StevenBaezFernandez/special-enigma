import { Test, TestingModule } from '@nestjs/testing';
import { Disable2faUseCase } from './disable-2fa.use-case';
import { UserRepository, AuditLogRepository } from '@virteex/domain-identity-domain';

describe('Disable2faUseCase', () => {
  let useCase: Disable2faUseCase;
  const mockUserRepo = { findById: vi.fn(), update: vi.fn() };
  const mockAuditRepo = { save: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Disable2faUseCase,
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: AuditLogRepository, useValue: mockAuditRepo },
      ],
    }).compile();
    useCase = module.get<Disable2faUseCase>(Disable2faUseCase);
  });

  it('should disable MFA', async () => {
    const user = { id: 'u1', mfaEnabled: true, mfaSecret: 'sec' };
    mockUserRepo.findById.mockResolvedValue(user);

    await useCase.execute('u1');

    expect(user.mfaEnabled).toBe(false);
    expect(user.mfaSecret).toBeUndefined();
    expect(mockUserRepo.update).toHaveBeenCalledWith(user);
    expect(mockAuditRepo.save).toHaveBeenCalled();
  });
});
