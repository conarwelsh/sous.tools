import { logger } from '@sous/logger';
import { SubCommand, CommandRunner, Option } from 'nest-commander';
import * as process from 'process';

interface ConfigAddOptions {
  env?: string[];
  key: string;
  value: string;
}

@SubCommand({
  name: 'add',
  description: 'Add or update a configuration variable via Infisical',
})
export class ConfigAddCommand extends CommandRunner {
  async run(passedParam: string[], options: ConfigAddOptions): Promise<void> {
    const { key, value, env: envs } = options;

    if (!key || !value) {
      logger.error('❌ Error: --key and --value are required');
      process.exit(1);
    }

    try {
      const { secrets } = await import('@sous/config');

      if (!secrets) {
        throw new Error(
          'Secret manager is only available in server environments',
        );
      }

      const targetEnvs = envs && envs.length > 0 ? envs : ['development'];

      for (const env of targetEnvs) {
        logger.info(`🚀 Upserting ${key} to ${env}...`);
        await secrets.upsertSecret(key, value, env);
      }
    } catch (error: any) {
      logger.error(`❌ Failed to add configuration: ${error.message}`);
      process.exit(1);
    }

    // Force exit to prevent hanging
    process.exit(0);
  }

  @Option({
    flags: '-e, --env [env...]',
    description:
      'Environments to add the variable to (development, staging, production)',
  })
  parseEnv(val: string, memo: string[] = []): string[] {
    memo.push(val);
    return memo;
  }

  @Option({
    flags: '-k, --key <key>',
    description: 'Configuration key',
    required: true,
  })
  parseKey(val: string): string {
    return val;
  }

  @Option({
    flags: '-v, --value <value>',
    description: 'Configuration value',
    required: true,
  })
  parseValue(val: string): string {
    return val;
  }
}
