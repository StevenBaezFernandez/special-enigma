import { Injectable, Logger } from '@nestjs/common';
import { StoragePort } from '../ports/storage.port';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileSystemStorageAdapter extends StoragePort {
  private readonly logger = new Logger(FileSystemStorageAdapter.name);
  private readonly uploadDir = 'uploads';

  constructor() {
    super();
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      try {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      } catch (e) {
        this.logger.error('Failed to create upload directory', e);
      }
    }
  }

  async saveFile(fileName: string, buffer: Buffer): Promise<string> {
    this.ensureUploadDir();
    const filePath = path.join(this.uploadDir, fileName);
    try {
      await fs.promises.writeFile(filePath, buffer);
      return fileName;
    } catch (error) {
      this.logger.error(`Failed to save file ${fileName}`, error);
      throw error;
    }
  }

  getFileUrl(fileName: string): string {
    return `/uploads/${fileName}`;
  }
}
