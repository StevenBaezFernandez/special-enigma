import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class StoragePort {
  abstract saveFile(fileName: string, buffer: Buffer): Promise<string>;
  abstract getFileUrl(fileName: string): string;
}
