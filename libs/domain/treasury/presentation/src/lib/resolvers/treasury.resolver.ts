import { Resolver, Mutation, Query, Args, InputType, Field, ObjectType, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CreateBankAccountUseCase, GetBankAccountsUseCase } from '@virteex/domain-treasury-application';
import { CreateBankAccountDto, BankAccountDto } from '@virteex/domain-treasury-contracts';
import { CurrentTenant, JwtAuthGuard } from '@virteex/kernel-auth';

@InputType()
class CreateBankAccountInput {
  @Field()
  name!: string;

  @Field()
  accountNumber!: string;

  @Field()
  bankName!: string;

  @Field()
  currency!: string;
}

@ObjectType()
class BankAccountObject {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  name!: string;

  @Field()
  accountNumber!: string;

  @Field()
  bankName!: string;

  @Field()
  currency!: string;

  @Field()
  balance!: number;
}

@Resolver(() => BankAccountObject)
export class TreasuryResolver {
  constructor(
    private readonly createBankAccountUseCase: CreateBankAccountUseCase,
    private readonly getBankAccountsUseCase: GetBankAccountsUseCase
  ) {}

  @Mutation(() => BankAccountObject)
  @UseGuards(JwtAuthGuard)
  async createBankAccount(
    @Args('input') input: CreateBankAccountInput,
    @CurrentTenant() tenantId: string
  ) {
    const dto: CreateBankAccountDto = {
      ...input,
      tenantId // Injected from guard context
    };
    return this.createBankAccountUseCase.execute(dto);
  }

  @Query(() => [BankAccountObject], { name: 'bankAccounts' })
  @UseGuards(JwtAuthGuard)
  async getBankAccounts(
    @CurrentTenant() tenantId: string
  ) {
    return this.getBankAccountsUseCase.execute(tenantId);
  }
}
