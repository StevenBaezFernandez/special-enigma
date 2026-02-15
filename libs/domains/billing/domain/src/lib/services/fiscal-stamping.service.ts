import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Invoice } from '../entities/invoice.entity';
import { PacProvider, PAC_PROVIDER, FiscalStamp } from '../ports/pac-provider.port';
import { TenantConfigRepository, TENANT_CONFIG_REPOSITORY } from '../ports/tenant-config.port';

@Injectable()
export class FiscalStampingService {
  constructor(
    @Inject(PAC_PROVIDER) private readonly pacProvider: PacProvider,
    @Inject(TENANT_CONFIG_REPOSITORY) private readonly tenantConfigRepo: TenantConfigRepository
  ) {}

  async stampInvoice(invoice: Invoice): Promise<FiscalStamp> {
    const tenantConfig = await this.tenantConfigRepo.getFiscalConfig(invoice.tenantId);
    const xml = this.generateXml(invoice, tenantConfig.rfc);

    return await this.pacProvider.stamp(xml);
  }

  async cancelInvoice(uuid: string, tenantId: string): Promise<boolean> {
    const tenantConfig = await this.tenantConfigRepo.getFiscalConfig(tenantId);
    return await this.pacProvider.cancel(uuid, tenantConfig.rfc);
  }

  private generateXml(invoice: Invoice, rfc: string): string {
    // Placeholder XML generation
    // Uses passed RFC for Emisor
    return `
      <cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" Version="4.0" Total="${invoice.totalAmount}" Fecha="${new Date().toISOString()}">
        <cfdi:Emisor Rfc="${rfc}" Nombre="VIRTEEX DEMO"/>
        <cfdi:Receptor Rfc="XAXX010101000" UsoCFDI="G03"/>
        <cfdi:Conceptos>
           <cfdi:Concepto Importe="${invoice.totalAmount}" Descripcion="Service"/>
        </cfdi:Conceptos>
      </cfdi:Comprobante>
    `;
  }
}
