import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { logger } from '@sous/logger';
import { spawn } from 'child_process';

interface ExportOptions {
  env: string;
}

@SubCommand({
  name: 'export',
  description: 'Export environment variables from Infisical and run a command',
})
export class EnvExportCommand extends CommandRunner {
  async run(passedParam: string[], options?: ExportOptions): Promise<void> {
    const env = options?.env || 'dev';
    const projectId = 'd1c836b9-17fe-49ed-bf45-2966cf2591d2';

    if (passedParam.length === 0) {
      logger.error(
        '❌ Please provide a command to run (e.g., sous env export -- pnpm build)',
      );
      return;
    }

    const command = passedParam[0];
    const args = passedParam.slice(1);

    logger.info(`🔐 Fetching secrets for environment: ${env}...`);

    // We use 'infisical run' as it's the standard way to inject env vars into a sub-process
    const infisicalArgs = [
      'run',
      '--env',
      env,
      '--projectId',
      projectId,
      '--',
      command,
      ...args,
    ];

    const child = spawn('infisical', infisicalArgs, {
      stdio: 'inherit',
      shell: true,
    });

    child.on('exit', (code) => {
      if (code !== 0) {
        process.exit(code || 1);
      }
    });
  }

  @Option({
    flags: '-e, --env [env]',
    description: 'Infisical environment (dev, staging, prod)',
    defaultValue: 'dev',
  })
  parseEnv(val: string): string {
    return val;
  }
}
