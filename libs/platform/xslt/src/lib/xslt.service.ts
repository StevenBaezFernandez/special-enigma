import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { XmlParser, Xslt } from 'xslt-processor';

@Injectable()
export class XsltService {
  private readonly logger = new Logger(XsltService.name);
  private cache: Map<string, string> = new Map();

  constructor() {}

  async transform(xmlContent: string, xsltPath: string): Promise<string> {
    try {
      const xsltContent = this.getXsltContent(xsltPath);
      // Bundle includes
      const bundledXslt = this.bundleIncludes(xsltContent, path.dirname(xsltPath));

      const parser = new XmlParser();
      const xmlDoc = parser.xmlParse(xmlContent);
      const xsltDoc = parser.xmlParse(bundledXslt);

      const processor = new Xslt();
      const result = await processor.xsltProcess(xmlDoc, xsltDoc);

      // Cadena Original should not have surrounding tags if it's just text output
      // But xslt-processor outputs what the XSLT generates.
      // Our XSLT generates text starting with |.
      // Result might be wrapped in specific way? No, based on test it returns string.
      // However, we should trim whitespace if needed, but Cadena Original relies on exact pipe separation.
      // We'll trust the XSLT output.

      // Decode HTML entities if any (xslt-processor might escape characters)
      return this.decodeEntities(result);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error transforming XML with XSLT: ${err.message}`, err.stack);
      throw new Error(`XSLT Transformation failed: ${err.message}`);
    }
  }

  private getXsltContent(xsltPath: string): string {
    const fullPath = path.resolve(process.cwd(), xsltPath);
    if (this.cache.has(fullPath)) {
      return this.cache.get(fullPath)!;
    }
    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        this.cache.set(fullPath, content);
        return content;
    } catch (e) {
        this.logger.error(`Failed to read XSLT file at ${fullPath}`, e);
        throw new Error(`XSLT file not found: ${fullPath}`);
    }
  }

  private bundleIncludes(content: string, baseDir: string): string {
    return content.replace(/<xsl:include\s+href="([^"]+)"\s*\/>/g, (match, href) => {
        const includePath = path.resolve(process.cwd(), baseDir, href);
        try {
            const includeContent = fs.readFileSync(includePath, 'utf8');
            // Remove xml declaration from include
            const cleanContent = includeContent.replace(/<\?xml.*?\?>/, '');
            // Remove stylesheet tag wrapper if present (merge templates)
            // Actually, simply replacing <xsl:include> with content of another stylesheet
            // is not valid XSLT if the included file has <xsl:stylesheet> root.
            // XSLT include mechanism expects children of <xsl:stylesheet> to be merged.

            // Extract children of xsl:stylesheet/transform
            const matchBody = cleanContent.match(/<xsl:(?:stylesheet|transform)[^>]*>([\s\S]*?)<\/xsl:(?:stylesheet|transform)>/);
            if (matchBody && matchBody[1]) {
                return this.bundleIncludes(matchBody[1], baseDir);
            }
            return match; // Fallback or valid fragment
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            this.logger.warn(`Failed to bundle include ${href}: ${message}`);
            return match;
        }
    });
  }

  private decodeEntities(str: string): string {
      return str
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'");
  }
}
