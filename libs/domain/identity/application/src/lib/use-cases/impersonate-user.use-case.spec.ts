import { Test, TestingModule } from '@nestjs/testing';
import { EntityNotFoundException } from "@virteex/kernel-exceptions";
import { ImpersonateUserUseCase } from './impersonate-user.use-case';
import { UserRepository, AuditLogRepository } from '@virteex/domain-identity-domain';
import { TokenGenerationService } from '../services/token-generation.service';
import { UnauthorizedException } from '@virteex/kernel-exceptions';
import { vi } from 'vitest';

describe('ImpersonateUserUseCase', () => {
  let useCase: ImpersonateUserUseCase;

  const mockUserRepository = {
    findById: vi.fn(),
  };
  const mockTokenService = {
    createSessionAndTokens: vi.fn(),
  };
  const mockAuditRepo = {
    save: vi.fn(),
  };

  beforeEach(async () => {
    useCase = new ImpersonateUserUseCase(
        mockUserRepository as any,
        mockTokenService as any,
        mockAuditRepo as any
    );
  });

  it('should allow admin to impersonate target user', async () => {
    mockUserRepository.findById
      .mockResolvedValueOnce({ id: 'admin-1', role: 'admin' })
      .mockResolvedValueOnce({ id: 'target-1' });
    mockTokenService.createSessionAndTokens.mockResolvedValue({ accessToken: 'token' });

    const result = await useCase.execute('admin-1', 'target-1', { ip: '1.1.1.1', userAgent: 'ua' });

    expect(result.accessToken).toBe('token');
    expect(mockAuditRepo.save).toHaveBeenCalled();
  });

  it('should throw if requester is not admin', async () => {
    mockUserRepository.findById.mockResolvedValue({ id: 'user-1', role: 'user' });
    await expect(useCase.execute('user-1', 'target-1', { ip: 'i', userAgent: 'u' } as any)).rejects.toThrow(UnauthorizedException);
  });
});
