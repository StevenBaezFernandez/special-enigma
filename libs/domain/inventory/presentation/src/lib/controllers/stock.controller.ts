import { Controller, Get, Param, Post, Query, Body, UseFilters, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckStockUseCase, ReserveStockUseCase } from '@virteex/domain-inventory-application';
import { JwtAuthGuard, CurrentUser, type UserPayload } from '@virteex/kernel-auth';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { resolveTenantId } from '../security/tenant-context.resolver';
import { InventoryApplicationExceptionFilter } from '../filters/inventory-application-exception.filter';

@ApiTags('Inventory - Stock')
@ApiBearerAuth()
@Controller('inventory/stock')
@UseGuards(JwtAuthGuard)
@UseFilters(InventoryApplicationExceptionFilter)
export class StockController {
  constructor(
    private readonly reserveStockUseCase: ReserveStockUseCase,
    private readonly checkStockUseCase: CheckStockUseCase,
  ) {}

  @Post('reserve')
  @ApiOperation({ summary: 'Reserve stock for a product' })
  async reserve(@Body() dto: ReserveStockDto, @CurrentUser() user: UserPayload) {
    await this.reserveStockUseCase.execute(resolveTenantId(user), dto.warehouseId, dto.productSku, dto.quantity);
    return { message: 'Stock reserved successfully' };
  }

  @Get('check/:warehouseId/:productSku')
  @ApiOperation({ summary: 'Check stock availability' })
  async checkStock(
    @Param('warehouseId') warehouseId: string,
    @Param('productSku') productSku: string,
    @Query('quantity') quantity: number
  ) {
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      throw new BadRequestException('Quantity must be a positive number');
    }

    const available = await this.checkStockUseCase.execute(warehouseId, productSku, qty);
    return { available };
  }
}
