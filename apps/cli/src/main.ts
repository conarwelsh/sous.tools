import chalk from 'chalk';
import { CommandFactory } from 'nest-commander';
import { loadInfisicalEnv } from './load-env.js';

// Silence HyperDX and Observability logs early unless explicitly requested
const isHyperDxDebug = process.env.DEBUG_HYPERDX === 'true';

if (!isHyperDxDebug) {
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;

  const filter = (orig: Function) => (...args: any[]) => {
    const msg = args[0];
    if (typeof msg === 'string' && (msg.includes('[⚡HyperDX]') || msg.includes('Observability initialized'))) {
      return;
    }
    orig(...args);
  };

  console.log = filter(originalLog);
  console.info = filter(originalInfo);
  console.warn = filter(originalWarn);
  console.error = (msg, ...args) => {
    if (typeof msg === 'string' && (msg.includes('[⚡HyperDX]') || msg.includes('deprecation'))) {
      return;
    }
    originalError(msg, ...args);
  };

  // Also hook into stdout/stderr for any direct writes
  const filterWrite = (orig: any) =>
    function (this: any, chunk: any) {
      if (typeof chunk === 'string' && chunk.includes('[⚡HyperDX]')) {
        return true;
      }
      return orig.apply(this, arguments);
    };

  if (process.stdout.write) process.stdout.write = filterWrite(process.stdout.write);
  if (process.stderr.write) process.stderr.write = filterWrite(process.stderr.write);
}

async function bootstrap() {
  // 1. Load secrets before anything else
  await loadInfisicalEnv();

  // 2. Now import config, logger, and AppModule after secrets are in process.env
  const { config } = await import('@sous/config');
  const { initObservability } = await import('@sous/logger');
  const { AppModule } = await import('./app.module.js');

  // Initialize observability
  await initObservability(config);

  // ASCII art for "SOUS.TOOLS"
  const BANNER = `
   ${chalk.blue(' _____ ____  __  __ _____      _______ ____  ____  _      _____')}
   ${chalk.blue('  / ___// __ \\/ / / / ___/     /_  __// __ \\/ __ \\/ /     / ___/')}
   ${chalk.blue('  \\__ \\/ / / / / / /\\__ \\       / /  / / / / / / / /      \\__ \\ ')}
   ${chalk.white(' ___/ / /_/ / /_/ /___/ /  _   / /  / /_/ / /_/ / /___   ___/ / ')}
   ${chalk.white('/____/\\____/\\____//____/  (_) /_/   \\____/\\____/_____/  /____/  ')}
`;

  // Print Banner
  const envColor =
    config.env === 'production'
      ? chalk.red
      : config.env === 'staging'
        ? chalk.yellow
        : chalk.green;
  console.log(BANNER);
  console.log(
    `   ${chalk.bold('SOUS.TOOLS')} ${chalk.dim(`v${config.features.appVersion}`)} | ${chalk.bold('ENV:')} ${envColor(config.env.toUpperCase())}\n`,
  );

  // Use 'error' level only to suppress the [Nest] startup logs for a cleaner TUI
  await CommandFactory.run(AppModule, {
    logger: ['error'],
  });
  process.exit(0);
}

bootstrap();
