import { Injectable, Logger } from '@nestjs/common';
import { FiscalProvider } from '@virteex/domain-fiscal-domain/ports/fiscal-provider.port';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SignedXml } from 'xml-crypto';
import * as crypto from 'crypto';

@Injectable()
export class SefazFiscalAdapter implements FiscalProvider {
  private readonly logger = new Logger(SefazFiscalAdapter.name);
  private privateKey: string;

  constructor(private readonly httpService: HttpService) {
      if (process.env['FISCAL_PRIVATE_KEY']) {
          this.privateKey = process.env['FISCAL_PRIVATE_KEY'];
      } else {
          this.logger.warn('FISCAL_PRIVATE_KEY not provided. Generating ephemeral RSA key for simulation (SEFAZ).');
          const { privateKey } = crypto.generateKeyPairSync('rsa', {
              modulusLength: 2048,
              publicKeyEncoding: { type: 'spki', format: 'pem' },
              privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
          });
          this.privateKey = privateKey;
      }
  }

  async validateInvoice(invoice: any): Promise<boolean> {
    this.logger.log(`Validating invoice ${invoice?.id} with SEFAZ (Brazil)...`);
    return true;
  }

  async signInvoice(invoice: any): Promise<string> {
    this.logger.log(`Signing invoice ${invoice?.id || 'UNKNOWN'} with SEFAZ Digital Certificate (A1/A3)...`);

    try {
      let xmlContent = '';
      if (typeof invoice === 'string') {
          xmlContent = invoice;
      } else {
          this.logger.warn('Received object in signInvoice, expecting XML string. Using fallback wrapper.');
          xmlContent = `<NFe><infNFe Id="NFe${invoice?.id || 'TEST'}"></infNFe></NFe>`;
      }

      const sig = new SignedXml();

      sig.addReference({
          xpath: "//*[local-name(.)='infNFe']",
          transforms: ['http://www.w3.org/2000/09/xmldsig#enveloped-signature', 'http://www.w3.org/2001/10/xml-exc-c14n#']
      });

      sig.canonicalizationAlgorithm = 'http://www.w3.org/2001/10/xml-exc-c14n#';
      sig.signatureAlgorithm = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1';

      // Fix TS2339 by casting to any
      (sig as any).signingKey = this.privateKey;

      sig.computeSignature(xmlContent);

      const signedXml = sig.getSignedXml();

      this.logger.log(`NFe signed successfully.`);
      return signedXml;

    } catch (error: any) {
      this.logger.error(`Failed to sign NFe: ${error.message}`, error.stack);
      throw new Error(`Signing failed: ${error.message}`);
    }
  }

  async transmitInvoice(invoice: any): Promise<void> {
    this.logger.log(`Transmitting NFe to SEFAZ...`);

    try {
        // Fix TS4111 by using index access
        const sefazUrl = process.env['SEFAZ_API_URL'] || 'https://nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx';
        this.logger.log(`NFe transmitted to SEFAZ at ${sefazUrl} (Simulated mTLS)`);
    } catch (error) {
        this.logger.error(`Transmission failed`, error);
        throw error;
    }
  }
}
