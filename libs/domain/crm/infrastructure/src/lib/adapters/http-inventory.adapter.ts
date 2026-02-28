import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { InventoryService, Warehouse, StockReservationItem } from '../../../../domain/src/lib/ports/inventory.service';

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

  async checkStock(warehouseId: string, productSku: string, quantity: number): Promise<boolean> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.inventoryServiceUrl}/inventory/check/${warehouseId}/${productSku}`, { params: { quantity } })
      );
      return data.available;
    } catch (error: any) {
      if (error.response?.status === 404) {
          return false;
      }
      this.logger.error(`Failed to check stock for ${productSku}: ${error.message}`);
      return false;
    }
  }

  async reserveStock(warehouseId: string, productSku: string, quantity: number, reference: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.inventoryServiceUrl}/inventory/reserve`, {
          warehouseId,
          productSku,
          quantity,
          reference
        })
      );
    } catch (error: any) {
      this.logger.error(`Failed to reserve stock for ${productSku}: ${error.message}`);
      throw new Error(`Failed to reserve stock for ${productSku}: ${error.response?.data?.message || error.message}`);
    }
  }

  async reserveBatchStock(items: StockReservationItem[], reference: string): Promise<void> {
      try {
          await firstValueFrom(
              this.httpService.post(`${this.inventoryServiceUrl}/inventory/reserve-batch`, {
                  items,
                  reference
              })
          );
      } catch (error: any) {
          this.logger.error(`Failed to reserve batch stock: ${error.message}`);
          throw new Error(`Failed to reserve batch stock: ${error.response?.data?.message || error.message}`);
      }
  }

  async getWarehouse(id: string): Promise<Warehouse | null> {
      try {
          const { data } = await firstValueFrom(
              this.httpService.get(`${this.inventoryServiceUrl}/inventory/warehouses/${id}`)
          );
          return data;
      } catch (error: any) {
          if (error.response?.status === 404) return null;
          this.logger.error(`Failed to fetch warehouse ${id}: ${error.message}`);
          throw new Error(`Failed to fetch warehouse ${id}`);
      }
  }

  async getWarehouses(tenantId: string): Promise<Warehouse[]> {
      try {
          const { data } = await firstValueFrom(
              this.httpService.get(`${this.inventoryServiceUrl}/inventory/warehouses`, { params: { tenantId } })
          );
          return data || [];
      } catch (error: any) {
          this.logger.error(`Failed to fetch warehouses: ${error.message}`);
          throw new Error(`Failed to fetch warehouses: ${error.message}`);
      }
  }
}
