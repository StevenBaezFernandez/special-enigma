import { Injectable } from '@nestjs/common';

export interface ServiceStatusDto {
  service: string;
  status: 'ok';
  timestamp: string;
}

@Injectable()
export class AppService {
  getData(): ServiceStatusDto {
    return {
      service: 'virteex-inventory-service',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
