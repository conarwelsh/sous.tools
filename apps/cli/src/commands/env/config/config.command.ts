import { logger } from '@sous/logger';
import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { ConfigAddCommand } from './config-add.command.js';
import { InfisicalSDK } from '@infisical/sdk';
import * as path from 'path';
import * as fs from 'fs';

interface ConfigOptions {
  env?: string;
}

@SubCommand({
  name: 'config',
  description: 'Manage platform configuration',
  subCommands: [ConfigAddCommand],
})
export class ConfigCommand extends CommandRunner {
  async run(passedParam: string[], options?: ConfigOptions): Promise<void> {
    const env = options?.env || 'development';
    logger.info(`🔍 Fetching configuration for environment: ${env}...`);

    try {
      const { server: config } = await import('@sous/config');
      const clientId = process.env.INFISICAL_CLIENT_ID;
      const clientSecret = process.env.INFISICAL_CLIENT_SECRET;
      const projectId = process.env.INFISICAL_PROJECT_ID;

      if (!clientId || !clientSecret || !projectId) {
        throw new Error(
          'Missing Infisical bootstrap credentials in @sous/config or .env',
        );
      }

      const { InfisicalSDK } = await import('@infisical/sdk');
      const client = new InfisicalSDK();
      await client.auth().universalAuth.login({ clientId, clientSecret });

      const infisicalEnv =
        env === 'development' ? 'dev' : env === 'staging' ? 'staging' : 'prod';

      const secrets = await client.secrets().listSecrets({
        environment: infisicalEnv,
        projectId,
      });

      const remoteConfig = secrets.secrets.reduce(
        (acc: Record<string, string>, s: any) => {
          acc[s.secretKey] = s.secretValue;
          return acc;
        },
        {},
      );

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
