import { Injectable, NestMiddleware, UnauthorizedException, Logger, OnModuleInit } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { TenantContext } from '../interfaces/tenant-context.interface';
import { runWithTenantContext } from '../storage/tenant-context.storage';
import { TelemetryService } from '@virteex/kernel-telemetry';
import { SecretManagerService } from '../services/secret-manager.service';
import {
  claimsFromJwtPayload,
  parseAndValidateSignedContext,
} from '../services/tenant-context-contract.service';
import { TenantContextValidationError } from '../interfaces/signed-tenant-context.interface';
import '../interfaces/express.interface';

@Injectable()
export class CanonicalTenantMiddleware implements NestMiddleware, OnModuleInit {
  private readonly logger = new Logger(CanonicalTenantMiddleware.name);
  private hmacSecret!: string;
  private jwtSecret!: string;

  constructor(
    private readonly telemetryService: TelemetryService,
    private readonly secretManager: SecretManagerService
  ) {}

  onModuleInit() {
    try {
      this.hmacSecret = this.secretManager.getSecret('VIRTEEX_HMAC_SECRET');
      this.jwtSecret = this.secretManager.getSecret('JWT_SECRET');
    } catch {
      this.logger.error('FATAL: Security secrets missing in SecretManager.');
      throw new Error('Insecure environment: missing required security secrets.');
    }
  }

  use(req: Request, _res: Response, next: NextFunction) {
    const contextHeader = this.getHeader(req, 'x-virteex-context');
    const signatureHeader = this.getHeader(req, 'x-virteex-signature');
    const authHeader = req.headers.authorization;

    let context: TenantContext | null = null;

    try {
      if (contextHeader || signatureHeader) {
        context = parseAndValidateSignedContext(contextHeader, signatureHeader, this.hmacSecret);
      } else if (authHeader) {
        context = this.processJwtContext(authHeader);
      }
    } catch (error) {
      if (error instanceof TenantContextValidationError) {
        this.auditViolation(req, error.violationType, error.message);
      }
      throw error;
    }

    if (!context) {
      this.auditViolation(req, 'missing_context', 'Tenant context is required for all enterprise operations.');
      throw new UnauthorizedException('Tenant context is required for all enterprise operations.');
    }

    const tenantIdHeader = this.getHeader(req, 'x-virteex-tenant-id');
    if (tenantIdHeader && tenantIdHeader !== context.tenantId) {
      this.auditViolation(req, 'invalid_claims', 'Tenant context integrity violation');
      throw new UnauthorizedException('Tenant context integrity violation');
    }

    req.tenantContext = context;

    this.telemetryService.setTraceAttributes({
      'tenant.id': context.tenantId,
      'request.id': context.requestId ?? this.getHeader(req, 'x-request-id') ?? 'unknown',
      'tenant.context.version': context.contextVersion ?? 'legacy',
    });

    runWithTenantContext(context, () => next());
  }

  private processJwtContext(authHeader: string): TenantContext {
    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException('Invalid Authorization token format');

    try {
      const decoded = jwt.verify(token, this.jwtSecret) as jwt.JwtPayload;
      return claimsFromJwtPayload(decoded);
    } catch (err: any) {
      const violationType = err?.name === 'TokenExpiredError' ? 'expired_context' : 'invalid_signature';
      throw new TenantContextValidationError(
        violationType,
        err?.name === 'TokenExpiredError' ? 'Session expired' : 'Invalid session'
      );
    }
  }

  private auditViolation(req: Request, violationType: string, reason: string) {
    const details = {
      channel: 'http',
      violationType,
      reason,
      method: req.method,
      path: req.path,
      ip: req.ip,
      requestId: this.getHeader(req, 'x-request-id') ?? 'missing',
    };

    this.logger.warn(JSON.stringify({ event: 'tenant_context_rejected', ...details }));
    this.telemetryService.recordSecurityEvent('TENANT_CONTEXT_REJECTED', details);
    this.telemetryService.recordBusinessMetric('tenant_context_violations_total', 1, {
      channel: 'http',
      violationType,
    });
  }

  private getHeader(req: Request, key: string): string | undefined {
    const value = req.headers[key.toLowerCase()];
    if (Array.isArray(value)) return value[0];
    return value;
  }
}
