import { Injectable } from '@nestjs/common';

@Injectable()
export class GenerateWarehouseCodeUseCase {
  execute(warehouseName: string): string {
    const prefix = warehouseName.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3) || 'WAR';
    const suffix = Math.floor(Math.random() * 0xfff)
      .toString(16)
      .toUpperCase()
      .padStart(3, '0');

    return `${prefix}-${suffix}`;
  }
}
