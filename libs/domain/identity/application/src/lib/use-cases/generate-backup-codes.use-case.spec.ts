import { Test, TestingModule } from '@nestjs/testing';
import { GenerateBackupCodesUseCase } from './generate-backup-codes.use-case';
import { UserRepository, AuditLogRepository } from '@virteex/domain-identity-domain';

describe('GenerateBackupCodesUseCase', () => {
  let useCase: GenerateBackupCodesUseCase;
  const mockUserRepo = { findById: vi.fn(), update: vi.fn() };
  const mockAuditRepo = { save: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateBackupCodesUseCase,
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: AuditLogRepository, useValue: mockAuditRepo },
      ],
    }).compile();
    useCase = module.get<GenerateBackupCodesUseCase>(GenerateBackupCodesUseCase);
  });

  it('should generate 10 codes', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'u1' });
    const result = await useCase.execute('u1');
    expect(result.codes).toHaveLength(10);
    expect(mockAuditRepo.save).toHaveBeenCalled();
  });
});
