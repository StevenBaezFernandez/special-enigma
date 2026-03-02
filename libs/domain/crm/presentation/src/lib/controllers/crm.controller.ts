import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CreateSaleUseCase,
  CreateSaleDto,
  ListSalesUseCase,
  CreateCustomerUseCase,
  CreateCustomerDto,
  ListCustomersUseCase,
  GetCustomerByIdUseCase,
  ApproveSaleUseCase,
  CancelSaleUseCase,
  CompleteSaleUseCase
} from '@virteex/domain-crm-application';

@ApiTags('CRM')
@Controller('crm')
export class CrmController {
  constructor(
    private readonly createSaleUseCase: CreateSaleUseCase,
    private readonly listSalesUseCase: ListSalesUseCase,
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly listCustomersUseCase: ListCustomersUseCase,
    private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase,
    private readonly approveSaleUseCase: ApproveSaleUseCase,
    private readonly cancelSaleUseCase: CancelSaleUseCase,
    private readonly completeSaleUseCase: CompleteSaleUseCase
  ) {}

  @Post('sales')
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({ status: 201, description: 'The sale has been successfully created.' })
  async createSale(@Body() dto: CreateSaleDto) {
    return this.createSaleUseCase.execute(dto);
  }

  @Get('sales')
  @ApiOperation({ summary: 'List sales' })
  @ApiResponse({ status: 200, description: 'List of sales.' })
  async listSales(@Query('tenantId') tenantId: string) {
    return this.listSalesUseCase.execute(tenantId || 'default');
  }

  @Get('deals')
  @ApiOperation({ summary: 'List deals for mobile' })
  @ApiResponse({ status: 200, description: 'List of deals.' })
  async listDeals(@Query('tenantId') tenantId: string) {
    const sales = await this.listSalesUseCase.execute(tenantId || 'default');
    // Map Sales to Deals structure for Mobile
    return sales.map(s => ({
      id: s.id,
      name: `Sale #${s.number}`,
      company: s.customerName || 'Unknown',
      stage: s.status,
      amount: s.total
    }));
  }

  @Post('sales/:id/approve')
  @ApiOperation({ summary: 'Approve a sale' })
  @ApiResponse({ status: 200, description: 'The sale has been approved.' })
  async approveSale(@Param('id') id: string) {
    return this.approveSaleUseCase.execute(id);
  }

  @Post('sales/:id/cancel')
  @ApiOperation({ summary: 'Cancel a sale' })
  @ApiResponse({ status: 200, description: 'The sale has been cancelled.' })
  async cancelSale(@Param('id') id: string) {
    return this.cancelSaleUseCase.execute(id);
  }

  @Post('sales/:id/complete')
  @ApiOperation({ summary: 'Complete a sale' })
  @ApiResponse({ status: 200, description: 'The sale has been completed.' })
  async completeSale(@Param('id') id: string) {
    return this.completeSaleUseCase.execute(id);
  }

  @Post('customers')
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'The customer has been successfully created.' })
  async createCustomer(@Body() dto: CreateCustomerDto) {
    return this.createCustomerUseCase.execute(dto);
  }

  @Get('customers')
  @ApiOperation({ summary: 'List customers' })
  @ApiResponse({ status: 200, description: 'List of customers.' })
  async listCustomers(@Query('tenantId') tenantId: string) {
    return this.listCustomersUseCase.execute(tenantId || 'default');
  }

  @Get('customers/:id')
  @ApiOperation({ summary: 'Get customer by id' })
  @ApiResponse({ status: 200, description: 'The customer.' })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  async getCustomerById(@Param('id') id: string) {
    return this.getCustomerByIdUseCase.execute(id);
  }
}
