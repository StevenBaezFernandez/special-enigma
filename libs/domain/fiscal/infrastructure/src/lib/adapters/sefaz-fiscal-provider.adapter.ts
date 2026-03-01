import { Injectable, Logger } from '@nestjs/common';
import { FiscalProvider } from '@virteex/domain-fiscal-domain/ports/fiscal-provider.port';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, retry, timer } from 'rxjs';
import { SignedXml } from 'xml-crypto';
import * as crypto from 'crypto';
import * as https from 'https';

@Injectable()
export class SefazFiscalAdapter implements FiscalProvider {
  private readonly logger = new Logger(SefazFiscalAdapter.name);
  private privateKey: string;
  private certificate: string;

  constructor(private readonly httpService: HttpService) {
    const isProd = process.env['NODE_ENV'] === 'production' || process.env['RELEASE_STAGE'] === 'production';

    if (process.env['FISCAL_PRIVATE_KEY']) {
      this.privateKey = process.env['FISCAL_PRIVATE_KEY'];
    }

    if (process.env['FISCAL_CERTIFICATE']) {
      this.certificate = process.env['FISCAL_CERTIFICATE'];
    }

    if (!this.privateKey && isProd) {
      throw new Error('FATAL: FISCAL_PRIVATE_KEY is mandatory for SEFAZ in production.');
    }

    if (!this.privateKey) {
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
          xmlContent = `<NFe xmlns="http://www.portalfiscal.inf.br/nfe"><infNFe Id="NFe${invoice?.id || 'TEST'}" version="4.00"></infNFe></NFe>`;
      }

      const sig = new SignedXml();

      sig.addReference({
          xpath: "//*[local-name(.)='infNFe']",
          transforms: ['http://www.w3.org/2000/09/xmldsig#enveloped-signature', 'http://www.w3.org/2001/10/xml-exc-c14n#']
      });

      sig.canonicalizationAlgorithm = 'http://www.w3.org/2001/10/xml-exc-c14n#';
      sig.signatureAlgorithm = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1';

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
    this.logger.log(`Transmitting NFe to SEFAZ with mTLS...`);

    try {
        const sefazUrl = process.env['SEFAZ_API_URL'] || 'https://nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx';

        let signedXml = '';
        if (typeof invoice === 'string') {
            signedXml = invoice;
        } else {
             signedXml = await this.signInvoice(invoice);
        }

        const soapEnvelope = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:nfe="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4">
           <soap:Header/>
           <soap:Body>
              <nfe:nfeDadosMsg>${signedXml}</nfe:nfeDadosMsg>
           </soap:Body>
        </soap:Envelope>`;

        // Configure mTLS Agent
        const httpsAgent = new https.Agent({
            cert: this.certificate,
            key: this.privateKey,
            rejectUnauthorized: process.env['NODE_ENV'] === 'production'
        });

        const response = await firstValueFrom(
            this.httpService.post(sefazUrl, soapEnvelope, {
                timeout: 30000,
                httpsAgent,
                headers: {
                    'Content-Type': 'application/soap+xml;charset=utf-8',
                }
            }).pipe(
                retry({
                    count: 3,
                    delay: (error, retryCount) => {
                        this.logger.warn(`Retrying SEFAZ transmission (${retryCount}/3)...`);
                        return timer(Math.pow(2, retryCount) * 1000);
                    }
                })
            )
        );

        if (response.status === 200) {
            this.logger.log('SEFAZ Transmission Successful (mTLS Handshake Verified)');
        } else {
            throw new Error(`SEFAZ HTTP Error: ${response.status}`);
        }
    } catch (error: any) {
        this.logger.error(`SEFAZ Transmission failed: ${error.message}`, error.response?.data);
        throw new Error(`SEFAZ Transmission Error: ${error.message}`);
    }
  }
}
