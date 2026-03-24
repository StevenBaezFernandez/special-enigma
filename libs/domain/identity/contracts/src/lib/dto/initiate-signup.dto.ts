import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class InitiateSignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(12)
  password!: string;

  @IsString()
  @IsNotEmpty()
  recaptchaToken!: string;
}
