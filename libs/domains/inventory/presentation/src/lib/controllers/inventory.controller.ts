import { Controller, Post, Body, UseGuards, BadRequestException, Get, Param, Query, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  ReserveStockUseCase,
  CheckStockUseCase,
  GetWarehousesUseCase,
  GetWarehouseUseCase,
  ReserveBatchStockUseCase,
  CreateWarehouseUseCase,
  UpdateWarehouseUseCase,
  DeleteWarehouseUseCase,
  RegisterMovementUseCase,
  CreateWarehouseDto
} from '@virteex/application-inventory-application';
import { RegisterMovementDto } from '../dto/register-movement.dto';
import { IsString, IsNumber, Min, IsArray, ValidateNested, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard, CurrentUser, UserPayload } from '@virteex/kernel-auth';

class ReserveStockDto {
  @IsString()
  warehouseId!: string;

  @IsString()
  productSku!: string;

  @IsNumber()
  @Min(0.0001)
  quantity!: number;
}

class ReserveBatchStockDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReserveStockDto)
  items!: ReserveStockDto[];

  @IsString()
  reference!: string;
}

class UpdateWarehouseBodyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(
    private readonly reserveStockUseCase: ReserveStockUseCase,
    private readonly checkStockUseCase: CheckStockUseCase,
    private readonly getWarehousesUseCase: GetWarehousesUseCase,
    private readonly getWarehouseUseCase: GetWarehouseUseCase,
    private readonly reserveBatchStockUseCase: ReserveBatchStockUseCase,
    private readonly createWarehouseUseCase: CreateWarehouseUseCase,
    private readonly updateWarehouseUseCase: UpdateWarehouseUseCase,
    private readonly deleteWarehouseUseCase: DeleteWarehouseUseCase,
    private readonly registerMovementUseCase: RegisterMovementUseCase
  ) {}

  @Post('warehouses')
  @ApiOperation({ summary: 'Create a new warehouse' })
  async createWarehouse(@Body() dto: CreateWarehouseDto, @CurrentUser() user: UserPayload) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    // Ensure tenantId from token overrides body
    dto.tenantId = user.tenantId;
    return this.createWarehouseUseCase.execute(dto);
  }

  @Put('warehouses/:id')
  @ApiOperation({ summary: 'Update a warehouse' })
  async updateWarehouse(
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseBodyDto
  ) {
    return this.updateWarehouseUseCase.execute({ id, ...dto });
  }

  @Delete('warehouses/:id')
  @ApiOperation({ summary: 'Delete a warehouse' })
  async deleteWarehouse(@Param('id') id: string) {
    return this.deleteWarehouseUseCase.execute(id);
  }

  @Post('movements')
  @ApiOperation({ summary: 'Register an inventory movement' })
  async registerMovement(@Body() dto: RegisterMovementDto, @CurrentUser() user: UserPayload) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    // Ensure tenantId from token overrides body
    dto.tenantId = user.tenantId;
    await this.registerMovementUseCase.execute(dto);
    return { message: 'Movement registered successfully' };
  }

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

  @Post('reserve-batch')
  @ApiOperation({ summary: 'Reserve stock for multiple products atomically' })
  async reserveBatch(@Body() dto: ReserveBatchStockDto, @CurrentUser() user: UserPayload) {
      if (!user.tenantId) {
          throw new BadRequestException('Tenant ID is required');
      }

      await this.reserveBatchStockUseCase.execute(
          user.tenantId,
          dto.items,
          dto.reference
      );

      return { message: 'Batch reservation successful' };
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

  @Get('warehouses')
  @ApiOperation({ summary: 'Get all warehouses for tenant' })
  async getWarehouses(@CurrentUser() user: UserPayload, @Query('tenantId') queryTenantId?: string) {
      const tenantId = user.tenantId || queryTenantId;
      if (!tenantId) {
          throw new BadRequestException('Tenant ID is required');
      }
      return this.getWarehousesUseCase.execute(tenantId);
  }

  @Get('warehouses/:id')
  @ApiOperation({ summary: 'Get warehouse by ID' })
  async getWarehouse(@Param('id') id: string) {
      return this.getWarehouseUseCase.execute(id);
  }
}
