import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { User, UserRepository } from '@virteex/domain-identity-domain';
import { StoragePort } from '../ports/storage.port';

@Injectable()
export class UploadAvatarUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(StoragePort) private readonly storagePort: StoragePort
  ) {}

  async execute(userId: string, fileName: string, buffer: Buffer): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const savedFileName = await this.storagePort.saveFile(fileName, buffer);
    const url = this.storagePort.getFileUrl(savedFileName);

    user.avatarUrl = url;
    await this.userRepository.save(user);

    return url;
  }
}
