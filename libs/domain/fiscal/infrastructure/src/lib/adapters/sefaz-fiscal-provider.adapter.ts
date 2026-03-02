import { Injectable, Logger } from '@nestjs/common';
import { FiscalProvider } from '@virteex/domain-fiscal-domain/fiscal-provider.port';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timer } from 'rxjs';
import { retry } from 'rxjs/operators';
import { SignedXml } from 'xml-crypto';
import * as https from 'https';
import * as libxmljs from 'libxmljs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SefazFiscalAdapter implements FiscalProvider {
  private readonly logger = new Logger(SefazFiscalAdapter.name);
  private privateKey: string;
  private certificate: string;
  private xsdSchema: libxmljs.Document;

  constructor(private readonly httpService: HttpService) {
    const isProd = process.env['NODE_ENV'] === 'production' || process.env['RELEASE_STAGE'] === 'production';

    this.privateKey = process.env['FISCAL_PRIVATE_KEY'] || '';
    this.certificate = process.env['FISCAL_CERTIFICATE'] || '';

    if (isProd) {
      if (!this.privateKey) {
        throw new Error('FATAL: FISCAL_PRIVATE_KEY is mandatory for SEFAZ in production.');
      }
      if (!this.certificate) {
        throw new Error('FATAL: FISCAL_CERTIFICATE is mandatory for SEFAZ in production (mTLS).');
      }
    }

    try {
        const schemaPath = path.join(__dirname, '../schemas/nfe-4.00.xsd');
        if (fs.existsSync(schemaPath)) {
            const xsdContent = fs.readFileSync(schemaPath, 'utf8');
            this.xsdSchema = libxmljs.parseXml(xsdContent);
        } else {
            this.logger.error(`SEFAZ XSD Schema not found at ${schemaPath}. Blocking fiscal transmission.`);
            if (isProd) {
                throw new Error('FATAL: SEFAZ XSD schema missing in production.');
            }
        }
    } catch (e) {
        this.logger.error('Failed to load SEFAZ XSD schema', e);
        if (isProd) throw e;
    }
  }

  async validateInvoice(invoice: any): Promise<boolean> {
    this.logger.log(`Validating invoice ${invoice?.id || 'unknown'} with SEFAZ (Brazil)...`);

    if (!invoice) {
        throw new Error('Invoice is null or undefined');
    }

    let xmlContent = '';
    if (typeof invoice === 'string') {
        xmlContent = invoice;
    } else {
        // REMOVED: Fallback mock. Structural validation is now MANDATORY for production-ready status.
        this.logger.error('validateInvoice received an object, but structural validation requires an XML string. Blocking.');
        throw new Error('Structural validation requires XML string. Object input is no longer supported for SEFAZ production flow.');
    }

    if (!this.xsdSchema) {
        this.logger.error('XSD Schema not loaded. Structural validation cannot proceed.');
        throw new Error('SEFAZ XSD Schema is missing. Validation blocked.');
    }

    try {
        const xmlDoc = libxmljs.parseXml(xmlContent);
        const isValid = xmlDoc.validate(this.xsdSchema);
        if (!isValid) {
            this.logger.error('NFe XML Validation Failed', xmlDoc.validationErrors);
            throw new Error(`NFe XML Validation Failed: ${xmlDoc.validationErrors.map(e => e.message).join(', ')}`);
        }
        this.logger.log('NFe XML Validation Successful');
        return true;
    } catch (e: any) {
        this.logger.error(`NFe Validation Error: ${e.message}`);
        throw e;
    }
  }

  async signInvoice(invoice: any): Promise<string> {
    this.logger.log(`Signing invoice ${invoice?.id || 'UNKNOWN'} with SEFAZ Digital Certificate...`);

    if (!this.privateKey) {
        throw new Error('Cannot sign NFe: Private key is missing.');
    }

    try {
      let xmlContent = '';
      if (typeof invoice === 'string') {
          xmlContent = invoice;
      } else {
          // In a real system, we would serialize the object to XML here using a production-grade serializer
          throw new Error('Automatic serialization not implemented. signInvoice requires raw XML string for cryptographic integrity.');
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

      return sig.getSignedXml();

    } catch (error: any) {
      this.logger.error(`Failed to sign NFe: ${error.message}`);
      throw new Error(`Signing failed: ${error.message}`);
    }
  }

  async transmitInvoice(invoice: any): Promise<void> {
    this.logger.log(`Starting NFe transmission to SEFAZ...`);

    try {
        const isValid = await this.validateInvoice(invoice);
        if (!isValid) {
            throw new Error('Invoice failed structural validation prior to transmission.');
        }

        const sefazUrl = process.env['SEFAZ_API_URL'];
        if (!sefazUrl) {
            throw new Error('SEFAZ_API_URL is not configured.');
        }

        let signedXml = typeof invoice === 'string' ? invoice : await this.signInvoice(invoice);

        const soapEnvelope = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:nfe="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4">
           <soap:Header/>
           <soap:Body>
              <nfe:nfeDadosMsg>${signedXml}</nfe:nfeDadosMsg>
           </soap:Body>
        </soap:Envelope>`;

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
        this.logger.error(`SEFAZ Transmission failed: ${error.message}`);
        throw new Error(`SEFAZ Transmission Error: ${error.message}`);
    }
  }
}
