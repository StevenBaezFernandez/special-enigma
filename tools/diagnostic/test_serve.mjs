import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Step 1: npm install
console.log("Running npm install...");
try {
    execSync('npm install --ignore-scripts --legacy-peer-deps', { stdio: 'inherit' });
} catch (e) {
    console.error("npm install failed, continuing anyway...");
}

// Step 2: Get projects
console.log("Fetching projects...");
const projectsOutput = execSync('./node_modules/.bin/nx show projects').toString();
const projects = projectsOutput.split('\n').map(p => p.trim()).filter(p => p && (p.startsWith('api-') || p.startsWith('web-') || p.startsWith('mobile-') || p.startsWith('desktop-') || p.startsWith('worker-')) && !p.endsWith('-e2e'));

console.log("Identified projects: " + projects.join(', '));

const results = [];
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

async function testProject(project) {
  console.log("Testing project: " + project);
  const logFile = path.join(logsDir, project + ".log");

  return new Promise((resolve) => {
    const child = exec("./node_modules/.bin/nx serve " + project);

    let output = '';
    child.stdout.on('data', (data) => {
      output += data;
    });
    child.stderr.on('data', (data) => {
      output += data;
    });

    const timeout = setTimeout(() => {
      console.log("Timeout reached for " + project);
      child.kill('SIGTERM');
    }, 45000);

    child.on('exit', (code) => {
      console.log("Project " + project + " exited with code " + code);
      clearTimeout(timeout);
      fs.writeFileSync(logFile, output);

      const lowerOutput = output.toLowerCase();
      const isError = lowerOutput.includes('error') || lowerOutput.includes('failed') || lowerOutput.includes('exception');
      const isSuccess = (output.includes('Listening on') || output.includes('Local:') || output.includes('ready in') || output.includes('successfully') || output.includes('VITE v')) && !isError;

      results.push({
        project,
        status: isSuccess ? 'Success' : (isError ? 'Error' : 'Timeout/Unknown'),
        logFile: "logs/" + project + ".log"
      });
      fs.writeFileSync('results.json', JSON.stringify(results, null, 2));
      resolve();
    });
  });
}

async function runAll() {
  for (const project of projects) {
    await testProject(project);
  }
  console.log('All tests completed.');
}

runAll();
