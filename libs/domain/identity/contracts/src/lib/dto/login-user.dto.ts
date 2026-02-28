import { IsEmail, IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
