import { plainToClass, Type, Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, MinLength, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsOptional()
  NODE_ENV = 'development';

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  PORT = 3000;

  @IsString()
  @MinLength(1)
  // DB_* variables are now strictly required without defaults for security
  DB_HOST!: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  DB_PORT = 5432;

  @IsString()
  @MinLength(1)
  DB_USER!: string;

  @IsString()
  @MinLength(1)
  DB_PASSWORD!: string;

  @IsString()
  @MinLength(1)
  DB_NAME!: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  DB_SSL_ENABLED = false;

  @IsString()
  @MinLength(1)
  SMTP_HOST!: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  SMTP_PORT = 587;

  @IsString()
  @MinLength(1)
  SMTP_USER!: string;

  @IsString()
  @MinLength(1)
  // No default value for sensitive password in production context
  // But for dev we might want it optional or empty string, but validator requires minlength 1.
  // I will remove the default value so it must be provided in .env
  SMTP_PASSWORD!: string;

  @IsString()
  @MinLength(1)
  SMTP_FROM!: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  SMTP_SECURE = false;

  @IsString()
  @MinLength(1)
  // Making JWT_SECRET required without default
  JWT_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRATION = '1d';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
