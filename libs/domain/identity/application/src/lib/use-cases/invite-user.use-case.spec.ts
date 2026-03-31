import { vi, describe, it, expect, beforeEach } from 'vitest';
import { InviteUserUseCase } from './invite-user.use-case';
import { DomainException } from '@virteex/shared-util-server-server-config';

describe('InviteUserUseCase', () => {
  let useCase: InviteUserUseCase;
  let userRepository: any;
  let entitlementService: any;
  let authService: any;
  let eventEmitter: any;

  beforeEach(() => {
    userRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
    };
    entitlementService = {
      checkQuota: vi.fn(),
    };
    authService = {
        hashToken: vi.fn().mockReturnValue('hash'),
        hashPassword: vi.fn().mockResolvedValue('hash')
    };
    eventEmitter = {
        emit: vi.fn()
    };

    useCase = new InviteUserUseCase(
        userRepository,
        authService,
        eventEmitter,
        entitlementService
    );
  });

  it('should throw exception if user already exists', async () => {
    userRepository.findById.mockResolvedValue({ company: { id: 't1' }, country: 'US' });
    userRepository.findByEmail.mockResolvedValue({ id: 'existing' });
    userRepository.findAll.mockResolvedValue({ total: 1 });

    await expect(useCase.execute({ email: 'test@test.com' } as any, 'admin1'))
      .rejects.toThrow(DomainException);
  });

  it('should call checkQuota and save user if valid', async () => {
    userRepository.findById.mockResolvedValue({ id: 'admin1', company: { id: 't1' }, country: 'US' });
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findAll.mockResolvedValue({ total: 1 });

    await useCase.execute({ email: 'new@test.com', firstName: 'New', lastName: 'User', role: 'user' } as any, 'admin1');

    expect(entitlementService.checkQuota).toHaveBeenCalledWith('users', 1);
    expect(userRepository.save).toHaveBeenCalled();
  });
});
