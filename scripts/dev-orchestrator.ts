import { localConfig } from '../packages/config/src/index';
import { spawn, execSync } from 'child_process';

const app = process.argv[2];

const appConfigs: Record<string, { port: number; command: string; cwd: string }> = {
  web: {
    port: localConfig.web.port,
    command: 'next dev',
    cwd: 'apps/web',
  },
  docs: {
    port: localConfig.docs.port,
    command: 'next dev',
    cwd: 'apps/docs',
  },
  api: {
    port: localConfig.api.port,
    command: 'nest start --watch',
    cwd: 'apps/api',
  },
  native: {
    port: localConfig.native.port,
    command: 'vite',
    cwd: 'apps/native',
  },
  signage: {
    port: localConfig.headless.port,
    command: 'vite',
    cwd: 'apps/signage',
  },
  kds: {
    port: localConfig.kds.port,
    command: 'vite',
    cwd: 'apps/native-kds',
  },
  pos: {
    port: localConfig.pos.port,
    command: 'vite',
    cwd: 'apps/native-pos',
  },
};

const config = appConfigs[app];

if (!config) {
  console.error(`Unknown app: ${app}`);
  process.exit(1);
}

// Find pnpm absolute path to be safe
let pnpmPath = 'pnpm';
try {
  pnpmPath = execSync('which pnpm').toString().trim();
} catch (e) {
  // Fallback to 'pnpm' if which fails
}

const [cmd, ...args] = config.command.split(' ');

// Use pnpm exec to ensure local binaries are found
const child = spawn(pnpmPath, ['exec', cmd, ...args], {
  stdio: 'inherit',
  cwd: config.cwd,
  env: {
    ...process.env,
    PORT: config.port.toString(),
  },
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error(`Failed to start child process: ${err.message}`);
  process.exit(1);
});
