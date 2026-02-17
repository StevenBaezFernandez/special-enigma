import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SchemaService implements OnModuleInit {
  private readonly logger = new Logger(SchemaService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly configService: ConfigService
  ) {}

  async onModuleInit() {
    try {
      const dbDriver = this.configService.get('DB_DRIVER');

      if (dbDriver === 'postgres') {
          this.logger.log('Ensuring "catalog" schema exists...');
          // Cast to any to avoid TS errors if types are mismatched in this environment
          await (this.em as any).execute('CREATE SCHEMA IF NOT EXISTS catalog');
          this.logger.log('"catalog" schema ensured.');
      } else {
          this.logger.log(`Skipping schema creation for driver: ${dbDriver}`);
      }
    } catch (error) {
      this.logger.error('Failed to create schema "catalog"', error);
    }
  }
}
