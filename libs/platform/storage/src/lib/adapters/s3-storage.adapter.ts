import { Injectable, Logger } from '@nestjs/common';
import { StoragePort } from '../ports/storage.port';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3StorageAdapter extends StoragePort {
  private readonly logger = new Logger(S3StorageAdapter.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    super();
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    this.bucketName = this.configService.getOrThrow<string>('AWS_S3_BUCKET');

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn('AWS credentials not found, S3StorageAdapter may fail if used.');
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
    });
  }

  async saveFile(fileName: string, buffer: Buffer): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: buffer,
      });
      await this.s3Client.send(command);
      return fileName;
    } catch (error) {
      this.logger.error(`Failed to upload file ${fileName} to S3`, error);
      throw error;
    }
  }

  getFileUrl(fileName: string): string {
    // Return a signed URL or public URL depending on configuration.
    // For now, assuming public read or handled by CloudFront/CDN.
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    return `https://${this.bucketName}.s3.${region}.amazonaws.com/${fileName}`;
  }
}
