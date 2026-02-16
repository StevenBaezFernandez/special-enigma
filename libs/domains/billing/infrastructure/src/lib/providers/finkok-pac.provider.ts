import axios from 'axios';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { PacProvider, FiscalStamp } from '@virteex/billing-domain';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FinkokPacProvider implements PacProvider {
  private readonly logger = new Logger(FinkokPacProvider.name);
  private readonly username: string;
  private readonly password: string;
  private readonly url: string;
  private readonly cancelUrl: string;
  private readonly stampNamespace: string;
  private readonly cancelNamespace: string;

  private readonly parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    removeNSPrefix: true
  });
  private readonly builder = new XMLBuilder({
    ignoreAttributes: false,
    suppressEmptyNode: true
  });

  constructor(private readonly configService: ConfigService) {
    this.username = this.configService.get<string>('FINKOK_USERNAME')!;
    this.password = this.configService.get<string>('FINKOK_PASSWORD')!;
    this.url = this.configService.get<string>('FINKOK_URL')!;
    this.cancelUrl = this.configService.get<string>('FINKOK_CANCEL_URL') || this.url?.replace('/stamp', '/cancel');
    this.stampNamespace = this.configService.get<string>('FINKOK_STAMP_NAMESPACE') || 'http://facturacion.finkok.com/stamp';
    this.cancelNamespace = this.configService.get<string>('FINKOK_CANCEL_NAMESPACE') || 'http://facturacion.finkok.com/cancel';

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
          [`@_xmlns:apps`]: this.stampNamespace,
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

      } catch (error: unknown) {
        let errorMessage = 'Unknown error';
        if (axios.isAxiosError(error)) {
            errorMessage = error.message;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        this.logger.warn(`Finkok stamp attempt ${attempt} failed: ${errorMessage}`);
        lastError = error instanceof Error ? error : new Error(errorMessage);
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
          [`@_xmlns:apps`]: this.cancelNamespace,
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

    try {
        const response = await axios.post(this.cancelUrl, soapEnvelope, {
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
            throw new Error('Invalid cancel response from Finkok: missing cancelResult');
        }

        // Validate cancelResult content
        // Finkok returns a list of Folios with status.
        // Example structure: { Folios: { Folio: { UUID: '...', Status: '201', ... } } }
        // Or if single: { Folios: { Folio: { UUID: '...', Status: '201' } } }

        let folios = cancelResult.Folios?.Folio;
        if (!folios) {
             // Sometimes it might be nested differently or empty if failed
             throw new Error(`Cancellation failed or structure unknown: ${JSON.stringify(cancelResult)}`);
        }

        if (!Array.isArray(folios)) {
            folios = [folios];
        }

        const folio = folios.find((f: any) => f.UUID === uuid);
        if (!folio) {
            throw new Error(`Cancellation response does not contain UUID ${uuid}`);
        }

        // Status 201 = Cancelled successfully (or request accepted)
        // Status 202 = Cancelled previously
        // Check Finkok docs for exact codes. Usually 201/202 are success.
        const status = folio.EstatusUUID || folio.Status;

        if (['201', '202'].includes(String(status))) {
            return true;
        }

        throw new Error(`Cancellation failed with status: ${status} - ${folio.EstatusCancelacion || ''}`);

    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            throw new Error(`PAC Connection Error during cancel: ${error.message}`);
        }
        throw error;
    }
  }
}
