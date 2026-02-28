import { IsEmail, IsString, MinLength } from 'class-validator';

export class InitiateSignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(12)
  password!: string;
}
