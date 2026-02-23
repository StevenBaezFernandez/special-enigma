import { Injectable, NestMiddleware, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { TenantContext } from '../interfaces/tenant-context.interface';
import { runWithTenantContext } from '../storage/tenant-context.storage';
import { TelemetryService } from '@virteex/telemetry';
import { SecretManagerService } from '../services/secret-manager.service';
import '../interfaces/express.interface'; // Import for side-effects (type merging)

@Injectable()
export class TenantContextMiddleware implements NestMiddleware, OnModuleInit {
  private secret: string;

  constructor(
    private readonly telemetryService: TelemetryService,
    private readonly secretManager: SecretManagerService
  ) {}

  onModuleInit() {
    // Fetch secret using SecretManagerService instead of process.env
    try {
        this.secret = this.secretManager.getSecret('VIRTEEX_HMAC_SECRET');
    } catch (_e) {
        throw new Error('FATAL: VIRTEEX_HMAC_SECRET is not defined. Application cannot start securely.');
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    const contextHeader = this.getHeader(req, 'x-virteex-context');
    const signatureHeader = this.getHeader(req, 'x-virteex-signature');

    if (!contextHeader || !signatureHeader) {
      this.telemetryService.recordSecurityEvent('MISSING_CONTEXT_HEADERS', {
        ip: req.ip,
        headers: req.headers,
      });
      throw new UnauthorizedException('Missing Tenant Context Headers');
    }

    if (!this.verifySignature(contextHeader, signatureHeader)) {
      this.telemetryService.recordSecurityEvent('INVALID_SIGNATURE', {
        ip: req.ip,
        headers: req.headers,
      });
      throw new UnauthorizedException('Invalid Tenant Context Signature');
    }

    try {
      const context: TenantContext = JSON.parse(Buffer.from(contextHeader, 'base64').toString('utf-8'));

      // Type-safe assignment thanks to declaration merging
      req.tenantContext = context;

      // Add Telemetry attributes
      const requestId = this.getHeader(req, 'x-request-id') || 'unknown';
      this.telemetryService.setTraceAttributes({
        'tenant.id': context.tenantId,
        'request.id': requestId,
      });

      runWithTenantContext(context, () => {
        next();
      });
    } catch (_error) {
      this.telemetryService.recordSecurityEvent('INVALID_CONTEXT_FORMAT', {
        ip: req.ip,
        headers: req.headers,
      });
      throw new UnauthorizedException('Invalid Tenant Context Format');
    }
  }

  private getHeader(req: Request, key: string): string | undefined {
    const value = req.headers[key];
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  }

  private verifySignature(payload: string, signature: string): boolean {
    const expectedSignature = createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature);
    const signatureBuffer = Buffer.from(signature);

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, signatureBuffer);
  }
}
