import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { InventoryService } from '@virteex/domain-manufacturing-domain/ports/inventory.service';

@Injectable()
export class HttpInventoryAdapter implements InventoryService {
  private readonly logger = new Logger(HttpInventoryAdapter.name);
  private readonly inventoryServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.inventoryServiceUrl = this.configService.get<string>('INVENTORY_SERVICE_URL', 'http://virteex-inventory-service:3000');
  }

  async checkAndReserveStock(tenantId: string, warehouseId: string, productSku: string, quantity: number): Promise<void> {
    const url = `${this.inventoryServiceUrl}/inventory/reserve`;

    try {
      await firstValueFrom(
        this.httpService.post(url, {
          warehouseId,
          productSku,
          quantity
        })
      );
    } catch (error: any) {
      this.logger.error(`Failed to reserve stock via HTTP: ${error.message}`, error.stack);
      // Re-throw or map error to domain exception
      // Assuming 404 means InsufficientStock or NotFound, we should probably handle it better
      throw new Error(`Failed to reserve stock for ${productSku}: ${error.response?.data?.message || error.message}`);
    }
  }
}
