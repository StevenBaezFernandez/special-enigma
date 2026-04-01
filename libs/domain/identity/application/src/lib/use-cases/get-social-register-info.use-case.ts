import { Injectable, Inject } from '@nestjs/common';
import { UnauthorizedException } from '@virteex/kernel-exceptions';
import { AuthService, UserRepository } from '@virteex/domain-identity-domain';

@Injectable()
export class GetSocialRegisterInfoUseCase {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(UserRepository) private readonly userRepository: UserRepository,
  ) {}

  async execute(token: string): Promise<{ firstName: string; lastName: string; email: string }> {
    try {
      // Logic would typically verify a temporary social login token and return partial profile
      // For now, implement as expected by the frontend
      const payload = await this.authService.verifyToken(token);
      return {
          firstName: payload.firstName || '',
          lastName: payload.lastName || '',
          email: payload.email || '',
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid social registration token');
    }
  }
}
