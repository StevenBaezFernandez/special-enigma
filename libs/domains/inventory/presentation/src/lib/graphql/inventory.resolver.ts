import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, InternalServerErrorException } from '@nestjs/common';
import { JwtAuthGuard } from '@virteex/kernel-auth';
import { CurrentTenant } from '@virteex/shared-util-server-config';
import {
  CreateWarehouseUseCase,
  GenerateWarehouseCodeUseCase,
  GetWarehousesUseCase,
  RegisterInventoryMovementBatchUseCase,
  UpdateWarehouseUseCase,
  DeleteWarehouseUseCase,
} from '@virteex/application-inventory-application';
import { WarehouseObject } from './dto/warehouse.object';
import { CreateWarehouseInput } from './dto/create-warehouse.input';
import { RegisterMovementInput } from './dto/register-movement.input';
import { UpdateWarehouseInput } from './dto/update-warehouse.input';

@Resolver(() => WarehouseObject)
export class InventoryResolver {
  constructor(
    private readonly createWarehouseUseCase: CreateWarehouseUseCase,
    private readonly generateWarehouseCodeUseCase: GenerateWarehouseCodeUseCase,
    private readonly getWarehousesUseCase: GetWarehousesUseCase,
    private readonly registerInventoryMovementBatchUseCase: RegisterInventoryMovementBatchUseCase,
    private readonly updateWarehouseUseCase: UpdateWarehouseUseCase,
    private readonly deleteWarehouseUseCase: DeleteWarehouseUseCase
  ) {}

  @Query(() => [WarehouseObject], { name: 'warehouses' })
  @UseGuards(JwtAuthGuard)
  async getWarehouses(@CurrentTenant() tenantId: string) {
    return this.getWarehousesUseCase.execute(tenantId);
  }

  @Mutation(() => WarehouseObject)
  @UseGuards(JwtAuthGuard)
  async createWarehouse(
    @Args('input') input: CreateWarehouseInput,
    @CurrentTenant() tenantId: string
  ) {
    const code = this.generateWarehouseCodeUseCase.execute(input.name);
    return this.createWarehouseUseCase.execute({ ...input, tenantId, code });
  }

  @Mutation(() => WarehouseObject)
  @UseGuards(JwtAuthGuard)
  async updateWarehouse(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateWarehouseInput
  ) {
    return this.updateWarehouseUseCase.execute({ id, ...input });
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteWarehouse(@Args('id', { type: () => ID }) id: string) {
    await this.deleteWarehouseUseCase.execute(id);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async registerMovement(
    @Args('input') input: RegisterMovementInput,
    @CurrentTenant() tenantId: string
  ) {
    try {
      await this.registerInventoryMovementBatchUseCase.execute({
        tenantId,
        warehouseId: input.warehouseId,
        items: input.items,
      });
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(`Movement processing failed: ${error.message}`);
      }
      throw new InternalServerErrorException('Unknown error during movement processing');
    }
  }
}
