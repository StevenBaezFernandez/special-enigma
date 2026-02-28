import { Injectable, Inject } from '@nestjs/common';
import { SalesPort, SALES_PORT } from '@virteex/domain-bi-domain';

@Injectable()
export class GetTopProductsUseCase {
  constructor(
    @Inject(SALES_PORT) private readonly salesPort: SalesPort
  ) {}

  async execute(tenantId: string) {
    return this.salesPort.getTopProducts(tenantId, 5);
  }
}
