import { BadRequestException, Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  GetProductsUseCase,
  GetProductByIdUseCase,
  CreateProductUseCase,
  CreateProductDto,
  UpdateProductUseCase,
  UpdateProductDto,
  DeleteProductUseCase,
  GetSatCatalogsUseCase,
  GetProductBySkuUseCase
} from '@virteex/application-catalog-application';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly getSatCatalogsUseCase: GetSatCatalogsUseCase,
    private readonly getProductBySkuUseCase: GetProductBySkuUseCase
  ) {}

  @Get('products')
  @ApiOperation({ summary: 'Get all products' })
  async getProducts(@Query('tenantId') tenantId?: string) {
    if (!tenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    return this.getProductsUseCase.execute(tenantId);
  }

  @Get('products/sku/:sku')
  @ApiOperation({ summary: 'Get product by SKU' })
  async getProductBySku(@Param('sku') sku: string) {
    return this.getProductBySkuUseCase.execute(sku);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product by ID' })
  async getProductById(@Param('id') id: number) {
    return this.getProductByIdUseCase.execute(id);
  }

  @Post('products')
  @ApiOperation({ summary: 'Create a product' })
  async createProduct(@Body() dto: CreateProductDto) {
    return this.createProductUseCase.execute(dto);
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Update a product' })
  async updateProduct(@Param('id') id: number, @Body() dto: UpdateProductDto) {
    dto.id = id;
    return this.updateProductUseCase.execute(dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete a product' })
  async deleteProduct(@Param('id') id: number) {
    return this.deleteProductUseCase.execute(id);
  }

  @Get('sat/payment-forms')
  @ApiOperation({ summary: 'Get SAT Payment Forms' })
  getPaymentForms() {
    return this.getSatCatalogsUseCase.getPaymentForms();
  }

  @Get('sat/payment-methods')
  @ApiOperation({ summary: 'Get SAT Payment Methods' })
  getPaymentMethods() {
    return this.getSatCatalogsUseCase.getPaymentMethods();
  }

  @Get('sat/cfdi-usages')
  @ApiOperation({ summary: 'Get SAT CFDI Usages' })
  getCfdiUsages() {
    return this.getSatCatalogsUseCase.getCfdiUsages();
  }
}
