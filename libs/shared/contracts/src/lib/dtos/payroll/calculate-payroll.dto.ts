export interface CalculatePayrollDto {
  tenantId: string;
  employeeId: string;
  periodStart: string | Date;
  periodEnd: string | Date;
}
