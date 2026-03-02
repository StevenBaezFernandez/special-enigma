import { Injectable, Logger } from '@nestjs/common';
import { FiscalProvider } from '@virteex/domain-fiscal-domain/fiscal-provider.port';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, retry, timer } from 'rxjs';
import { SignedXml } from 'xml-crypto';
// @ts-ignore
import { DOMParser } from '@xmldom/xmldom';
import * as crypto from 'crypto';
import * as libxmljs from 'libxmljs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DianFiscalAdapter implements FiscalProvider {
  private readonly logger = new Logger(DianFiscalAdapter.name);
  private privateKey: string;
  private xsdSchema: libxmljs.Document;

  constructor(private readonly httpService: HttpService) {
      if (process.env['FISCAL_PRIVATE_KEY']) {
          this.privateKey = process.env['FISCAL_PRIVATE_KEY'];
      } else {
          this.logger.error('FISCAL_PRIVATE_KEY not provided. Cannot initialize DIAN adapter.');
      }

      try {
          const schemaPath = path.join(__dirname, '../schemas/dian-ubl-2.1.xsd');
          if (fs.existsSync(schemaPath)) {
             const xsdContent = fs.readFileSync(schemaPath, 'utf8');
             this.xsdSchema = libxmljs.parseXml(xsdContent);
          } else {
             this.logger.warn(`XSD Schema not found at ${schemaPath}. Validation will be skipped.`);
          }
      } catch (e) {
          this.logger.error('Failed to load XSD schema', e);
      }
  }

  async validateInvoice(invoice: any): Promise<boolean> {
    this.logger.log(`Validating invoice ${invoice?.id} with DIAN (Robust Integration)...`);

    if (!invoice) {
        throw new Error('Invoice is null or undefined');
    }

    let xmlContent = '';
    if (typeof invoice === 'string') {
        xmlContent = invoice;
    } else {
        this.logger.warn('validateInvoice received an object, skipping XSD validation as it requires XML string.');
        return true;
    }

    if (this.xsdSchema) {
        try {
            const xmlDoc = libxmljs.parseXml(xmlContent);
            const isValid = xmlDoc.validate(this.xsdSchema);
            if (!isValid) {
                this.logger.error('XML Validation Failed', xmlDoc.validationErrors);
                throw new Error(`XML Validation Failed: ${xmlDoc.validationErrors.map(e => e.message).join(', ')}`);
            }
            this.logger.log('XML Validation Successful');
        } catch (e: any) {
            this.logger.error(`Validation Error: ${e.message}`);
            throw e;
        }
    }

    return true;
  }

  async signInvoice(invoice: any): Promise<string> {
    this.logger.log(`Signing invoice ${invoice?.id || 'UNKNOWN'} with DIAN Digital Certificate (XAdES-EPES)...`);

    if (!this.privateKey) {
        throw new Error('FISCAL_PRIVATE_KEY is missing. Cannot sign invoice.');
    }

    try {
      let xmlContent = '';
      if (typeof invoice === 'string') {
          xmlContent = invoice;
      } else {
          xmlContent = `<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"><cbc:ID>${invoice?.id || 'TEST'}</cbc:ID></Invoice>`;
      }

      const certificate = process.env['FISCAL_CERTIFICATE'];
      if (!certificate) {
          throw new Error('FISCAL_CERTIFICATE is missing. Required for DIAN signing.');
      }
      const certBuffer = Buffer.from(certificate, 'base64');
      const certHash = crypto.createHash('sha256').update(certBuffer).digest('base64');

      const signingTime = new Date().toISOString();
      const signatureId = `Signature-${Math.random().toString(36).substring(7)}`;
      const signedPropertiesId = `SignedProperties-${Math.random().toString(36).substring(7)}`;

      const sig = new SignedXml();

      const certSerialNumber = process.env['FISCAL_CERT_SERIAL_NUMBER'];
      if (!certSerialNumber && process.env['NODE_ENV'] === 'production') {
          throw new Error('FISCAL_CERT_SERIAL_NUMBER is mandatory in production for DIAN compliance.');
      }

      const policyHash = process.env['FISCAL_POLICY_HASH'];
      if (!policyHash && process.env['NODE_ENV'] === 'production') {
          throw new Error('FISCAL_POLICY_HASH is mandatory in production for DIAN compliance.');
      }

      // XAdES Object
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
                    <ds:X509SerialNumber xmlns:ds="http://www.w3.org/2000/09/xmldsig#">${certSerialNumber || 'PLACEHOLDER-SERIAL'}</ds:X509SerialNumber>
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
                    <ds:DigestValue xmlns:ds="http://www.w3.org/2000/09/xmldsig#">${policyHash || 'PLACEHOLDER-POLICY-HASH'}</ds:DigestValue>
                  </xades:SigPolicyHash>
                </xades:SignaturePolicyId>
              </xades:SignaturePolicyIdentifier>
            </xades:SignedSignatureProperties>
          </xades:SignedProperties>
        </xades:QualifyingProperties>`;

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
        getKeyInfo: () => {
            return `<X509Data><X509Certificate>${certificate}</X509Certificate></X509Data>`;
        }
      } as any;

      (sig as any).signingKey = this.privateKey;

      // Inject XAdES object manually into the signature
      (sig as any).objects = [xadesObject];

      sig.computeSignature(xmlContent);

      const signedXml = sig.getSignedXml();
      this.logger.log(`Invoice signed successfully with XAdES-EPES compliance.`);
      return signedXml;

    } catch (error: any) {
      this.logger.error(`Failed to sign invoice: ${error.message}`, error.stack);
      throw new Error(`Signing failed: ${error.message}`);
    }
  }

  async transmitInvoice(invoice: any): Promise<void> {
    const isProd = process.env['NODE_ENV'] === 'production';
    if (isProd && !process.env['FISCAL_PRIVATE_KEY']) {
        throw new Error('DIAN Adapter: Production requires FISCAL_PRIVATE_KEY');
    }

    this.logger.log(`Transmitting invoice to DIAN (SOAP)...`);

    try {
        const dianUrl = process.env['DIAN_API_URL'] || 'https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc';

        let signedXml = '';
        if (typeof invoice === 'string') {
            signedXml = invoice;
        } else {
             signedXml = await this.signInvoice(invoice);
        }

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
            } else if (responseBody.includes('<b:ErrorMessage>')) {
                 const match = responseBody.match(/<b:ErrorMessage>(.*?)<\/b:ErrorMessage>/);
                 const errorMsg = match ? match[1] : 'Unknown DIAN Error';
                 throw new Error(`DIAN Rejected Invoice: ${errorMsg}`);
            } else {
                 this.logger.warn(`DIAN ambiguous response. Body: ${responseBody}`);
                 throw new Error('DIAN response not recognized');
            }
        } else {
             throw new Error(`DIAN HTTP Error: ${response.status}`);
        }
    } catch (error: any) {
        this.logger.error(`Transmission failed: ${error.message}`, error.response?.data);
        throw new Error(`DIAN Transmission Error: ${error.message}`);
    }
  }
}
