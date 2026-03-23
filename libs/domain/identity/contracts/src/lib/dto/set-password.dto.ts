import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class SetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'Password too weak' })
  @IsNotEmpty()
  password!: string;
}
