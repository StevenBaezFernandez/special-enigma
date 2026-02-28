import { Injectable, Inject } from '@nestjs/common';
import { StoragePort } from '@virteex/application-identity-application';
import { StorageService as SharedStorageService } from '@virteex/shared-infrastructure-storage';

@Injectable()
export class StorageAdapter implements StoragePort {
  constructor(@Inject(SharedStorageService) private readonly storageService: any) {}

  async saveFile(fileName: string, buffer: Buffer): Promise<string> {
    return this.storageService.saveFile(fileName, buffer);
  }

  getFileUrl(fileName: string): string {
    return this.storageService.getFileUrl(fileName);
  }
}
