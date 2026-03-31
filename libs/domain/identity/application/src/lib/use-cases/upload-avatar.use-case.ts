import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import { User, UserRepository } from '@virteex/domain-identity-domain';
import { EntitlementService } from '@virteex/kernel-entitlements';
import { StoragePort } from '../ports/storage.port';

@Injectable()
export class UploadAvatarUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(StoragePort) private readonly storagePort: StoragePort,
    private readonly entitlementService: EntitlementService
  ) {}

  async execute(userId: string, fileName: string, buffer: Buffer): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new DomainException('User not found', 'ENTITY_NOT_FOUND');
    }

    // Storage quota check (e.g., number of files or size, here we check count for simplicity)
    // In a real scenario, we might check total bytes used
    const currentStorageCount = 50; // Mocked current count
    await this.entitlementService.checkQuota('storage', currentStorageCount);

    const savedFileName = await this.storagePort.saveFile(fileName, buffer);
    const url = this.storagePort.getFileUrl(savedFileName);

    user.avatarUrl = url;
    await this.userRepository.save(user);

    return url;
  }
}
