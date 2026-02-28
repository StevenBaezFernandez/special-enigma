import { Employee } from '../entities/employee.entity';

export interface EmployeeRepository {
  save(employee: Employee): Promise<void>;
  findById(id: string): Promise<Employee | null>;
  findByEmail(email: string): Promise<Employee | null>;
  findAllByTenant(tenantId: string): Promise<Employee[]>;
}

export const EMPLOYEE_REPOSITORY = 'EMPLOYEE_REPOSITORY';
