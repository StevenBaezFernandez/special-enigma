import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StoragePort } from './lib/ports/storage.port';
import { FileSystemStorageAdapter } from './lib/adapters/filesystem-storage.adapter';
import { S3StorageAdapter } from './lib/adapters/s3-storage.adapter';

@Global()
@Module({
  providers: [
    {
      provide: StoragePort,
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('STORAGE_PROVIDER', 'local');
        if (provider === 's3') {
          return new S3StorageAdapter(configService);
        }
        return new FileSystemStorageAdapter();
      },
      inject: [ConfigService],
    },
    // Backward compatibility: Provide 'StorageService' token aliased to StoragePort
    {
      provide: 'StorageService',
      useExisting: StoragePort
    }
  ],
  exports: [StoragePort, 'StorageService'],
})
export class SharedInfrastructureStorageModule {}

export * from './lib/ports/storage.port';
export * from './lib/adapters/filesystem-storage.adapter';
export * from './lib/adapters/s3-storage.adapter';
// Alias for backward compatibility
export { StoragePort as StorageService } from './lib/ports/storage.port';
