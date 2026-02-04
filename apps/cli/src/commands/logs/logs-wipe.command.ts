import { SubCommand, CommandRunner, Option } from 'nest-commander';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

@SubCommand({
  name: 'wipe',
  description: 'Wipe (clear) logs for the specified environment',
})
export class LogsWipeCommand extends CommandRunner {
  async run(
    passedParam: string[],
    options: { env?: string },
  ): Promise<void> {
    const env = options.env || 'development';

    if (env === 'development') {
      await this.wipeLocalLogs();
    } else {
      console.log(`⚠️  Wiping remote logs for '${env}' is not supported via CLI.`);
      console.log('Please manage log retention in your Better Stack dashboard.');
    }
  }

  private async wipeLocalLogs() {
    const homeDir = os.homedir();
    const logFile = path.join(homeDir, '.sous', 'logs', 'combined.log');

    if (!fs.existsSync(logFile)) {
      console.log(`ℹ️  No log file found at: ${logFile}. Nothing to wipe.`);
      return;
    }

    try {
      // Truncate the file
      fs.writeFileSync(logFile, '');
      console.log(`✅ Local logs wiped successfully (${logFile}).`);
    } catch (error) {
      console.error(`❌ Failed to wipe logs: ${error.message}`);
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
