import { IsOptional, IsString, IsEnum } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsEnum(['en', 'es'])
  @IsOptional()
  preferredLanguage?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
