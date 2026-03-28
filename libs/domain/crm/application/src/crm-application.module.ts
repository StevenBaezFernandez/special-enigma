import { Module } from '@nestjs/common';
import { MessagingModule } from '@virteex/kernel-messaging';
import { CreateSaleUseCase } from '../use-cases/commands/create-sale.use-case';
import { ListSalesUseCase } from '../use-cases/queries/list-sales.use-case';
import { CreateCustomerUseCase } from '../use-cases/commands/create-customer.use-case';
import { ListCustomersUseCase } from '../use-cases/queries/list-customers.use-case';
import { GetCustomerByIdUseCase } from '../use-cases/queries/get-customer-by-id.use-case';
import { ApproveSaleUseCase } from '../use-cases/commands/approve-sale.use-case';
import { CancelSaleUseCase } from '../use-cases/commands/cancel-sale.use-case';
import { CompleteSaleUseCase } from '../use-cases/commands/complete-sale.use-case';

@Module({
  imports: [MessagingModule],
  providers: [
    CreateSaleUseCase,
    ListSalesUseCase,
    CreateCustomerUseCase,
    ListCustomersUseCase,
    GetCustomerByIdUseCase,
    ApproveSaleUseCase,
    CancelSaleUseCase,
    CompleteSaleUseCase,
  ],
  exports: [
    CreateSaleUseCase,
    ListSalesUseCase,
    CreateCustomerUseCase,
    ListCustomersUseCase,
    GetCustomerByIdUseCase,
    ApproveSaleUseCase,
    CancelSaleUseCase,
    CompleteSaleUseCase,
  ],
})
export class CrmApplicationModule {}
