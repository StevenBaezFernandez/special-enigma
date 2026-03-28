import { Resolver, Query, Context } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { GetSatCatalogsUseCase, GetProductsUseCase } from '@virteex/domain-catalog-application';
import { Product } from '../../models/product.model';
import { SatPaymentMethod, SatPaymentForm, SatCfdiUsage } from '../../models/sat-catalog.model';
import { JwtAuthGuard } from '@virteex/kernel-auth';

@Resolver()
export class CatalogResolver {
  constructor(
    private readonly getSatCatalogsUseCase: GetSatCatalogsUseCase,
    private readonly getProductsUseCase: GetProductsUseCase
  ) {}

  @Query(() => [SatPaymentMethod], { name: 'satPaymentMethods' })
  async satPaymentMethods() {
    return this.getSatCatalogsUseCase.getPaymentMethods();
  }

  @Query(() => [SatPaymentForm], { name: 'satPaymentForms' })
  async satPaymentForms() {
    return this.getSatCatalogsUseCase.getPaymentForms();
  }

  @Query(() => [SatCfdiUsage], { name: 'satCfdiUsages' })
  async satCfdiUsages() {
    return this.getSatCatalogsUseCase.getCfdiUsages();
  }

  @Query(() => [Product], { name: 'products' })
  @UseGuards(JwtAuthGuard)
  async products(@Context() context  : any) {
    const req = context.req;
    const tenantId = req.user?.tenantId || req.headers['x-virteex-tenant-id'];

    if (!tenantId) {
      throw new UnauthorizedException('Tenant context is missing');
    }

    return this.getProductsUseCase.execute(tenantId);
  }
}
