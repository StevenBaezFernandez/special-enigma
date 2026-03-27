import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class CompleteOnboardingDto {
  @IsString()
  @IsNotEmpty()
  onboardingToken!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone number must be in E.164 format' })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  companyName!: string;

  @IsString()
  @IsNotEmpty()
  taxId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(3)
  country!: string;

  @IsString()
  @IsNotEmpty()
  regime!: string;

  @IsString()
  @IsOptional()
  fiscalRegionId?: string;

  @IsString()
  @IsNotEmpty()
  industry!: string;

  @IsString()
  @IsNotEmpty()
  recaptchaToken!: string;
}
