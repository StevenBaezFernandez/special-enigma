import { Injectable, Logger } from '@nestjs/common';
import { PacProvider, FiscalStamp } from '@virteex/billing-domain';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NullPacProvider implements PacProvider {
  private readonly logger = new Logger(NullPacProvider.name);

  async stamp(xml: string): Promise<FiscalStamp> {
    this.logger.warn('Using NullPacProvider: Stamping is simulated.');

    // Simulate basic validation
    if (!xml || !xml.includes('<cfdi:Comprobante')) {
      this.logger.error('Invalid XML: Missing cfdi:Comprobante');
      throw new Error('Invalid XML Structure: Missing root element.');
    }

    if (!xml.includes('Version="4.0"')) {
        this.logger.warn('XML Version might not be 4.0, but proceeding in simulation.');
    }

    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      uuid: uuidv4(),
      selloSAT: 'SIMULATED_SELLO_SAT_' + uuidv4(),
      selloCFD: 'SIMULATED_SELLO_CFD_' + uuidv4(),
      fechaTimbrado: new Date().toISOString(),
      xml: xml // In real PAC, this would be the signed XML
    };
  }

  async cancel(uuid: string, rfc: string): Promise<boolean> {
    this.logger.warn(`Using NullPacProvider: Cancelled invoice ${uuid} for ${rfc}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
  }
}
