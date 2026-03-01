import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import {
  CreateInvoiceUseCase,
  mapCreateInvoiceInputToDto,
} from '@virteex/application-billing-application';
import { CreateInvoiceInput } from '../dto/create-invoice.input';
import { InvoiceObject } from '../dto/invoice.object';
import { presentInvoice } from '../invoice.presenter';

@Resolver()
export class BillingResolver {
  constructor(private readonly createInvoiceUseCase: CreateInvoiceUseCase) {}

  @Query(() => String)
  billingHealthCheck(): string {
    return 'Billing Service is running';
  }

  @Mutation(() => InvoiceObject)
  async createInvoice(@Args('input') input: CreateInvoiceInput): Promise<InvoiceObject> {
    const dto = mapCreateInvoiceInputToDto(input);
    const result = await this.createInvoiceUseCase.execute(dto);
    return presentInvoice(result);
  }
}
