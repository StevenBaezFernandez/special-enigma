import { Injectable, Logger } from '@nestjs/common';
import { PacProvider, FiscalStamp } from '@virteex/domain-billing-domain';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NullPacProvider implements PacProvider {
  private readonly logger = new Logger(NullPacProvider.name);

  constructor() {
    const isProd = process.env['NODE_ENV'] === 'production' || process.env['RELEASE_STAGE'] === 'production';
    if (isProd) {
      throw new Error('FATAL: NullPacProvider attempt in PRODUCTION. Simulated stamping is prohibited.');
    }
  }

  async stamp(xml: string): Promise<FiscalStamp> {
    this.logger.warn('Using NullPacProvider: Stamping logic.');

    if (!xml || !xml.includes('<cfdi:Comprobante')) {
      this.logger.error('Invalid XML: Missing cfdi:Comprobante');
      throw new Error('Invalid XML Structure: Missing root element.');
    }

    return {
      uuid: uuidv4(),
      selloSAT: 'SELLO_SAT_' + uuidv4(),
      selloCFD: 'SELLO_CFD_' + uuidv4(),
      fechaTimbrado: new Date().toISOString(),
      xml: xml
    };
  }

  async cancel(uuid: string, rfc: string): Promise<boolean> {
    this.logger.warn(`Using NullPacProvider: Cancelled invoice ${uuid} for ${rfc}`);
    return true;
  }
}
