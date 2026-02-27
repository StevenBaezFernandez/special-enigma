import Fastify, { FastifyRequest } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import { SandboxService } from './sandbox.service';
import { PluginAdmissionService } from './services/plugin-admission.service';

const nodeEnv = process.env.NODE_ENV ?? 'development';
const authToken = process.env.PLUGIN_HOST_API_TOKEN;
const registryPath = process.env.PLUGIN_REGISTRY_FILE ?? path.join(__dirname, 'plugins.json');

if (nodeEnv === 'production' && !authToken) {
  throw new Error('PLUGIN_HOST_API_TOKEN is required in production.');
}

if (nodeEnv === 'production' && registryPath.endsWith('plugins.json')) {
  throw new Error('Default plugins.json registry storage is blocked in production. Configure PLUGIN_REGISTRY_FILE to durable storage.');
}

const server = Fastify({ logger: true });
const sandbox = new SandboxService();
const admissionService = new PluginAdmissionService();

let plugins = new Map<string, any>();

if (fs.existsSync(registryPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
    plugins = new Map(Object.entries(data));
  } catch (e) {
    server.log.error(e, 'Failed to load plugins from storage');
  }
}

function savePlugins() {
  try {
    fs.mkdirSync(path.dirname(registryPath), { recursive: true });
    fs.writeFileSync(registryPath, JSON.stringify(Object.fromEntries(plugins), null, 2));
  } catch (e) {
    server.log.error(e, 'Failed to save plugins');
    throw e;
  }
}

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
  return Array.from(plugins.values()).map((plugin) => ({
    name: plugin.name,
    version: plugin.version,
    description: plugin.description,
    author: plugin.author
  }));
});

server.post('/plugins', async (request, reply) => {
  try {
    authorize(request);
  } catch (error: any) {
    return reply.status(error.statusCode || 401).send({ error: error.message });
  }

  const body = request.body as { name: string; version: string; code: string; description?: string; author?: string };

  if (!body.name || !body.code || !body.version) {
    return reply.status(400).send({ error: 'Name, version, and code are required' });
  }

  plugins.set(body.name, body);
  savePlugins();

  return { status: 'success', message: `Plugin ${body.name} v${body.version} registered.` };
});

server.get('/plugins/:name', async (request, reply) => {
  const { name } = request.params as { name: string };
  const plugin = plugins.get(name);
  if (!plugin) {
    return reply.status(404).send({ error: 'Plugin not found' });
  }
  return plugin;
});

server.post('/execute', async (request, reply) => {
  try {
    authorize(request);
  } catch (error: any) {
    return reply.status(error.statusCode || 401).send({ error: error.message });
  }

  const body = request.body as { code?: string; pluginName?: string; name?: string; dependencies?: Record<string, string> };
  let codeToRun = body.code;
  let pluginName = body.name || 'anonymous-plugin';

  if (!codeToRun && body.pluginName) {
    const plugin = plugins.get(body.pluginName);
    if (!plugin) {
      return reply.status(404).send({ error: `Plugin ${body.pluginName} not found` });
    }
    codeToRun = plugin.code;
    pluginName = plugin.name;
  }

  if (!codeToRun) {
    return reply.status(400).send({ error: 'Code or valid pluginName is required' });
  }

  const admission = await admissionService.validatePlugin({
    name: pluginName,
    code: codeToRun,
    dependencies: body.dependencies
  });

  if (admission.status === 'rejected') {
    return reply.status(403).send({
      error: 'Plugin rejected by admission policy',
      reason: admission.reason,
      details: admission.details,
      riskScore: admission.riskScore
    });
  }

  const result = await sandbox.run(codeToRun, admission.signature);

  if (!result.success) {
    return reply.send({
      status: 'execution_failed',
      logs: result.logs,
      error: result.error,
      executionTimeMs: result.executionTimeMs
    });
  }

  return reply.send({
    status: 'success',
    logs: result.logs,
    executionTimeMs: result.executionTimeMs
  });
});

server.get('/health', async () => {
  return { status: 'ok', version: '1.1.0', registryPath };
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await server.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
