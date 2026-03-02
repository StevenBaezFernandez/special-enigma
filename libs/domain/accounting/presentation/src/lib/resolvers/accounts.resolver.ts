import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CreateAccountUseCase, GetAccountsUseCase } from '@virteex/domain-accounting-application';
import { AccountObject } from '../dto/account.object';
import { CreateAccountInput } from '../dto/create-account.input';

@Resolver(() => AccountObject)
export class AccountsResolver {
  constructor(
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly getAccountsUseCase: GetAccountsUseCase
  ) {}

  @Mutation(() => AccountObject)
  async createAccount(@Args('input') input: CreateAccountInput) {
    return this.createAccountUseCase.execute(input);
  }

  @Query(() => [AccountObject], { name: 'accounts' })
  async getAccounts(@Args('tenantId') tenantId: string) {
    return this.getAccountsUseCase.execute(tenantId);
  }
}
