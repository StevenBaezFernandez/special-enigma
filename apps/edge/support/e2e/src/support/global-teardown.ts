import { killPort } from '@nx/node/utils';
export default async function () {
  // Put clean up logic here (e.g. stopping services, docker-compose, etc.).
  // Hint: `globalThis` is shared between setup and teardown.
  const port = process.env.PORT ? Number(process.env.PORT) : 3104;
  await killPort(port);
  console.log(globalThis.__TEARDOWN_MESSAGE__);
};
