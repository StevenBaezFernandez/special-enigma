import { Injectable, Inject } from '@nestjs/common';
import { Customer, CustomerRepository } from '@virteex/domain-crm-domain';
import { CustomerType } from '@virteex/shared-contracts';

export interface CreateCustomerDto {
  tenantId: string;
  type?: CustomerType;
  companyName: string;
  taxId: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  stateOrProvince?: string;
  postalCode?: string;
  country?: string;
}

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly repository: CustomerRepository
  ) {}

  async execute(dto: CreateCustomerDto): Promise<Customer> {
    const customer = new Customer(dto.tenantId, dto.type || CustomerType.COMPANY);
    customer.companyName = dto.companyName;
    customer.email = dto.email;
    customer.phone = dto.phone;
    customer.taxId = dto.taxId;
    customer.contactPerson = dto.contactPerson;
    customer.address = dto.address;
    customer.city = dto.city;
    customer.stateOrProvince = dto.stateOrProvince;
    customer.postalCode = dto.postalCode;
    customer.country = dto.country;

    return this.repository.create(customer);
  }
}
