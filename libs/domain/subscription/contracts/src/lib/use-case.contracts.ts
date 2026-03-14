export interface ProcessCheckoutSuccessDto {
  tenantId: string;
  subscriptionId: string;
  customerId: string;
  planId?: string;
}

export interface HandleInvoicePaidDto {
  subscriptionId: string;
}

export interface HandleSubscriptionUpdatedDto {
  subscriptionId: string;
  status: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface HandleSubscriptionDeletedDto {
  subscriptionId: string;
}

export abstract class IProcessCheckoutSuccessUseCase {
  abstract execute(dto: ProcessCheckoutSuccessDto): Promise<void>;
}

export abstract class IHandleInvoicePaidUseCase {
  abstract execute(dto: HandleInvoicePaidDto): Promise<void>;
}

export abstract class IHandleSubscriptionUpdatedUseCase {
  abstract execute(dto: HandleSubscriptionUpdatedDto): Promise<void>;
}

export abstract class IHandleSubscriptionDeletedUseCase {
  abstract execute(dto: HandleSubscriptionDeletedDto): Promise<void>;
}
