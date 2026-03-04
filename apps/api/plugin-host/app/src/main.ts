import Fastify, { FastifyRequest } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Plugin, PluginVersion, PluginStatus, PluginChannel, TenantConsent, MeteringRecord } from '@virteex/domain-catalog-domain';
import ormConfig from '../../../../../libs/domain/catalog/infrastructure/src/lib/persistence/mikro-orm.config';
import { SandboxService } from './sandbox.service';
import { PluginAdmissionService } from './services/plugin-admission.service';
import { MeteringService } from './services/metering.service';
import { BillingService } from './services/billing.service';
import { parseAndValidateSignedContext } from '@virteex/kernel-auth';
import { metrics } from '@opentelemetry/api';

const nodeEnv = process.env.NODE_ENV ?? 'development';
const authToken = process.env.PLUGIN_HOST_API_TOKEN;
const registryPath = process.env.PLUGIN_REGISTRY_FILE ?? path.join(__dirname, 'plugins.json');
const sandboxMode = process.env.PLUGIN_SANDBOX_MODE ?? 'standard';
const admissionMode = process.env.PLUGIN_ADMISSION_MODE ?? 'warn';
const marketplaceRegion = (process.env.MARKETPLACE_REGION ?? 'MX').toUpperCase();

const marketplaceRegionPolicy: Record<string, { enabled: boolean; requiresHardenedSandbox: boolean }> = {
  MX: { enabled: true, requiresHardenedSandbox: true },
  BR: { enabled: true, requiresHardenedSandbox: true },
  CO: { enabled: false, requiresHardenedSandbox: true },
  US: { enabled: true, requiresHardenedSandbox: true },
};

const regionPolicy = marketplaceRegionPolicy[marketplaceRegion];
if (!regionPolicy) {
  throw new Error(`Unsupported MARKETPLACE_REGION '${marketplaceRegion}'.`);
}

if (!regionPolicy.enabled) {
  throw new Error(`Marketplace is blocked for region ${marketplaceRegion} until hardened sandbox readiness is certified.`);
}

if (nodeEnv === 'production' && regionPolicy.requiresHardenedSandbox && sandboxMode !== 'hardened') {
  throw new Error(`MARKETPLACE_REGION=${marketplaceRegion} requires PLUGIN_SANDBOX_MODE=hardened.`);
}

if (nodeEnv === 'production' && !authToken) {
  throw new Error('PLUGIN_HOST_API_TOKEN is required in production.');
}

if (nodeEnv === 'production' && registryPath.endsWith('plugins.json')) {
  throw new Error('Default plugins.json registry storage is blocked in production. Configure PLUGIN_REGISTRY_FILE to durable storage.');
}

if (nodeEnv === 'production' && sandboxMode !== 'hardened') {
  throw new Error('PLUGIN_SANDBOX_MODE=hardened is mandatory in production. Plugin deployment is denied otherwise.');
}

if (nodeEnv === 'production' && admissionMode !== 'enforced') {
  throw new Error('PLUGIN_ADMISSION_MODE=enforced is mandatory in production. Plugin deployment is denied otherwise.');
}

const server = Fastify({ logger: true });
const meter = metrics.getMeter('virteex-plugin-host');
const contextViolationCounter = meter.createCounter('tenant_context_violations_total');

const sandbox = new SandboxService();
const admissionService = new PluginAdmissionService();

let orm: MikroORM<PostgreSqlDriver>;

// Middleware for MikroORM RequestContext
server.addHook('onRequest', (request, reply, done) => {
  RequestContext.create(orm.em, done);
});

