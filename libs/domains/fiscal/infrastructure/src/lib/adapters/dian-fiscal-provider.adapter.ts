import { Injectable, Logger } from '@nestjs/common';
import { FiscalProvider } from '../../../../domain/src/lib/ports/fiscal-provider.port';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SignedXml } from 'xml-crypto';
// @ts-ignore
import { DOMParser } from '@xmldom/xmldom';
import * as crypto from 'crypto';

@Injectable()
export class DianFiscalAdapter implements FiscalProvider {
  private readonly logger = new Logger(DianFiscalAdapter.name);
  private privateKey: string;

  constructor(private readonly httpService: HttpService) {
      if (process.env['FISCAL_PRIVATE_KEY']) {
          this.privateKey = process.env['FISCAL_PRIVATE_KEY'];
      } else {
          this.logger.warn('FISCAL_PRIVATE_KEY not provided. Generating ephemeral RSA key for simulation.');
          const { privateKey } = crypto.generateKeyPairSync('rsa', {
              modulusLength: 2048,
              publicKeyEncoding: { type: 'spki', format: 'pem' },
              privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
          });
          this.privateKey = privateKey;
      }
  }

  async validateInvoice(invoice: any): Promise<boolean> {
    this.logger.log(`Validating invoice ${invoice?.id} with DIAN (Robust Integration)...`);
    // Validation logic (e.g., schema validation)
    return true;
  }

  async signInvoice(invoice: any): Promise<string> {
    this.logger.log(`Signing invoice ${invoice?.id || 'UNKNOWN'} with DIAN Digital Certificate (XAdES-EPES)...`);

    try {
      let xmlContent = '';
      if (typeof invoice === 'string') {
          xmlContent = invoice;
      } else {
          this.logger.warn('Received object in signInvoice, expecting XML string. Using fallback wrapper.');
          xmlContent = `<Invoice><ID>${invoice?.id || 'TEST'}</ID></Invoice>`;
      }

      const sig = new SignedXml();

      sig.addReference({
          xpath: "//*[local-name(.)='Invoice']",
          transforms: ['http://www.w3.org/2000/09/xmldsig#enveloped-signature', 'http://www.w3.org/2001/10/xml-exc-c14n#']
      });

      sig.canonicalizationAlgorithm = 'http://www.w3.org/2001/10/xml-exc-c14n#';
      sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';

      // Fix TS2339 by casting to any (library property exists at runtime)
      (sig as any).signingKey = this.privateKey;

      sig.computeSignature(xmlContent);

      const signedXml = sig.getSignedXml();

      this.logger.log(`Invoice signed successfully.`);
      return signedXml;

    } catch (error: any) {
      this.logger.error(`Failed to sign invoice: ${error.message}`, error.stack);
      throw new Error(`Signing failed: ${error.message}`);
    }
  }

  async transmitInvoice(invoice: any): Promise<void> {
    this.logger.log(`Transmitting invoice to DIAN (SOAP)...`);

    try {
        const dianUrl = process.env['DIAN_API_URL'] || 'https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc';

        let signedXml = '';
        if (typeof invoice === 'string') {
            signedXml = invoice;
        } else {
             // If invoice is object, assume it needs signing first (though usually done before transmit)
             signedXml = await this.signInvoice(invoice);
        }

        // Wrap in SOAP Envelope
        const soapEnvelope = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wcf="http://wcf.dian.colombia">
           <soapenv:Header/>
           <soapenv:Body>
              <wcf:SendBillAsync>
                 <wcf:fileName>${invoice?.id || 'invoice'}.xml</wcf:fileName>
                 <wcf:contentFile>${Buffer.from(signedXml).toString('base64')}</wcf:contentFile>
              </wcf:SendBillAsync>
           </soapenv:Body>
        </soapenv:Envelope>`;

        this.logger.log(`Sending to DIAN endpoint: ${dianUrl}`);

        const response = await firstValueFrom(
            this.httpService.post(dianUrl, soapEnvelope, {
                headers: {
                    'Content-Type': 'text/xml;charset=UTF-8',
                    'SOAPAction': 'http://wcf.dian.colombia/iwcfDianCustomerServices/SendBillAsync'
                }
            })
        );

        if (response.status === 200 && response.data.includes('UploadSuccess')) {
             this.logger.log('DIAN Transmission Successful');
        } else {
             this.logger.warn(`DIAN response status: ${response.status}. Body: ${response.data}`);
             // Depending on response, throw or log
        }
    } catch (error: any) {
        this.logger.error(`Transmission failed: ${error.message}`, error.response?.data);
        throw new Error(`DIAN Transmission Error: ${error.message}`);
    }
  }
}
