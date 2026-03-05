import { spawn } from 'child_process';
import { createWriteStream } from 'fs';

const log = createWriteStream('system_logs.txt');
const nx = spawn('npx', ['nx', 'run-many', '--target=serve', '--all', '--parallel', '--max-parallel=20'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: true
});

nx.stdout.pipe(log);
nx.stderr.pipe(log);

nx.unref();
console.log('Nx started with PID:', nx.pid);
process.exit(0);
