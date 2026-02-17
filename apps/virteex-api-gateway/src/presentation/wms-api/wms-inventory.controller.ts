import { Controller, Get } from '@nestjs/common';

@Controller('wms/inventory')
export class WmsInventoryController {
  @Get()
  getInventoryStatus() {
    return { status: 'WMS Inventory API Online' };
  }
}
