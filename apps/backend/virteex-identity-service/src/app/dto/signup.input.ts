import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class InitiateSignupInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsNotEmpty()
  password!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @Field()
  @IsNotEmpty()
  companyName!: string;
}

@InputType()
export class VerifySignupInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsNotEmpty()
  code!: string;
}

@InputType()
export class CompleteOnboardingInput {
  @Field()
  @IsNotEmpty()
  onboardingToken!: string;

  @Field()
  @IsString()
  firstName!: string;

  @Field()
  @IsString()
  lastName!: string;

  @Field()
  @IsString()
  phone!: string;

  @Field()
  @IsString()
  companyName!: string;

  @Field()
  @IsString()
  taxId!: string;

  @Field()
  @IsString()
  country!: string;

  @Field()
  @IsString()
  regime!: string;

  @Field()
  @IsString()
  industry!: string;
}
