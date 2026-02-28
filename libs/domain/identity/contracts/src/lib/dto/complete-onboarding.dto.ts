import { IsString, IsNotEmpty } from 'class-validator';

export class CompleteOnboardingDto {
  @IsString()
  @IsNotEmpty()
  onboardingToken!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  phone!: string;

  @IsString()
  companyName!: string;

  @IsString()
  taxId!: string;

  @IsString()
  country!: string;

  @IsString()
  regime!: string;

  @IsString()
  industry!: string;
}
