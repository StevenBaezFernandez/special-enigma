import Fastify from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import { SandboxService } from './sandbox.service';
import { PluginAdmissionService } from './services/plugin-admission.service';

const server = Fastify({ logger: true });
const sandbox = new SandboxService();
const admissionService = new PluginAdmissionService();

const PLUGINS_FILE = path.join(__dirname, 'plugins.json');
let plugins = new Map<string, any>();

// Load plugins on startup
if (fs.existsSync(PLUGINS_FILE)) {
  try {
    const data = JSON.parse(fs.readFileSync(PLUGINS_FILE, 'utf-8'));
    plugins = new Map(Object.entries(data));
    console.log(`Loaded ${plugins.size} plugins from storage.`);
  } catch (e) {
    console.error('Failed to load plugins from storage', e);
  }
}

function savePlugins() {
  try {
    fs.writeFileSync(PLUGINS_FILE, JSON.stringify(Object.fromEntries(plugins), null, 2));
  } catch (e) {
    console.error('Failed to save plugins', e);
  }
}

// Plugin Registry Endpoints
server.get('/plugins', async () => {
  return Array.from(plugins.values()).map(p => ({
    name: p.name,
    version: p.version,
    description: p.description,
    author: p.author
  }));
});

server.post('/plugins', async (request, reply) => {
  const body = request.body as { name: string; version: string; code: string; description?: string; author?: string };

  if (!body.name || !body.code || !body.version) {
    return reply.status(400).send({ error: 'Name, version, and code are required' });
  }

  if (plugins.has(body.name)) {
     // Version check logic could go here
     // For now, overwrite (update)
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

// Execute Plugin (Direct or by Name)
server.post('/execute', async (request, reply) => {
  const body = request.body as { code?: string; pluginName?: string; name?: string; dependencies?: Record<string, string> };
  let codeToRun = body.code;
  let pluginName = body.name || 'anonymous-plugin';

  // If code is not provided, try to load by pluginName
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

  // 1. Admission Control
  const pluginPackage = {
    name: pluginName,
    code: codeToRun,
    dependencies: body.dependencies
  };

  const admission = await admissionService.validatePlugin(pluginPackage);

  if (admission.status === 'rejected') {
    return reply.status(403).send({
      error: 'Plugin rejected by admission policy',
      reason: admission.reason,
      details: admission.details,
      riskScore: admission.riskScore
    });
  }

  // 2. Execution in Sandbox
  const result = await sandbox.run(codeToRun);

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

// Health Check
server.get('/health', async () => {
  return { status: 'ok', version: '1.0.0' };
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Plugin Host Service listening on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
