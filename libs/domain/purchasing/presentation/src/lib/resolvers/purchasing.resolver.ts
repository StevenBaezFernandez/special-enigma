import { Resolver, Mutation, Query, Args, InputType, Field, Float, ObjectType, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CreateVendorBillUseCase, GetVendorBillUseCase, UpdateVendorBillUseCase } from '@virteex/domain-purchasing-application';
import { CreateVendorBillDto, VendorBillLineItemDto, UpdateVendorBillDto } from '@virteex/domain-purchasing-contracts';
import { CurrentTenant, JwtAuthGuard } from '@virteex/kernel-auth';

@InputType()
class VendorBillLineItemInput implements VendorBillLineItemDto {
  @Field()
  description!: string;

  @Field(() => Float)
  quantity!: number;

  @Field(() => Float)
  price!: number;

  @Field()
  expenseAccountId!: string;
}

@InputType()
class CreateVendorBillInput implements CreateVendorBillDto {
  @Field()
  supplierId!: string;

  @Field()
  billNumber!: string;

  @Field()
  issueDate!: string;

  @Field()
  dueDate!: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => [VendorBillLineItemInput])
  lineItems!: VendorBillLineItemInput[];
}

@InputType()
class UpdateVendorBillInput implements UpdateVendorBillDto {
  @Field({ nullable: true })
  supplierId?: string;

  @Field({ nullable: true })
  billNumber?: string;

  @Field({ nullable: true })
  issueDate?: string;

  @Field({ nullable: true })
  dueDate?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => [VendorBillLineItemInput], { nullable: true })
  lineItems?: VendorBillLineItemInput[];
}

@ObjectType()
class VendorBillLineItemObject {
  @Field()
  description!: string;

  @Field(() => Float)
  quantity!: number;

  @Field(() => Float)
  price!: number;

  @Field()
  expenseAccountId!: string;
}

@ObjectType()
class VendorBillObject {
  @Field(() => ID)
  id!: string;

  @Field()
  supplierId!: string;

  @Field()
  billNumber!: string;

  @Field()
  issueDate!: string;

  @Field()
  dueDate!: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => [VendorBillLineItemObject])
  lineItems!: VendorBillLineItemObject[];

  @Field(() => Float)
  totalAmount!: number;

  @Field()
  status!: string;
}

@Resolver(() => VendorBillObject)
export class PurchasingResolver {
  constructor(
    private readonly createVendorBillUseCase: CreateVendorBillUseCase,
    private readonly getVendorBillUseCase: GetVendorBillUseCase,
    private readonly updateVendorBillUseCase: UpdateVendorBillUseCase
  ) {}

  @Mutation(() => VendorBillObject)
  @UseGuards(JwtAuthGuard)
  async createVendorBill(
    @Args('input') input: CreateVendorBillInput,
    @CurrentTenant() tenantId: string
  ) {
    return this.createVendorBillUseCase.execute(input, tenantId);
  }

  @Mutation(() => VendorBillObject)
  @UseGuards(JwtAuthGuard)
  async updateVendorBill(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateVendorBillInput,
    @CurrentTenant() tenantId: string
  ) {
    return this.updateVendorBillUseCase.execute(id, input, tenantId);
  }

  @Query(() => VendorBillObject, { name: 'vendorBill' })
  @UseGuards(JwtAuthGuard)
  async getVendorBill(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string
  ) {
    return this.getVendorBillUseCase.execute(id, tenantId);
  }
}
