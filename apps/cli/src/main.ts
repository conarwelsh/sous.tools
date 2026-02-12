import chalk from 'chalk';
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module.js';
import { configPromise, config } from '@sous/config';

// ASCII art for "SOUS LIKE" and "RESTAURANT MANAGEMENT OS" based on the provided screenshot style.
const BANNER = `
   ${chalk.blue('/-----/  -----  | |----|  /-----/')}     ${chalk.cyan('/-----/  -------  | |----|  -------')}
   ${chalk.blue('| |----| |     | | |----|  | |----|')}     ${chalk.cyan('| |----| |     | | |----| |     |')}
   ${chalk.blue('\\-----/  -------  \\-----/  \\-----/')}     ${chalk.cyan('\\-----/  -------  \\-----/  -------')}
   ${chalk.dim('                                                                  ')}
   ${chalk.dim('RESTAURANT MANAGEMENT OS                                           ')}
`;

async function bootstrap() {
  await configPromise;

  // Print Banner
  // Note: The textual line below currently prints "SOUS OS", which is not part of the new banner art.
  // If "SOUS LIKE" is intended as the primary title, this line might need adjustment or removal.
  // For now, keeping it as is to not alter unrelated parts unless requested.
  const envColor =
    config.env === 'production'
      ? chalk.red
      : config.env === 'staging'
        ? chalk.yellow
        : chalk.green;
  console.log(BANNER);
  console.log(
    `   ${chalk.bold('SOUS OS')} ${chalk.dim(`v${config.features.appVersion}`)} | ${chalk.bold('ENV:')} ${envColor(config.env.toUpperCase())}\n`,
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
