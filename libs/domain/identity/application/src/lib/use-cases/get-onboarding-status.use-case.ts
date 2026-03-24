import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserRepository } from '@virteex/domain-identity-domain';

@Injectable()
export class GetOnboardingStatusUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository
  ) {}

  async execute(userId: string): Promise<{ status: string; step: string; isCompleted: boolean }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Determine the current step based on user and company status
    let currentStep = 'onboarding_info';
    let isCompleted = false;

    if (user.status === 'ACTIVE') {
      isCompleted = true;
      currentStep = 'completed';
    } else if (user.company?.plan) {
      currentStep = 'plan_selection';
    } else if (user.company) {
      currentStep = 'business_info';
    }

    return {
      status: user.status,
      step: currentStep,
      isCompleted
    };
  }
}
