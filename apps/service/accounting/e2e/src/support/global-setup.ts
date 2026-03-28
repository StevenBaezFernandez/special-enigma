import { waitForPortOpen } from '@nx/node/utils';

export default async function() {
  // Start services that that the app needs to run (e.g. database, docker-compose, etc.).
  console.log('\nSetting up...\n');

  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ? Number(process.env.PORT) : 9239;

  try {
    console.log(`Waiting for port ${port} on ${host}...`);
    await waitForPortOpen(port, { host, timeout: 5000 });
  } catch (error) {
    console.warn(`Could not connect to port ${port} on ${host}. This might cause E2E tests to fail if the service is not running independently.`);
  }

  // Hint: Use `globalThis` to pass variables to global teardown.
  globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
};
