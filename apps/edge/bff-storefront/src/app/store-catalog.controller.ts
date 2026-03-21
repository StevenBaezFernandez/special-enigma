import { Controller, Get } from '@nestjs/common';

@Controller('store/catalog')
export class StoreCatalogController {
  @Get()
  getCatalogStatus() {
    return { status: 'Store API Online' };
  }
}
