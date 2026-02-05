import { logger } from '@sous/logger';
import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { spawn } from 'child_process';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

@SubCommand({
  name: 'tail',
  description: 'Tail logs from the specified environment',
})
export class LogsTailCommand extends CommandRunner {
  async run(passedParam: string[], options: { env?: string }): Promise<void> {
    const env = options.env || 'development';

    if (env === 'development') {
      await this.tailLocalLogs();
    } else {
      logger.info(
        `⚠️  Tailing remote logs for '${env}' is not yet implemented.`,
      );
      logger.info('Please check your Better Stack dashboard.');
    }
  }

  private async tailLocalLogs() {
    const homeDir = os.homedir();
    const logFile = path.join(homeDir, '.sous', 'logs', 'combined.log');

    if (!fs.existsSync(logFile)) {
      logger.error(`❌ Log file not found at: ${logFile}`);
      logger.info('Run "sous dev" to generate logs.');
      return;
    }

    logger.info(`📄 Tailing local logs from ${logFile}...`);

    const tail = spawn('tail', ['-f', logFile], { stdio: 'inherit' });

    tail.on('error', (err) => {
      logger.error(err, 'Failed to start tail process');
    });

    // Handle clean exit
    process.on('SIGINT', () => {
      tail.kill();
      process.exit();
    });

    // Keep the process alive to wait for tail
    await new Promise(() => {});
  }

  @Option({
    flags: '-e, --env <env>',
    description: 'Environment to tail logs from (default: development)',
  })
  parseEnv(val: string): string {
    return val;
  }
}
