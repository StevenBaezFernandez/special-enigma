import { Injectable, Inject } from '@nestjs/common';
import { UserRepository, NotificationService, CachePort } from '@virteex/domain-identity-domain';
import * as crypto from 'crypto';

@Injectable()
export class Send2faEmailVerificationUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(NotificationService) private readonly notificationService: NotificationService,
    @Inject(CachePort) private readonly cachePort: CachePort,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) return;

    const code = crypto.randomInt(100000, 999999).toString();

    // Store code in cache with 5 minutes expiry
    await this.cachePort.set(`2fa:email:${user.id}`, code, 300);

    await this.notificationService.sendNotification(user.id, {
        type: 'email',
        template: '2fa-verification',
        data: { code }
    });
  }
}
