import { Injectable, Logger } from '@nestjs/common';
import { ProductGateway } from '@virteex/domain-inventory-domain';

@Injectable()
export class NoopProductGateway implements ProductGateway {
  private readonly logger = new Logger(NoopProductGateway.name);

  async exists(_productId: string): Promise<boolean> {
    this.logger.warn('No product gateway configured; denying product lookup by default.');
    return false;
  }

  async getTenantId(_productId: string): Promise<string | null> {
    this.logger.warn('No product gateway configured; tenant cannot be resolved.');
    return null;
  }
}
