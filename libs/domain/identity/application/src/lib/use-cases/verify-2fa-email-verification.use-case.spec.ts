import { Test, TestingModule } from '@nestjs/testing';
import { Verify2faEmailVerificationUseCase } from './verify-2fa-email-verification.use-case';
import { UserRepository, CachePort } from '@virteex/domain-identity-domain';
import { UnauthorizedException } from '@nestjs/common';

describe('Verify2faEmailVerificationUseCase', () => {
  let useCase: Verify2faEmailVerificationUseCase;
  const mockUserRepo = { findById: vi.fn() };
  const mockCache = { get: vi.fn(), del: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Verify2faEmailVerificationUseCase,
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: CachePort, useValue: mockCache },
      ],
    }).compile();
    useCase = module.get<Verify2faEmailVerificationUseCase>(Verify2faEmailVerificationUseCase);
  });

  it('should verify correct code', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'u1' });
    mockCache.get.mockResolvedValue('123456');
    await useCase.execute('u1', '123456');
    expect(mockCache.del).toHaveBeenCalled();
  });

  it('should throw for wrong code', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'u1' });
    mockCache.get.mockResolvedValue('123456');
    await expect(useCase.execute('u1', 'wrong')).rejects.toThrow(UnauthorizedException);
  });
});
