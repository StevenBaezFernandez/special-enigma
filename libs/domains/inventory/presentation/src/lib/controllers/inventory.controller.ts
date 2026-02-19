import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReserveStockUseCase } from '@virteex/inventory-application';
import { IsString, IsNumber, Min } from 'class-validator';
import { JwtAuthGuard, CurrentUser, UserPayload } from '@virteex/auth';

class ReserveStockDto {
  @IsString()
  warehouseId!: string;

  @IsString()
  productSku!: string;

  @IsNumber()
  @Min(0.0001)
  quantity!: number;
}

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly reserveStockUseCase: ReserveStockUseCase) {}

  @Post('reserve')
  @ApiOperation({ summary: 'Reserve stock for a product' })
  async reserve(@Body() dto: ReserveStockDto, @CurrentUser() user: UserPayload) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    await this.reserveStockUseCase.execute(
      user.tenantId,
      dto.warehouseId,
      dto.productSku,
      dto.quantity
    );

    return { message: 'Stock reserved successfully' };
  }
}
