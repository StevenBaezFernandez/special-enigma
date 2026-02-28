import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyMfaDto {
  @IsString()
  @IsNotEmpty()
  tempToken!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;
}
