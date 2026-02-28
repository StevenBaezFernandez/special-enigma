export abstract class StoragePort {
  abstract saveFile(fileName: string, buffer: Buffer): Promise<string>;
  abstract getFileUrl(fileName: string): string;
}
