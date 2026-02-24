import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, InternalServerErrorException } from '@nestjs/common';
import { JwtAuthGuard } from '@virteex/kernel-auth';
import { CurrentTenant } from '@virteex/shared-util-server-config';
import {
  CreateWarehouseUseCase,
  GetWarehousesUseCase,
  RegisterMovementUseCase,
  UpdateWarehouseUseCase,
  DeleteWarehouseUseCase,
  InventoryMovementType
} from '@virteex/application-inventory-application';
import { WarehouseObject } from './dto/warehouse.object';
import { CreateWarehouseInput } from './dto/create-warehouse.input';
import { RegisterMovementInput } from './dto/register-movement.input';
import { UpdateWarehouseInput } from './dto/update-warehouse.input';

@Resolver(() => WarehouseObject)
export class InventoryResolver {
  constructor(
    private readonly createWarehouseUseCase: CreateWarehouseUseCase,
    private readonly getWarehousesUseCase: GetWarehousesUseCase,
    private readonly registerMovementUseCase: RegisterMovementUseCase,
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
    // Generate a robust code: 3-char prefix + random hex suffix to reduce collisions
    const prefix = input.name.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3) || 'WAR';
    const suffix = Math.floor(Math.random() * 0xFFF).toString(16).toUpperCase().padStart(3, '0');
    const code = `${prefix}-${suffix}`;

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
      for (const item of input.items) {
        await this.registerMovementUseCase.execute({
            tenantId,
            warehouseId: input.warehouseId,
            productId: item.productId,
            quantity: item.quantity,
            type: item.type, // Already typed via Input
            reference: item.reference,
            locationId: item.locationId
        });
      }
      return true;
    } catch (error) {
      // In a real scenario, we'd need a transactional rollback here.
      // For now, we propagate the error to inform the client of partial failure.
      if (error instanceof Error) {
        throw new InternalServerErrorException(`Movement processing failed: ${error.message}`);
      }
      throw new InternalServerErrorException('Unknown error during movement processing');
    }
  }
}
