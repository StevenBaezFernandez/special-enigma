import { Test, TestingModule } from '@nestjs/testing';
import { ChangePasswordUseCase } from './change-password.use-case';
import { UserRepository, AuthService, AuditLogRepository, SessionRepository } from '@virteex/domain-identity-domain';
import { UnauthorizedException } from '@nestjs/common';

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;

  const mockUserRepo = { findById: vi.fn(), save: vi.fn() };
  const mockAuthService = { verifyPassword: vi.fn(), hashPassword: vi.fn() };
  const mockAuditRepo = { save: vi.fn() };
  const mockSessionRepo = { deleteByUserId: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordUseCase,
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuditLogRepository, useValue: mockAuditRepo },
        { provide: SessionRepository, useValue: mockSessionRepo },
      ],
    }).compile();
    useCase = module.get<ChangePasswordUseCase>(ChangePasswordUseCase);
  });

  it('should change password and invalidate sessions', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'u1', passwordHash: 'old' });
    mockAuthService.verifyPassword.mockResolvedValue(true);
    mockAuthService.hashPassword.mockResolvedValue('new-hash');

    await useCase.execute('u1', { oldPassword: 'old', newPassword: 'new' });

    expect(mockUserRepo.save).toHaveBeenCalled();
    expect(mockSessionRepo.deleteByUserId).toHaveBeenCalledWith('u1');
    expect(mockAuditRepo.save).toHaveBeenCalled();
  });

  it('should throw if old password is wrong', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'u1', passwordHash: 'old' });
    mockAuthService.verifyPassword.mockResolvedValue(false);
    await expect(useCase.execute('u1', { oldPassword: 'wrong', newPassword: 'new' })).rejects.toThrow(UnauthorizedException);
  });
});
