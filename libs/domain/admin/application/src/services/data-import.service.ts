import { Injectable, Logger, Inject } from '@nestjs/common';
import { INTEGRATION_GATEWAY, type IntegrationGateway } from '@virteex/domain-admin-domain';
import * as ExcelJS from 'exceljs';

@Injectable()
export class DataImportService {
  private readonly logger = new Logger(DataImportService.name);

  constructor(
    @Inject(INTEGRATION_GATEWAY) private readonly gateway: IntegrationGateway
  ) {}

  async processFile(fileBuffer: Buffer, dataType: string): Promise<{ processed: number; failed: number }> {
    this.logger.log(`Processing import for ${dataType}`);

    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.load(fileBuffer as any);
    } catch (e) {
        this.logger.error('Failed to parse file', e);
        throw new Error('Invalid file format');
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
        throw new Error('Workbook has no worksheets');
    }

    const data  : any[] = [];
    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values as string[];

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const rowData  : any = {};
        row.eachCell((cell, colNumber) => {
            const header = headers[colNumber];
            if (header) {
                rowData[header] = cell.value;
            }
        });
        data.push(rowData);
    });

    this.logger.log(`Found ${data.length} records to import.`);

    let processed = 0;
    let failed = 0;

    for (const row of data) {
        try {
            await this.importRow(row, dataType);
            processed++;
        } catch (e  : any) {
            this.logger.error(`Failed to import row for ${dataType}: ${e.message}`, e.stack);
            failed++;
        }
    }

    return { processed, failed };
  }

  private async importRow(row  : any, dataType: string) {
      if (!row) throw new Error('Empty row');

      switch (dataType) {
        case 'products':
          if (!row['sku'] || !row['name'] || !row['price']) throw new Error('Missing required fields for Product (sku, name, price)');
          await this.gateway.createProduct({
            sku: String(row['sku']),
            name: String(row['name']),
            price: Number(row['price'])
          });
          break;
        case 'customers':
          if (!row['email'] || !row['name']) throw new Error('Missing required fields for Customer (email, name)');
          await this.gateway.createCustomer({
            email: String(row['email']),
            name: String(row['name']),
            taxId: row['taxId'] ? String(row['taxId']) : undefined
          });
          break;
        case 'suppliers':
          if (!row['email'] || !row['name']) throw new Error('Missing required fields for Supplier (email, name)');
          await this.gateway.createSupplier({
            email: String(row['email']),
            name: String(row['name']),
            taxId: row['taxId'] ? String(row['taxId']) : undefined
          });
          break;
        default:
          throw new Error(`Unsupported data type: ${dataType}`);
      }
  }
}
