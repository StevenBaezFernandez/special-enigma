import { Injectable, Logger, Inject } from '@nestjs/common';
import { INTEGRATION_GATEWAY, IntegrationGateway } from '@virteex/domain-admin-domain';
import * as xlsx from 'xlsx';

@Injectable()
export class DataImportService {
  private readonly logger = new Logger(DataImportService.name);

  constructor(
    @Inject(INTEGRATION_GATEWAY) private readonly gateway: IntegrationGateway
  ) {}

  async processFile(fileBuffer: Buffer, dataType: string): Promise<{ processed: number; failed: number }> {
    this.logger.log(`Processing import for ${dataType}`);

    let workbook;
    try {
        workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    } catch (e) {
        this.logger.error('Failed to parse file', e);
        throw new Error('Invalid file format');
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    this.logger.log(`Found ${data.length} records to import.`);

    let processed = 0;
    let failed = 0;

    for (const row of data) {
        try {
            await this.importRow(row, dataType);
            processed++;
        } catch (e: any) {
            this.logger.error(`Failed to import row for ${dataType}: ${e.message}`, e.stack);
            failed++;
        }
    }

    return { processed, failed };
  }

  private async importRow(row: any, dataType: string) {
      if (!row) throw new Error('Empty row');

      switch (dataType) {
        case 'products':
          if (!row['sku'] || !row['name'] || !row['price']) throw new Error('Missing required fields for Product (sku, name, price)');
          await this.gateway.createProduct({
            sku: row['sku'],
            name: row['name'],
            price: Number(row['price'])
          });
          break;
        case 'customers':
          if (!row['email'] || !row['name']) throw new Error('Missing required fields for Customer (email, name)');
          await this.gateway.createCustomer({
            email: row['email'],
            name: row['name'],
            taxId: row['taxId']
          });
          break;
        case 'suppliers':
          if (!row['email'] || !row['name']) throw new Error('Missing required fields for Supplier (email, name)');
          await this.gateway.createSupplier({
            email: row['email'],
            name: row['name'],
            taxId: row['taxId']
          });
          break;
        default:
          throw new Error(`Unsupported data type: ${dataType}`);
      }
  }
}
