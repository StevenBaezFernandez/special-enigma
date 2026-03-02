import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    if (!this.appService) {
        return { service: 'virteex-identity-service', status: 'ok', timestamp: new Date().toISOString() };
    }
    return this.appService.getData();
  }
}
