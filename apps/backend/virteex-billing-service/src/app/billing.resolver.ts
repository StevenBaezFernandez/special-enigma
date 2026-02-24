import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CreateInvoiceUseCase } from '@virteex/application-billing-application';
import { CreateInvoiceInput } from './dto/create-invoice.input';
import { InvoiceObject } from './dto/invoice.object';

@Resolver()
export class BillingResolver {
  constructor(private readonly createInvoiceUseCase: CreateInvoiceUseCase) {}

  @Query(() => String)
  billingHealthCheck(): string {
    return 'Billing Service is running';
  }

  @Mutation(() => InvoiceObject)
  async createInvoice(@Args('input') input: CreateInvoiceInput): Promise<InvoiceObject> {
    // Pass input directly as DTO. Validation happens in UseCase via class-validator if instance is transformed,
    // or manually. Since input is from GQL, it's a plain object or instance of Input class.
    // UseCase should handle it.
    // Note: UseCase expects a DTO instance for validation to work properly if it uses `validateOrReject`.
    // However, for this implementation we assume data is valid or basic mapping.

    // We might need to map tenantId if not provided (e.g. from context).
    // For now we assume input has it or it's optional.
    const result = await this.createInvoiceUseCase.execute(input as any);

    // Result is an Entity (Invoice). We need to map it to InvoiceObject.
    // MikrORM entities usually have data properties that match.
    return {
        id: result.id,
        tenantId: result.tenantId,
        customerId: result.customerId,
        issueDate: result.issueDate,
        dueDate: result.dueDate,
        totalAmount: parseFloat(result.totalAmount),
        taxAmount: parseFloat(result.taxAmount),
        status: result.status,
        fiscalUuid: result.fiscalUuid
    };
  }
}
