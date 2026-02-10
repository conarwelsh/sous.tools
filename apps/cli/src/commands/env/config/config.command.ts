import { logger } from '@sous/logger';
import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { ConfigAddCommand } from './config-add.command.js';
import { ConfigListCommand } from './config-list.command.js';

interface ConfigOptions {
  env?: string;
}

@SubCommand({
  name: 'config',
  description: 'Manage platform configuration',
  subCommands: [ConfigAddCommand, ConfigListCommand],
})
export class ConfigCommand extends CommandRunner {
  async run(passedParam: string[], options?: ConfigOptions): Promise<void> {
    if (passedParam.length > 0 && ['add', 'list'].includes(passedParam[0])) {
      return;
    }

    const env = options?.env || 'development';
    logger.info(`🔍 Fetching configuration for environment: ${env}...`);

    try {
      const { secrets } = await import('@sous/config');

      if (!secrets) {
        throw new Error(
          'Secret manager is only available in server environments',
        );
      }

      const remoteConfig = await secrets.listSecrets(env);
      logger.info(JSON.stringify(remoteConfig, null, 2));
    } catch (error: any) {
      logger.error(
        `❌ Failed to fetch configuration for ${env}: ${error.message}`,
      );
    }
  }

  @Option({
    flags: '-e, --env <env>',
    description:
      'Environment to fetch config for (development, staging, production)',
  })
  parseEnv(val: string): string {
    return val;
  }
}