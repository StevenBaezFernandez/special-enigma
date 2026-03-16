import { Controller, Post, Get, Body, Query, Param, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateSaleUseCase, type CreateSaleDto, ListSalesUseCase, CreateCustomerUseCase, type CreateCustomerDto, ListCustomersUseCase, GetCustomerByIdUseCase, ApproveSaleUseCase, CancelSaleUseCase, CompleteSaleUseCase } from '@virteex/domain-crm-application';

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
  async createSale(@Headers('x-virteex-tenant-id') tenantId: string, @Body() dto: CreateSaleDto) {
    return this.createSaleUseCase.execute({ ...dto, tenantId: tenantId || dto.tenantId });
  }

  @Get('sales')
  @ApiOperation({ summary: 'List sales' })
  @ApiResponse({ status: 200, description: 'List of sales.' })
  async listSales(@Headers('x-virteex-tenant-id') tenantIdHeader: string, @Query('tenantId') tenantIdQuery: string) {
    return this.listSalesUseCase.execute(tenantIdHeader || tenantIdQuery || 'default');
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Get lead pipeline for UI' })
  @ApiResponse({ status: 200, description: 'Lead pipeline stages.' })
  async getPipeline(@Headers('x-virteex-tenant-id') tenantId: string) {
    const sales = await this.listSalesUseCase.execute(tenantId || 'default');

    // Group sales by status for the pipeline view
    const stages = [
        { id: 'DRAFT', name: 'Draft', leads: [] as any[] },
        { id: 'NEGOTIATION', name: 'Negotiation', leads: [] as any[] },
        { id: 'APPROVED', name: 'Approved', leads: [] as any[] },
        { id: 'COMPLETED', name: 'Completed', leads: [] as any[] }
    ];

    sales.forEach(sale => {
        const stage = stages.find(s => s.id === sale.status);
        if (stage) {
            stage.leads.push({
                id: sale.id,
                title: `Sale #${sale.id.substring(0,8)}`,
                company: sale.customerName || 'Unknown',
                value: parseFloat(sale.total),
                lastActivity: sale.createdAt,
                priority: parseFloat(sale.total) > 5000 ? 'HIGH' : 'NORMAL'
            });
        }
    });

    return stages;
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
  async createCustomer(@Headers('x-virteex-tenant-id') tenantId: string, @Body() dto: CreateCustomerDto) {
    return this.createCustomerUseCase.execute({ ...dto, tenantId: tenantId || dto.tenantId });
  }

  @Get('customers')
  @ApiOperation({ summary: 'List customers' })
  @ApiResponse({ status: 200, description: 'List of customers.' })
  async listCustomers(@Headers('x-virteex-tenant-id') tenantIdHeader: string, @Query('tenantId') tenantIdQuery: string) {
    return this.listCustomersUseCase.execute(tenantIdHeader || tenantIdQuery || 'default');
  }

  @Get('customers/:id')
  @ApiOperation({ summary: 'Get customer by id' })
  @ApiResponse({ status: 200, description: 'The customer.' })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  async getCustomerById(@Param('id') id: string) {
    return this.getCustomerByIdUseCase.execute(id);
  }
}
