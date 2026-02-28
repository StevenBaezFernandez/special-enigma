import { IsEmail, IsString, Length } from 'class-validator';

export class VerifySignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6)
  otp!: string;
}

export interface VerifySignupResponse {
  onboardingToken: string;
}
