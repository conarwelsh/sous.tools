import { logger } from '@sous/logger';
import { SubCommand, CommandRunner, Option } from 'nest-commander';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

@SubCommand({
  name: 'wipe',
  description: 'Wipe (clear) logs for the specified environment',
})
export class LogsWipeCommand extends CommandRunner {
  async run(passedParam: string[], options: { env?: string }): Promise<void> {
    const env = options.env || 'development';

    if (env === 'development') {
      await this.wipeLocalLogs();
    } else {
      logger.info(
        `⚠️  Wiping remote logs for '${env}' is not supported via CLI.`,
      );
      logger.info(
        'Please manage log retention in your Better Stack dashboard.',
      );
    }
  }

  private async wipeLocalLogs() {
    const homeDir = os.homedir();
    const logFile = path.join(homeDir, '.sous', 'logs', 'combined.log');

    if (!fs.existsSync(logFile)) {
      logger.info(`ℹ️  No log file found at: ${logFile}. Nothing to wipe.`);
      return;
    }

    try {
      // Truncate the file
      fs.writeFileSync(logFile, '');
      logger.info(`✅ Local logs wiped successfully (${logFile}).`);
    } catch (error) {
      logger.error(`❌ Failed to wipe logs: ${error.message}`);
    }
  }

  @Option({
    flags: '-e, --env <env>',
    description: 'Environment to wipe logs from (default: development)',
  })
  parseEnv(val: string): string {
    return val;
  }
}
