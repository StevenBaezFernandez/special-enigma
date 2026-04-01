import { IsDateString, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CalculatePayrollDto {
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsNotEmpty()
  @IsString()
  employeeId!: string;

  @IsNotEmpty()
  @IsDateString()
  periodStart!: string;

  @IsNotEmpty()
  @IsDateString()
  periodEnd!: string;
}
