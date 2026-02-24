import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomerRepository, CustomerBillingInfo } from '@virteex/domain-billing-domain';
import axios from 'axios';

@Injectable()
export class HttpCustomerRepository implements CustomerRepository {
  private readonly logger = new Logger(HttpCustomerRepository.name);
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('API_GATEWAY_URL') || 'http://localhost:3000/api';
  }

  async findById(id: string): Promise<CustomerBillingInfo | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/crm/customers/${id}`);
      const customer = response.data;

      // Map CRM customer to Billing Info
      return {
        id: customer.id,
        rfc: customer.taxId || 'XAXX010101000',
        taxId: customer.taxId || 'XAXX010101000',
        legalName: customer.companyName || `${customer.firstName} ${customer.lastName}`.trim(),
        taxRegimen: customer.taxRegimen || '616',
        postalCode: customer.postalCode || '00000',
        email: customer.email || '',
        address: customer.address
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      this.logger.error(`Error fetching customer ${id}: ${error}`);
      return null; // Fail safe or throw? Returning null is safer for "not found" semantics.
    }
  }
}
