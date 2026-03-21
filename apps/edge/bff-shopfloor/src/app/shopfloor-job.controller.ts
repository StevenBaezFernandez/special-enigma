import { Controller, Get } from '@nestjs/common';

@Controller('shopfloor/jobs')
export class ShopfloorJobController {
  @Get()
  getJobStatus() {
    return { status: 'Shopfloor API Online' };
  }
}
