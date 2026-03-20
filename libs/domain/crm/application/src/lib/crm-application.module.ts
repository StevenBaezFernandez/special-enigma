import { Module } from '@nestjs/common';
import { MessagingModule } from '@virteex/kernel-messaging';
import { CrmInfrastructureModule } from '@virteex/domain-crm-infrastructure';
import { CreateSaleUseCase } from './use-cases/create-sale.use-case';
import { ListSalesUseCase } from './use-cases/list-sales.use-case';
import { CreateCustomerUseCase } from './use-cases/create-customer.use-case';
import { ListCustomersUseCase } from './use-cases/list-customers.use-case';
import { GetCustomerByIdUseCase } from './use-cases/get-customer-by-id.use-case';
import { ApproveSaleUseCase } from './use-cases/approve-sale.use-case';
import { CancelSaleUseCase } from './use-cases/cancel-sale.use-case';
import { CompleteSaleUseCase } from './use-cases/complete-sale.use-case';

@Module({
  imports: [CrmInfrastructureModule, MessagingModule],
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
