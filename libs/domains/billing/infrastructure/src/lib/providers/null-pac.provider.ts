import { Injectable, Logger } from '@nestjs/common';
import { PacProvider, FiscalStamp } from '@virteex/billing-domain';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NullPacProvider implements PacProvider {
  private readonly logger = new Logger(NullPacProvider.name);

  async stamp(xml: string): Promise<FiscalStamp> {
    this.logger.warn('Using NullPacProvider: Stamping is simulated.');
    return {
      uuid: uuidv4(),
      selloSAT: '',
      selloCFD: '',
      fechaTimbrado: new Date().toISOString(),
      xml: xml
    };
  }

  async cancel(uuid: string, rfc: string): Promise<boolean> {
    this.logger.warn(`Using NullPacProvider: Cancelled invoice ${uuid} for ${rfc}`);
    return true;
  }
}
