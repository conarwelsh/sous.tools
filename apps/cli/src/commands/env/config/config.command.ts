import { logger } from '@sous/logger';
import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { getConfig } from '@sous/config';
import { ConfigAddCommand } from './config-add.command.js';

interface ConfigOptions {
  env?: string;
}

@SubCommand({ 
  name: 'config', 
  description: 'Manage platform configuration',
  subCommands: [ConfigAddCommand]
})
export class ConfigCommand extends CommandRunner {
  async run(
    passedParam: string[],
    options?: ConfigOptions,
  ): Promise<void> {
    const env = options?.env || 'development';
    logger.info(`🔍 Fetching configuration for environment: ${env}...`);

    try {
      const config = await getConfig(env);
      logger.info(JSON.stringify(config, null, 2));
    } catch (error) {
      logger.error(error, `❌ Failed to fetch configuration for ${env}`);
    }
  }

  @Option({
    flags: '-e, --env <env>',
    description: 'Environment to fetch config for (development, staging, production)',
  })
  parseEnv(val: string): string {
    return val;
  }
}