server.addHook('preHandler', async (request, reply) => {
  if (request.url.startsWith('/health')) {
    return;
  }

  const encodedContext = request.headers['x-virteex-context'] as string | undefined;
  const signature = request.headers['x-virteex-signature'] as string | undefined;
  const secret = process.env.VIRTEEX_HMAC_SECRET;

  if (!secret) {
    reply.status(500).send({ error: 'VIRTEEX_HMAC_SECRET is required for plugin-host context validation.' });
    return;
  }

  try {
    const claims = parseAndValidateSignedContext(encodedContext, signature, secret);
    (request as any).tenantContext = claims;
  } catch (error: any) {
    const violationType = error?.violationType ?? 'invalid_context';
    server.log.warn({
      event: 'tenant_context_rejected',
      channel: 'plugin-host-http',
      path: request.url,
      method: request.method,
      violationType,
      reason: error?.message ?? 'Unknown context validation failure',
    });
    contextViolationCounter.add(1, { channel: 'plugin-host-http', violationType });
    reply.status(401).send({ error: 'Rejected request without valid signed tenant context.' });
  }
});

function authorize(request: FastifyRequest) {
  if (!authToken) {
    return;
  }

  const incomingToken = request.headers['x-plugin-host-token'];
  if (incomingToken !== authToken) {
    const error = new Error('Unauthorized plugin host request. Missing or invalid x-plugin-host-token.');
    (error as any).statusCode = 401;
    throw error;
  }
}

server.get('/plugins', async () => {
  const plugins = await orm.em.find(Plugin, {}, { populate: ['versions'] });
  return plugins.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    description: p.description,
    author: p.author,
    versionCount: p.versions.length,
  }));
});

server.post('/plugins', async (request, reply) => {
  try {
    authorize(request);
  } catch (error: any) {
    return reply.status(error.statusCode || 401).send({ error: error.message });
  }

  const body = request.body as { name: string; version: string; code: string; description?: string; author?: string, capabilities?: string[], sbom?: any };

  if (!body.name || !body.code || !body.version) {
    return reply.status(400).send({ error: 'Name, version, and code are required' });
  }

  let plugin = await orm.em.findOne(Plugin, { name: body.name });
  if (!plugin) {
      plugin = new Plugin();
      plugin.id = crypto.randomUUID();
      plugin.name = body.name;
      plugin.description = body.description;
      plugin.author = body.author;
      orm.em.persist(plugin);
  }

  const admission = await admissionService.validatePlugin({
    name: body.name,
    code: body.code,
    sbom: body.sbom
  });

  if (admission.status === 'rejected') {
    return reply.status(403).send({
        error: 'Plugin rejected by admission policy during registration',
        reason: admission.reason
    });
  }

  const pVersion = new PluginVersion();
  pVersion.id = crypto.randomUUID();
  pVersion.plugin = plugin;
  pVersion.version = body.version;
  pVersion.code = body.code;
  pVersion.capabilities = body.capabilities;
  pVersion.sbom = body.sbom;
  pVersion.signature = admission.signature;
  pVersion.channel = PluginChannel.STABLE;

  orm.em.persist(pVersion);
  await orm.em.flush();

  return { status: 'success', message: `Plugin ${body.name} v${body.version} registered.`, id: plugin.id };
});

server.get('/plugins/:name', async (request, reply) => {
  const { name } = request.params as { name: string };
  const plugin = await orm.em.findOne(Plugin, { name }, { populate: ['versions'] });
  if (!plugin) {
    return reply.status(404).send({ error: 'Plugin not found' });
  }
  return plugin;
});

server.post('/plugins/:name/revoke', async (request, reply) => {
  try {
    authorize(request);
  } catch (error: any) {
    return reply.status(error.statusCode || 401).send({ error: error.message });
  }

  const { name } = request.params as { name: string };
  const plugin = await orm.em.findOne(Plugin, { name });

  if (!plugin) {
    return reply.status(404).send({ error: 'Plugin not found' });
  }

  plugin.status = PluginStatus.REVOKED;
  await orm.em.flush();

  return { status: 'revoked', plugin: name };
});

