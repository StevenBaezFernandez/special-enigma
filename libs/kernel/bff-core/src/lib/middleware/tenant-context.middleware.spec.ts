import { TenantContextMiddleware } from './tenant-context.middleware';
import { Request, Response } from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('TenantContextMiddleware', () => {
  let middleware: TenantContextMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: any;

  beforeEach(() => {
    middleware = new TenantContextMiddleware();
    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    nextFunction = vi.fn();
  });

  it('should call next if tenantContext is present', () => {
    (mockRequest as any).tenantContext = { tenantId: 't1' };
    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should return 401 if tenantContext is missing', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      code: 'MISSING_TENANT_CONTEXT'
    }));
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
