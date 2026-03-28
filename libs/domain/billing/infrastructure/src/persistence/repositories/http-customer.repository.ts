import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { type CustomerRepository, CustomerBillingInfo } from '@virteex/domain-billing-domain';

@Injectable()
export class HttpCustomerRepository implements CustomerRepository {
  private readonly crmServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.crmServiceUrl = this.configService.get<string>('CRM_SERVICE_URL', 'http://api-crm-app:3000');
  }

  async findById(id: string): Promise<CustomerBillingInfo | null> {
    try {
      const { data: customer } = await firstValueFrom(
        this.httpService.get(`${this.crmServiceUrl}/api/crm/customers/${id}`)
      );

      if (!customer) return null;

      // Map CRM customer to Billing Info
      return {
        id: customer.id,
        rfc: customer.taxId || 'XAXX010101000',
        taxId: customer.taxId || 'XAXX010101000',
        legalName: customer.companyName || `${customer.firstName} ${customer.lastName}`,
        taxRegimen: customer.taxRegimen || '601',
        postalCode: customer.postalCode || '00000',
        email: customer.email,
        address: customer.address,
        country: customer.country || 'MX'
      };
    } catch (error  : any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }
}