server.post('/execute', async (request, reply) => {
  try {
    authorize(request);
  } catch (error: any) {
    return reply.status(error.statusCode || 401).send({ error: error.message });
  }

  const body = request.body as { code?: string; pluginName?: string; version?: string };
  let codeToRun = body.code;
  let signature: string | undefined;

  if (body.pluginName) {
    const plugin = await orm.em.findOne(Plugin, { name: body.pluginName }, { populate: ['versions'] });
    if (!plugin) {
      return reply.status(404).send({ error: `Plugin ${body.pluginName} not found` });
    }

    if (plugin.status === PluginStatus.REVOKED) {
        return reply.status(403).send({ error: 'Plugin is revoked' });
    }

    const v = body.version
        ? plugin.versions.getItems().find(iv => iv.version === body.version)
        : plugin.versions.getItems().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (!v) {
        return reply.status(404).send({ error: 'Version not found' });
    }
    codeToRun = v.code;
    signature = v.signature;
  }

  if (!codeToRun) {
    return reply.status(400).send({ error: 'Code or valid pluginName is required' });
  }

  // Mandatory re-validation if code is passed directly (Level 5)
  if (body.code) {
      const admission = await admissionService.validatePlugin({
        name: 'ephemeral',
        code: codeToRun,
        sbom: { bomFormat: 'CycloneDX', specVersion: '1.4', components: [] }
      });
      if (admission.status === 'rejected') {
        return reply.status(403).send({ error: 'Direct code rejected by admission policy' });
      }
      signature = admission.signature;
  }

  // Capability Consent Enforcement (Level 5)
  const tenantContext = (request as any).tenantContext;
  const tenantId = tenantContext?.tenantId;
  if (!tenantId) {
    return reply.status(401).send({ error: 'Valid signed tenant context is required for execution' });
  }

  let authorizedCapabilities: string[] = [];
  if (body.pluginName) {
      const plugin = await orm.em.findOne(Plugin, { name: body.pluginName }, { populate: ['versions'] });
      const version = body.version
        ? plugin!.versions.getItems().find(v => v.version === body.version)
        : plugin!.versions.getItems().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

      if (version?.capabilities && version.capabilities.length > 0) {
          const consent = await orm.em.findOne(TenantConsent, { tenantId, plugin: plugin! });
          const granted = consent?.grantedCapabilities || [];
          const missing = version.capabilities.filter(cap => !granted.includes(cap));

          if (missing.length > 0) {
              return reply.status(403).send({
                  error: 'Tenant consent missing for required capabilities',
                  missingCapabilities: missing
              });
          }
          authorizedCapabilities = granted;
      }
  }

  const result = await sandbox.run(codeToRun, signature, undefined, authorizedCapabilities);

  // Metering Implementation (Level 5)
  const meteringId = await new MeteringService(orm.em as any).recordExecution({
    tenantId,
    pluginId: body.pluginName || 'ephemeral',
    version: body.version || '0.0.0-direct',
    executionTimeMs: result.executionTimeMs || 0,
    memoryBytes: result.metrics?.memoryBytes || 0,
    egressCount: result.metrics?.egressCount || 0,
    success: result.success
  });

  if (!result.success) {
    return reply.send({
      status: 'execution_failed',
      logs: result.logs,
      error: result.error,
      executionTimeMs: result.executionTimeMs,
      meteringId
    });
  }

  return reply.send({
    status: 'success',
    logs: result.logs,
    executionTimeMs: result.executionTimeMs,
    meteringId
  });
});

server.get('/billing/reconciliation/:tenantId', async (request, reply) => {
    try {
        authorize(request);
    } catch (error: any) {
        return reply.status(error.statusCode || 401).send({ error: error.message });
    }

    const { tenantId } = request.params as { tenantId: string };
    const contextTenantId = (request as any).tenantContext?.tenantId;
    if (!contextTenantId || contextTenantId !== tenantId) {
      return reply.status(403).send({ error: 'Tenant context does not match requested reconciliation tenant.' });
    }

    const billingService = new BillingService(orm.em as any);

    const report = await billingService.generateReconciliationReport(
        tenantId,
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        new Date()
    );

    return report;
});

server.get('/health', async () => {
  return {
    status: 'ok',
    version: '1.5.0-hardened',
    sandboxMode,
    admissionMode,
    marketplaceRegion,
  };
});

const start = async () => {
  try {
    orm = await MikroORM.init(ormConfig);
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await server.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
