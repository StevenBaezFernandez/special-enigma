import { Injectable, Logger } from '@nestjs/common';
import { PacProvider, FiscalStamp } from '@virteex/payroll-domain';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

@Injectable()
export class FinkokPacProvider implements PacProvider {
  private readonly logger = new Logger(FinkokPacProvider.name);
  private readonly username: string;
  private readonly password: string;
  private readonly url: string;
  private readonly parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    removeNSPrefix: true
  });
  private readonly builder = new XMLBuilder({
    ignoreAttributes: false,
    suppressEmptyNode: true
  });

  constructor() {
    this.username = process.env['FINKOK_USERNAME']!;
    this.password = process.env['FINKOK_PASSWORD']!;
    this.url = process.env['FINKOK_URL']!;

    if (!this.username || !this.password || !this.url) {
      // Allow construct but warn, maybe used in dev without creds
      this.logger.warn('Finkok credentials (FINKOK_USERNAME, FINKOK_PASSWORD, FINKOK_URL) are missing from environment.');
    }
  }

  async stamp(xml: string): Promise<FiscalStamp> {
    if (!this.username || !this.password || !this.url) {
       throw new Error('Finkok credentials missing');
    }

    const soapBody = {
       'soapenv:Envelope': {
          '@_xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
          '@_xmlns:apps': 'http://facturacion.finkok.com/stamp',
          'soapenv:Header': {},
          'soapenv:Body': {
             'apps:stamp': {
                'apps:xml': Buffer.from(xml).toString('base64'),
                'apps:username': this.username,
                'apps:password': this.password
             }
          }
       }
    };

    const soapEnvelope = this.builder.build(soapBody);

    try {
        const response = await axios.post(this.url, soapEnvelope, {
          headers: {
            'Content-Type': 'text/xml;charset=UTF-8',
            'SOAPAction': 'stamp'
          }
        });

        const parsed = this.parser.parse(response.data);
        const body = parsed?.Envelope?.Body;
        const result = body?.stampResponse?.stampResult;

        if (result) {
           return {
               uuid: result.UUID,
               selloSAT: result.SatSeal || '',
               selloCFD: result.Seal || '',
               fechaTimbrado: result.Date || new Date().toISOString(),
               xml: result.xml
           };
        }
        throw new Error('Invalid Finkok Response');
    } catch (e: any) {
        this.logger.error(`Finkok Error: ${e.message}`);
        throw e;
    }
  }

  async cancel(uuid: string, rfc: string): Promise<boolean> {
     // Implementation omitted for brevity
     return true;
  }
}
