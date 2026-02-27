import { Body, Controller, Post, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReserveBatchStockUseCase } from '@virteex/application-inventory-application';
import { JwtAuthGuard, CurrentUser, UserPayload } from '@virteex/kernel-auth';
import { resolveTenantId } from '../security/tenant-context.resolver';
import { ReserveBatchStockDto } from './dto/reserve-batch-stock.dto';
import { InventoryApplicationExceptionFilter } from '../filters/inventory-application-exception.filter';

@ApiTags('Inventory - Reservations')
@ApiBearerAuth()
@Controller('inventory/reservations')
@UseGuards(JwtAuthGuard)
@UseFilters(InventoryApplicationExceptionFilter)
export class ReservationsController {
  constructor(private readonly reserveBatchStockUseCase: ReserveBatchStockUseCase) {}

  @Post('batch')
  @ApiOperation({ summary: 'Reserve stock for multiple products atomically' })
  async reserveBatch(@Body() dto: ReserveBatchStockDto, @CurrentUser() user: UserPayload) {
    await this.reserveBatchStockUseCase.execute(resolveTenantId(user), dto.items, dto.reference);
    return { message: 'Batch reservation successful' };
  }
}
