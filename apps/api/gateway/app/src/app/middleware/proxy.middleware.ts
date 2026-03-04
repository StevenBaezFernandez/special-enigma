import { RequestHandler } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ForbiddenException } from '@nestjs/common';
import { RoutingPlaneService } from '@virteex/kernel-tenant';

interface ProxyPolicy {
  service: string;
  target: string;
  routingPlane?: RoutingPlaneService;
}

export function createServiceProxy(policy: ProxyPolicy): RequestHandler {
  const proxy = createProxyMiddleware({
    target: policy.target,
    changeOrigin: true,
    router: (req) => ((req as any).__enforcedRouteTarget as string) || policy.target,
  });

  return async (req, res, next) => {
    if (!policy.routingPlane) {
      return proxy(req, res, next);
    }

    const tenantId = req.header('x-tenant-id') || req.header('x-virteex-tenant-id');
    if (!tenantId) {
      return next(new ForbiddenException('Tenant header is required for routed proxy requests'));
    }

    const generationHeader = req.header('x-routing-generation');
    const signature = req.header('x-routing-signature') || undefined;
    const generation = generationHeader ? Number(generationHeader) : undefined;

    try {
      const resolved = await policy.routingPlane.enforceProxyRoute({
        tenantId,
        service: policy.service,
        requestedTarget: policy.target,
        generation,
        signature,
      });

      (req as any).__enforcedRouteTarget = resolved.target;
      res.setHeader('x-routing-generation', String(resolved.generation));
      res.setHeader('x-routing-signature', resolved.signature);
      return proxy(req, res, next);
    } catch (error) {
      return next(error);
    }
  };
}
