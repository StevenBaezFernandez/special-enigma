import { IsDateString, IsString, IsNotEmpty } from 'class-validator';

export class CalculatePayrollDto {
  @IsNotEmpty()
  @IsString()
  tenantId!: string;

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
