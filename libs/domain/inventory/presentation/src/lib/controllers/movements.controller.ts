import { Controller, Post, Body, UseGuards, UseFilters } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterMovementUseCase } from '@virteex/domain-inventory-application';
import { RegisterMovementDto } from '../dto/register-movement.dto';
import { JwtAuthGuard, CurrentUser, UserPayload } from '@virteex/kernel-auth';
import { resolveTenantId } from '../security/tenant-context.resolver';
import { InventoryApplicationExceptionFilter } from '../filters/inventory-application-exception.filter';

@ApiTags('Inventory - Movements')
@ApiBearerAuth()
@Controller('inventory/movements')
@UseGuards(JwtAuthGuard)
@UseFilters(InventoryApplicationExceptionFilter)
export class MovementsController {
  constructor(private readonly registerMovementUseCase: RegisterMovementUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Register an inventory movement' })
  async registerMovement(@Body() dto: RegisterMovementDto, @CurrentUser() user: UserPayload) {
    dto.tenantId = resolveTenantId(user);
    await this.registerMovementUseCase.execute(dto);
    return { message: 'Movement registered successfully' };
  }
}
