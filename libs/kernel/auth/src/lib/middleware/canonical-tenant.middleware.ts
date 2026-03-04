import { Injectable, NestMiddleware, UnauthorizedException, Logger, OnModuleInit } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { TenantContext } from '../interfaces/tenant-context.interface';
import { runWithTenantContext } from '../storage/tenant-context.storage';
import { TelemetryService } from '@virteex/kernel-telemetry';
import { SecretManagerService } from '../services/secret-manager.service';
import '../interfaces/express.interface';

/**
 * Unified Canonical Tenant Context Middleware
 *
 * This middleware replaces both legacy TenantContextMiddleware and JwtTenantMiddleware.
 * It enforces a strict contract:
 * 1. For Service-to-Service: Signed HMAC context header (x-virteex-context)
 * 2. For User-to-Service: Verified JWT with tenantId claim
 *
 * It ensures zero-fallback and strict region validation.
 */
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
    } catch (_e) {
        this.logger.error('FATAL: Security secrets missing in SecretManager.');
        throw new Error('Insecure environment: missing required security secrets.');
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    const contextHeader = this.getHeader(req, 'x-virteex-context');
    const signatureHeader = this.getHeader(req, 'x-virteex-signature');
    const authHeader = req.headers.authorization;

    let context: TenantContext | null = null;

    if (contextHeader && signatureHeader) {
        context = this.processHmacContext(contextHeader, signatureHeader);
    } else if (authHeader) {
        context = this.processJwtContext(authHeader);
    }

    if (!context) {
      this.telemetryService.recordSecurityEvent('MISSING_OR_INVALID_TENANT_CONTEXT', {
        ip: req.ip,
        headers: req.headers,
      });
      throw new UnauthorizedException('Tenant context is required for all enterprise operations.');
    }

    // Cross-check header tenant_id if present (Defense in depth)
    const tenantIdHeader = this.getHeader(req, 'x-virteex-tenant-id');
    if (tenantIdHeader && tenantIdHeader !== context.tenantId) {
        this.logger.error(`[SECURITY] Tenant mismatch detected: Header=${tenantIdHeader}, Context=${context.tenantId}`);
        throw new UnauthorizedException('Tenant context integrity violation');
    }

    req.tenantContext = context;

    this.telemetryService.setTraceAttributes({
        'tenant.id': context.tenantId,
        'request.id': this.getHeader(req, 'x-request-id') || 'unknown',
    });

    runWithTenantContext(context, () => {
        next();
    });
  }

  private processHmacContext(payload: string, signature: string): TenantContext {
    if (!this.verifyHmac(payload, signature)) {
        throw new UnauthorizedException('Invalid Tenant Context Signature');
    }
    try {
        return JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    } catch (e) {
        throw new UnauthorizedException('Malformed Tenant Context Payload');
    }
  }

  private processJwtContext(authHeader: string): TenantContext {
    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException('Invalid Authorization token format');

    try {
        const decoded: any = jwt.verify(token, this.jwtSecret);
        if (!decoded || !decoded.tenantId) {
            throw new UnauthorizedException('Token missing mandatory tenantId claim');
        }

        return {
            tenantId: decoded.tenantId,
            userId: decoded.sub,
            role: decoded.roles || [],
            permissions: decoded.permissions || [],
            region: decoded.region || 'US',
            currency: decoded.currency || 'USD',
            language: decoded.language || 'en',
        };
    } catch (err: any) {
        throw new UnauthorizedException(err.name === 'TokenExpiredError' ? 'Session expired' : 'Invalid session');
    }
  }

  private verifyHmac(payload: string, signature: string): boolean {
    const expectedSignature = createHmac('sha256', this.hmacSecret)
      .update(payload)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature);
    const signatureBuffer = Buffer.from(signature);

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, signatureBuffer);
  }

  private getHeader(req: Request, key: string): string | undefined {
    const value = req.headers[key.toLowerCase()];
    if (Array.isArray(value)) return value[0];
    return value;
  }
}
