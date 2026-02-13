import chalk from 'chalk';
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module.js';
import { configPromise, config } from '@sous/config';

// ASCII art for "SOUS.TOOLS"
const BANNER = `
   ${chalk.blue(' _____ ____  __  __ _____      _______ ____  ____  _      _____')}
   ${chalk.blue('  / ___// __ \\/ / / / ___/     /_  __// __ \\/ __ \\/ /     / ___/')}
   ${chalk.blue('  \\__ \\/ / / / / / /\\__ \\       / /  / / / / / / / /      \\__ \\ ')}
   ${chalk.white(' ___/ / /_/ / /_/ /___/ /  _   / /  / /_/ / /_/ / /___   ___/ / ')}
   ${chalk.white('/____/\\____/\\____//____/  (_) /_/   \\____/\\____/_____/  /____/  ')}
`;

async function bootstrap() {
  await configPromise;

  // Print Banner
  // Note: The textual line below prints "SOUS.TOOLS" metadata.
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

  // Suppress React 19 / Ink deprecation warnings by silencing console.error for specific patterns
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('deprecation')) return;
    originalError(...args);
  };

  // Filter out '--' from process.argv which can be injected by pnpm
  process.argv = process.argv.filter((arg) => arg !== '--');

  // Use 'error' level only to suppress the [Nest] startup logs for a cleaner TUI
  await CommandFactory.run(AppModule, {
    logger: ['error'],
  });
  process.exit(0);
}

bootstrap();
