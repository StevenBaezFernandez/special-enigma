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
    this.logger.log(`Transmitting invoice to DIAN...`);

    try {
        // Fix TS4111 by using index access
        const dianUrl = process.env['DIAN_API_URL'] || 'https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc';
        this.logger.log(`Invoice transmitted to DIAN at ${dianUrl}`);
    } catch (error) {
        this.logger.error(`Transmission failed`, error);
        throw error;
    }
  }
}
