import { logger } from '@sous/logger';
import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { spawn } from 'child_process';
import * as path from 'path';

interface E2EOptions {
  video?: boolean;
}

/**
 * Command to run End-to-End tests using Playwright.
 * Supports an optional video flag to record test sessions for marketing or debugging.
 */
@SubCommand({
  name: 'e2e',
  description: 'Run End-to-End tests with Playwright',
})
export class E2ECommand extends CommandRunner {
  /**
   * Executes the E2E test suite.
   * @param passedParam Additional parameters passed to the command
   * @param options Command options including video recording toggle
   */
  async run(
    passedParam: string[],
    options: E2EOptions,
  ): Promise<void> {
    const args = ['run', 'test:e2e'];
    
    const env = { 
      ...process.env,
      PLAYWRIGHT_VIDEO: options.video ? 'true' : undefined 
    };

    logger.info(`🚀 Running E2E tests ${options.video ? '(with video recording)' : ''}...`);
    logger.info(`> pnpm ${args.join(' ')}`);

    const rootDir = path.resolve(process.cwd(), '../../');

    const child = spawn('pnpm', args, {
      stdio: 'inherit',
      shell: true,
      cwd: rootDir,
      env
    });

    return new Promise((resolve, reject) => {
      child.on('exit', (code) => {
        if (code === 0) {
          logger.info('✅ E2E tests completed successfully.');
          resolve();
        } else {
          logger.error(`❌ E2E tests failed with code ${code}`);
          process.exit(code ?? 1);
        }
      });

      child.on('error', (err) => {
        logger.error(err);
        reject(err);
      });
    });
  }

  @Option({
    flags: '-v, --video',
    description: 'Enable video recording for the test session',
    defaultValue: false,
  })
  parseVideo(val: string): boolean {
    return true; // If flag is present, it's true
  }
}
