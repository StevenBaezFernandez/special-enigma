import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class InitiateSignupInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsNotEmpty()
  @MinLength(12)
  password!: string;

  @Field()
  @IsNotEmpty()
  recaptchaToken!: string;
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

  @Field()
  @IsNotEmpty()
  recaptchaToken!: string;
}
