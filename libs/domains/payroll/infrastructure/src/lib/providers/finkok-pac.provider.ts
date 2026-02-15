import axios from 'axios';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { PacProvider, FiscalStamp } from '@virteex/payroll-domain';
import { Injectable, Logger } from '@nestjs/common';

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
      this.logger.error('Finkok credentials (FINKOK_USERNAME, FINKOK_PASSWORD, FINKOK_URL) are missing from environment.');
      throw new Error(
        'Finkok credentials (FINKOK_USERNAME, FINKOK_PASSWORD, FINKOK_URL) are missing from environment.'
      );
    }
  }

  async stamp(xml: string): Promise<FiscalStamp> {
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

    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await axios.post(this.url, soapEnvelope, {
          headers: {
            'Content-Type': 'text/xml;charset=UTF-8',
            'SOAPAction': 'stamp'
          }
        });

        const responseBody = response.data;
        const parsed = this.parser.parse(responseBody);

        const body = parsed?.Envelope?.Body;
        const result = body?.stampResponse?.stampResult;
        const fault = body?.Fault;

        if (fault) {
           const faultString = fault.faultstring || JSON.stringify(fault);
           throw new Error(`Finkok Error: ${faultString}`);
        }

        if (result) {
           const xmlResult = result.xml;
           const uuid = result.UUID;
           const selloSAT = result.SatSeal;
           const selloCFD = result.Seal || result.seal || result.sello || '';
           const fechaTimbrado = result.Date;

           if (!xmlResult || !uuid) {
               throw new Error('Invalid response structure from Finkok');
           }

           return {
               uuid,
               selloSAT: selloSAT || '',
               selloCFD: selloCFD,
               fechaTimbrado: fechaTimbrado || new Date().toISOString(),
               xml: xmlResult
           };
        } else {
           throw new Error('Unknown response format from Finkok');
        }

      } catch (error: any) {
        this.logger.warn(`Finkok stamp attempt ${attempt} failed: ${error.message}`);
        lastError = error;
        if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    }

    if (axios.isAxiosError(lastError)) {
      throw new Error(`PAC Connection Error after 3 attempts: ${lastError.message}`);
    }
    throw lastError || new Error('Unknown error during stamp');
  }

  async cancel(uuid: string, rfc: string): Promise<boolean> {
     if (!rfc) {
         throw new Error('RFC (Tax ID) is required for cancellation');
     }

     const soapBody = {
       'soapenv:Envelope': {
          '@_xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
          '@_xmlns:apps': 'http://facturacion.finkok.com/cancel',
          'soapenv:Header': {},
          'soapenv:Body': {
             'apps:cancel': {
                'apps:UUIDS': {
                  'apps:uuids': {
                     'apps:string': uuid
                  }
                },
                'apps:username': this.username,
                'apps:password': this.password,
                'apps:taxpayer_id': rfc
             }
          }
       }
    };

    const soapEnvelope = this.builder.build(soapBody);
    const cancelUrl = this.url.replace('/stamp', '/cancel').replace(/\/$/, '');

    try {
        const response = await axios.post(cancelUrl, soapEnvelope, {
            headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': 'cancel' }
        });

        const parsed = this.parser.parse(response.data);
        const body = parsed?.Envelope?.Body;
        const fault = body?.Fault;

        if (fault) {
           throw new Error(`Finkok Cancel Error: ${fault.faultstring}`);
        }

        const cancelResult = body?.cancelResponse?.cancelResult;
        if (!cancelResult) {
            throw new Error('Invalid cancel response from Finkok');
        }

        return true;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            throw new Error(`PAC Connection Error during cancel: ${error.message}`);
        }
        throw error;
    }
  }
}
