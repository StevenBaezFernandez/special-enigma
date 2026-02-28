import { createProxyMiddleware } from 'http-proxy-middleware';
import { RequestHandler } from 'express';

export function createServiceProxy(target: string): RequestHandler {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
  });
}
