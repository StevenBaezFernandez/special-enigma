import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { CreateAccountUseCase, GetAccountsUseCase } from '@virteex/domain-accounting-application';
import { AccountObject } from '../dto/account.object';
import { CreateAccountInput } from '../dto/create-account.input';
import { AccountLoader } from '../loaders/account.loader';

@Resolver(() => AccountObject)
export class AccountsResolver {
  constructor(
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly getAccountsUseCase: GetAccountsUseCase,
    private readonly accountLoader: AccountLoader
  ) {}

  @Mutation(() => AccountObject)
  async createAccount(@Args('input') input: CreateAccountInput) {
    return this.createAccountUseCase.execute(input);
  }

  @Query(() => [AccountObject], { name: 'accounts' })
  async getAccounts(@Args('tenantId') tenantId: string) {
    return this.getAccountsUseCase.execute(tenantId);
  }

  @ResolveField(() => AccountObject, { name: 'parent', nullable: true })
  async getParent(@Parent() account: AccountObject) {
    if (!account.parentId) return null;
    return this.accountLoader.load(account.parentId);
  }
}
