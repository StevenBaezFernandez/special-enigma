import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class CatalogResolver {
  @Query(() => [String])
  satPaymentMethods() {
    return ['01 - Efectivo', '02 - Cheque', '03 - Transferencia'];
  }
}
