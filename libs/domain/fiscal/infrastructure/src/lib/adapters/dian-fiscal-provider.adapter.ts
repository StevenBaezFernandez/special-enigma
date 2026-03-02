import { Injectable, Logger } from '@nestjs/common';
import { FiscalProvider } from '@virteex/domain-fiscal-domain/fiscal-provider.port';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timer } from 'rxjs';
import { retry } from 'rxjs/operators';
import { SignedXml } from 'xml-crypto';
import * as crypto from 'crypto';
import * as libxmljs from 'libxmljs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DianFiscalAdapter implements FiscalProvider {
  private readonly logger = new Logger(DianFiscalAdapter.name);
  private privateKey: string;
  private certificate: string;
  private xsdSchema: libxmljs.Document;

  constructor(private readonly httpService: HttpService) {
      const isProd = process.env['NODE_ENV'] === 'production' || process.env['RELEASE_STAGE'] === 'production';

      this.privateKey = process.env['FISCAL_PRIVATE_KEY'] || '';
      this.certificate = process.env['FISCAL_CERTIFICATE'] || '';

      if (isProd) {
          if (!this.privateKey) {
              throw new Error('FATAL: FISCAL_PRIVATE_KEY is mandatory for DIAN in production.');
          }
          if (!this.certificate) {
              throw new Error('FATAL: FISCAL_CERTIFICATE is mandatory for DIAN in production.');
          }
      }

      try {
          const schemaPath = path.join(__dirname, '../schemas/dian-ubl-2.1.xsd');
          if (fs.existsSync(schemaPath)) {
             const xsdContent = fs.readFileSync(schemaPath, 'utf8');
             this.xsdSchema = libxmljs.parseXml(xsdContent);
          } else {
             this.logger.error(`DIAN XSD Schema not found at ${schemaPath}. Blocking fiscal transmission.`);
             if (isProd) {
                 throw new Error('FATAL: DIAN XSD schema missing in production.');
             }
          }
      } catch (e) {
          this.logger.error('Failed to load DIAN XSD schema', e);
          if (isProd) throw e;
      }
  }

  async validateInvoice(invoice: any): Promise<boolean> {
    this.logger.log(`Validating invoice ${invoice?.id || 'unknown'} with DIAN (Colombia)...`);

    if (!invoice) {
        throw new Error('Invoice is null or undefined');
    }

    let xmlContent = '';
    if (typeof invoice === 'string') {
        xmlContent = invoice;
    } else {
        this.logger.error('validateInvoice received an object, but structural validation requires an XML string. Blocking.');
        throw new Error('Structural validation requires XML string for DIAN production flow.');
    }

    if (!this.xsdSchema) {
        this.logger.error('XSD Schema not loaded. Structural validation cannot proceed.');
        throw new Error('DIAN XSD Schema is missing. Validation blocked.');
    }

    try {
        const xmlDoc = libxmljs.parseXml(xmlContent);
        const isValid = xmlDoc.validate(this.xsdSchema);
        if (!isValid) {
            this.logger.error('DIAN XML Validation Failed', xmlDoc.validationErrors);
            throw new Error(`DIAN XML Validation Failed: ${xmlDoc.validationErrors.map(e => e.message).join(', ')}`);
        }
        this.logger.log('DIAN XML Validation Successful');
        return true;
    } catch (e: any) {
        this.logger.error(`DIAN Validation Error: ${e.message}`);
        throw e;
    }
  }

  async signInvoice(invoice: any): Promise<string> {
    this.logger.log(`Signing invoice ${invoice?.id || 'UNKNOWN'} with DIAN Digital Certificate (XAdES-EPES)...`);

    if (!this.privateKey || !this.certificate) {
        throw new Error('DIAN signing requires both FISCAL_PRIVATE_KEY and FISCAL_CERTIFICATE.');
    }

    try {
      let xmlContent = '';
      if (typeof invoice === 'string') {
          xmlContent = invoice;
      } else {
          throw new Error('signInvoice requires raw XML string for cryptographic integrity.');
      }

      const certBuffer = Buffer.from(this.certificate, 'base64');
      const certHash = crypto.createHash('sha256').update(certBuffer).digest('base64');

      const signingTime = new Date().toISOString();
      const signatureId = `Signature-${crypto.randomBytes(4).toString('hex')}`;
      const signedPropertiesId = `SignedProperties-${crypto.randomBytes(4).toString('hex')}`;

      const certSerialNumber = process.env['FISCAL_CERT_SERIAL_NUMBER'];
      const policyHash = process.env['FISCAL_POLICY_HASH'];

      const isProduction = process.env['NODE_ENV'] === 'production' || process.env['RELEASE_STAGE'] === 'production';

      if (isProduction) {
          if (!certSerialNumber || certSerialNumber === 'DEV-SERIAL-12345') {
              throw new Error('FATAL: Valid FISCAL_CERT_SERIAL_NUMBER is mandatory for DIAN in production.');
          }
          if (!policyHash || policyHash === 'DEV-POLICY-HASH') {
              throw new Error('FATAL: Valid FISCAL_POLICY_HASH is mandatory for DIAN in production.');
          }
      }

      if (!certSerialNumber) {
          this.logger.warn('FISCAL_CERT_SERIAL_NUMBER missing, falling back to development placeholder.');
      }
      if (!policyHash) {
          this.logger.warn('FISCAL_POLICY_HASH missing, falling back to development placeholder.');
      }

      const xadesObject = `
        <xades:QualifyingProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Target="#${signatureId}">
          <xades:SignedProperties Id="${signedPropertiesId}">
            <xades:SignedSignatureProperties>
              <xades:SigningTime>${signingTime}</xades:SigningTime>
              <xades:SigningCertificate>
                <xades:Cert>
                  <xades:CertDigest>
                    <ds:DigestMethod xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                    <ds:DigestValue xmlns:ds="http://www.w3.org/2000/09/xmldsig#">${certHash}</ds:DigestValue>
                  </xades:CertDigest>
                  <xades:IssuerSerial>
                    <ds:X509IssuerName xmlns:ds="http://www.w3.org/2000/09/xmldsig#">${process.env['FISCAL_CERT_ISSUER'] || 'DIAN-AUTORIDAD-SUB-CA'}</ds:X509IssuerName>
                    <ds:X509SerialNumber xmlns:ds="http://www.w3.org/2000/09/xmldsig#">${certSerialNumber || 'DEV-SERIAL-12345'}</ds:X509SerialNumber>
                  </xades:IssuerSerial>
                </xades:Cert>
              </xades:SigningCertificate>
              <xades:SignaturePolicyIdentifier>
                <xades:SignaturePolicyId>
                  <xades:SigPolicyId>
                    <xades:Identifier>https://facturaelectronica.dian.gov.co/politicadefirma/v2/politicadefirmav2.pdf</xades:Identifier>
                  </xades:SigPolicyId>
                  <xades:SigPolicyHash>
                    <ds:DigestMethod xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                    <ds:DigestValue xmlns:ds="http://www.w3.org/2000/09/xmldsig#">${policyHash || 'DEV-POLICY-HASH'}</ds:DigestValue>
                  </xades:SigPolicyHash>
                </xades:SignaturePolicyIdentifier>
              </xades:SignaturePolicyIdentifier>
            </xades:SignedSignatureProperties>
          </xades:SignedProperties>
        </xades:QualifyingProperties>`;

      const sig = new SignedXml();
      sig.addReference({
          xpath: "//*[local-name(.)='Invoice']",
          transforms: ['http://www.w3.org/2000/09/xmldsig#enveloped-signature', 'http://www.w3.org/2001/10/xml-exc-c14n#']
      });

      sig.addReference({
          xpath: `//*[local-name(.)='SignedProperties']`,
          transforms: ['http://www.w3.org/2001/10/xml-exc-c14n#'],
          digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256'
      });

      sig.canonicalizationAlgorithm = 'http://www.w3.org/2001/10/xml-exc-c14n#';
      sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';

      sig.keyInfoProvider = {
        getKeyInfo: () => `<X509Data><X509Certificate>${this.certificate}</X509Certificate></X509Data>`
      } as any;

      (sig as any).signingKey = this.privateKey;
      (sig as any).objects = [xadesObject];

      sig.computeSignature(xmlContent);

      return sig.getSignedXml();
    } catch (error: any) {
      this.logger.error(`Failed to sign DIAN invoice: ${error.message}`);
      throw new Error(`Signing failed: ${error.message}`);
    }
  }

  async transmitInvoice(invoice: any): Promise<void> {
    this.logger.log(`Transmitting invoice to DIAN (SOAP)...`);

    try {
        const dianUrl = process.env['DIAN_API_URL'];
        if (!dianUrl) throw new Error('DIAN_API_URL is not configured.');

        const signedXml = typeof invoice === 'string' ? invoice : await this.signInvoice(invoice);

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

        const response = await firstValueFrom(
            this.httpService.post(dianUrl, soapEnvelope, {
                timeout: 30000,
                headers: {
                    'Content-Type': 'text/xml;charset=UTF-8',
                    'SOAPAction': 'http://wcf.dian.colombia/iwcfDianCustomerServices/SendBillAsync'
                }
            }).pipe(
                retry({
                    count: 3,
                    delay: (error, retryCount) => {
                        this.logger.warn(`Retrying DIAN transmission (${retryCount}/3)...`);
                        return timer(Math.pow(2, retryCount) * 1000);
                    }
                })
            )
        );

        if (response.status === 200) {
            const responseBody = response.data;
            if (responseBody.includes('<b:Success>true</b:Success>') || responseBody.includes('UploadSuccess')) {
                 this.logger.log('DIAN Transmission Successful');
            } else {
                 throw new Error('DIAN Rejected Invoice or returned unrecognized response.');
            }
        } else {
             throw new Error(`DIAN HTTP Error: ${response.status}`);
        }
    } catch (error: any) {
        this.logger.error(`DIAN Transmission failed: ${error.message}`);
        throw new Error(`DIAN Transmission Error: ${error.message}`);
    }
  }
}
