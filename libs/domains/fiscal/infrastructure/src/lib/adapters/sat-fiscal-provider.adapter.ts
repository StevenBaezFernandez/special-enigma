import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { FiscalProvider } from '@virteex/domain-fiscal-domain';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Xslt, XmlParser } from 'xslt-processor';

@Injectable()
export class SatFiscalAdapter implements FiscalProvider {
  private readonly logger = new Logger(SatFiscalAdapter.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly certPath: string;
  private readonly xsltPath: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.apiUrl = this.configService.get<string>('SAT_API_URL', 'https://api.sat.gob.mx');
    this.apiKey = this.configService.getOrThrow<string>('SAT_API_KEY');
    this.certPath = this.configService.getOrThrow<string>('SAT_CERT_PATH');
    this.xsltPath = path.resolve('libs/domains/billing/domain/src/lib/xslt');
  }

  async validateInvoice(invoice: any): Promise<boolean> {
    this.logger.log(`Validating invoice ${invoice?.id} with SAT...`);
    const cfdiPayload = this.buildCfdiPayload(invoice);

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/validate`, cfdiPayload, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/xml'
          }
        })
      );
      return response.data.valid === true;
    } catch (error: any) {
      this.logger.error(`Error validating with SAT: ${error.message}`, error.response?.data);
      if (error.response?.status === 400) return false;
      throw new InternalServerErrorException('Fiscal validation service unavailable');
    }
  }

  async signInvoice(invoice: any): Promise<string> {
    this.logger.log(`Signing invoice ${invoice?.id} with strict cryptographic standards (Cadena Original)...`);

    if (!this.certPath) {
        throw new InternalServerErrorException('Certificate path is not configured.');
    }

    try {
        // 1. Get Private Key (Async)
        const privateKeyPem = await fs.promises.readFile(this.certPath, 'utf8');

        // 2. Build XML
        const xml = this.buildCfdiPayload(invoice);

        // 3. Generate Cadena Original using XSLT
        const cadenaOriginal = await this.generateCadenaOriginal(xml);
        this.logger.debug(`Cadena Original generated: ${cadenaOriginal.substring(0, 50)}...`);

        // 4. Sign Cadena Original (SHA256 with RSA)
        const sign = crypto.createSign('SHA256');
        sign.update(cadenaOriginal);
        sign.end();

        const signature = sign.sign(privateKeyPem, 'base64');

        this.logger.log(`Invoice ${invoice?.id} signed successfully.`);
        return signature;
    } catch (error: any) {
        this.logger.error(`Critical error signing invoice: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Failed to generate cryptographic signature for invoice.');
    }
  }

  async transmitInvoice(invoice: any): Promise<void> {
    const signature = await this.signInvoice(invoice);
    const signedPayload = { ...invoice, signature };

    try {
      await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/transmit`, signedPayload, {
            headers: { 'Authorization': `Bearer ${this.apiKey}` }
        })
      );
      this.logger.log(`Invoice ${invoice?.id} transmitted successfully.`);
    } catch (error: any) {
      this.logger.error(`Error transmitting to SAT`, error);
      throw error;
    }
  }

  private buildCfdiPayload(invoice: any): string {
      return `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante Version="4.0" Fecha="${new Date().toISOString()}" Sello="" NoCertificado="00001000000500000000" Certificado="" SubTotal="${invoice.subtotal}" Moneda="MXN" Total="${invoice.total}" TipoDeComprobante="I" Exportacion="01" MetodoPago="PUE" LugarExpedicion="00000" xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd">
  <cfdi:Emisor Rfc="${invoice.issuerRfc}" Nombre="EMISOR DE PRUEBA" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="${invoice.receiverRfc}" Nombre="RECEPTOR DE PRUEBA" DomicilioFiscalReceptor="00000" RegimenFiscalReceptor="616" UsoCFDI="G03"/>
  <cfdi:Conceptos>
    ${invoice.items?.map((i: any) => `<cfdi:Concepto ClaveProdServ="01010101" Cantidad="1" ClaveUnidad="H87" Description="Producto" ValorUnitario="${i.amount}" Importe="${i.amount}" ObjetoImp="01"/>`).join('')}
  </cfdi:Conceptos>
</cfdi:Comprobante>`;
  }

  private async generateCadenaOriginal(xml: string): Promise<string> {
      const mainXsltPath = path.join(this.xsltPath, 'cadenaoriginal_4_0.xslt');
      let mainXslt = await fs.promises.readFile(mainXsltPath, 'utf8');

      const utileriasContent = await fs.promises.readFile(path.join(this.xsltPath, 'utilerias.xslt'), 'utf8');
      const nomina12Content = await fs.promises.readFile(path.join(this.xsltPath, 'nomina12.xslt'), 'utf8');

      const cleanInclude = (content: string) => content.replace(/<\?xml.*?\?>/, '').replace(/<xsl:stylesheet.*?>/, '').replace('</xsl:stylesheet>', '');

      mainXslt = mainXslt.replace('<xsl:include href="utilerias.xslt"/>', cleanInclude(utileriasContent));
      mainXslt = mainXslt.replace('<xsl:include href="nomina12.xslt"/>', cleanInclude(nomina12Content));

      try {
          const parser = new XmlParser();
          const processor = new Xslt();
          // xsltProcess is async in the library definition I read: xsltProcess(xmlDoc, stylesheet): Promise<string>
          const out = await processor.xsltProcess(parser.xmlParse(xml), parser.xmlParse(mainXslt));
          return out;
      } catch (e: any) {
          this.logger.error(`XSLT Processing failed: ${e.message}`);
          throw new InternalServerErrorException('Failed to generate Cadena Original');
      }
  }
}
