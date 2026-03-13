import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { FiscalProvider } from '@virteex/domain-fiscal-domain';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { SignedXml } from 'xml-crypto';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

@Injectable()
export class DgiiFiscalAdapter implements FiscalProvider {
  private readonly logger = new Logger(DgiiFiscalAdapter.name);
  private readonly apiUrl: string;
  private readonly authUrl: string;
  private readonly certificate: string;
  private readonly privateKey: string;
  private authToken: string | null = null;
  private tokenExpiration: Date | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.apiUrl = this.configService.get<string>(
      'DGII_API_URL',
      'https://ecf.dgii.gov.do/testecf/emisorreceptor/api'
    );
    this.authUrl = this.configService.get<string>(
      'DGII_AUTH_URL',
      'https://ecf.dgii.gov.do/testecf/autenticacion/api/autenticacion/obtenersemilla'
    );
    this.certificate = this.configService.get<string>('DGII_CERTIFICATE', '');
    this.privateKey = this.configService.get<string>('DGII_PRIVATE_KEY', '');
  }

  async validateInvoice(invoice: any): Promise<boolean> {
    // Basic structural validation could be added here
    return true;
  }

  async signInvoice(invoice: any): Promise<string> {
    let xmlContent = typeof invoice === 'string' ? invoice : '';
    if (!xmlContent) throw new Error('signInvoice for DGII requires a raw XML string.');

    try {
      const sig = new SignedXml();
      sig.addReference({
        xpath: "//*[local-name(.)='ECF']",
        transforms: [
          'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
          'http://www.w3.org/2001/10/xml-exc-c14n#',
        ],
      });
      sig.canonicalizationAlgorithm = 'http://www.w3.org/2001/10/xml-exc-c14n#';
      sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';
      (sig as any).signingKey = this.privateKey;
      sig.computeSignature(xmlContent);
      return sig.getSignedXml();
    } catch (error: any) {
      this.logger.error(`Failed to sign DGII XML: ${error.message}`);
      throw new InternalServerErrorException('Failed to sign invoice for DGII.');
    }
  }

  private async getAuthToken(): Promise<string> {
    if (this.authToken && this.tokenExpiration && this.tokenExpiration > new Date()) {
      return this.authToken;
    }

    try {
      // 1. Obtener Semilla
      const semillaResponse = await firstValueFrom(this.httpService.get(this.authUrl));
      const parser = new XMLParser();
      const semillaData = parser.parse(semillaResponse.data);
      const semilla = semillaData.SemillaRespuesta?.semilla;

      if (!semilla) throw new Error('Failed to obtain semilla from DGII');

      // 2. Firmar Semilla (Simplified representation of XMLDSig on semilla)
      const signedSemilla = await this.signXml(
        `<?xml version="1.0" encoding="utf-8"?><Semilla>${semilla}</Semilla>`,
        'Semilla'
      );

      // 3. Obtener Token
      const tokenUrl = this.authUrl.replace('obtenersemilla', 'validarcertificado');
      const tokenResponse = await firstValueFrom(
        this.httpService.post(tokenUrl, signedSemilla, {
          headers: { 'Content-Type': 'application/xml' },
        })
      );

      const tokenData = parser.parse(tokenResponse.data);
      this.authToken = tokenData.RespuestaAutenticacion?.token;

      // Tokens usually last 24h, we'll set it to 12h to be safe
      this.tokenExpiration = new Date(Date.now() + 12 * 60 * 60 * 1000);

      if (!this.authToken) throw new Error('Failed to obtain token from DGII');

      return this.authToken;
    } catch (error: any) {
      this.logger.error(`DGII Auth failed: ${error.message}`);
      throw new InternalServerErrorException('Failed to authenticate with DGII.');
    }
  }

  private async signXml(xml: string, xpath: string): Promise<string> {
    const sig = new SignedXml();
    sig.addReference({
      xpath: `//*[local-name(.)='${xpath}']`,
      transforms: [
        'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
        'http://www.w3.org/2001/10/xml-exc-c14n#',
      ],
    });
    sig.canonicalizationAlgorithm = 'http://www.w3.org/2001/10/xml-exc-c14n#';
    sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';
    (sig as any).signingKey = this.privateKey;
    sig.computeSignature(xml);
    return sig.getSignedXml();
  }

  async transmitInvoice(invoice: any): Promise<void> {
    const token = await this.getAuthToken();
    const signedXml = typeof invoice === 'string' ? invoice : await this.signInvoice(invoice);

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/emision/emisioncomprobantes`, signedXml, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/xml',
          },
        })
      );

      if (response.status !== 200 && response.status !== 202) {
        throw new Error(`DGII returned status ${response.status}`);
      }
      this.logger.log(`Invoice transmitted to DGII successfully. TrackID: ${response.data.trackId}`);
    } catch (error: any) {
      this.logger.error(`Error transmitting to DGII: ${error.message}`);
      throw new InternalServerErrorException(`DGII Transmission Error: ${error.message}`);
    }
  }

  async send(document: any): Promise<any> {
    this.logger.log('Forwarding document to DGII transmission pipeline');
    await this.transmitInvoice(document);
    return { success: true };
  }
}
