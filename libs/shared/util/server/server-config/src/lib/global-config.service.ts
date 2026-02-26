import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GlobalConfigService {
  constructor(private configService: ConfigService) {}

  get uma(): number {
    return this.configService.get<number>('UMA', 108.57);
  }

  get defaultStateTaxRate(): number {
    return this.configService.get<number>('DEFAULT_STATE_TAX_RATE', 0);
  }
}
