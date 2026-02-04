import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { InfisicalSDK } from '@infisical/sdk';
import * as process from 'process';

interface ConfigAddOptions {
  env?: string[];
  key: string;
  value: string;
}

@SubCommand({ 
  name: 'add', 
  description: 'Add or update a configuration variable via Infisical' 
})
export class ConfigAddCommand extends CommandRunner {
  async run(
    passedParam: string[],
    options: ConfigAddOptions,
  ): Promise<void> {
    const { key, value, env: envs } = options;

    if (!key || !value) {
      console.error('❌ Error: --key and --value are required');
      process.exit(1);
    }

    const clientId = process.env.INFISICAL_CLIENT_ID;
    const clientSecret = process.env.INFISICAL_CLIENT_SECRET;
    const projectId = process.env.INFISICAL_PROJECT_ID;

    if (!clientId || !clientSecret || !projectId) {
      console.error('❌ Error: Missing Infisical credentials (INFISICAL_CLIENT_ID, INFISICAL_CLIENT_SECRET, INFISICAL_PROJECT_ID)');
      process.exit(1);
    }

    const client = new InfisicalSDK();
    await client.auth().universalAuth.login({
      clientId,
      clientSecret,
    });

    const targetEnvs = envs && envs.length > 0 ? envs : ['development'];

    for (const env of targetEnvs) {
      const infisicalEnv = env === 'development' ? 'dev' : env === 'staging' ? 'staging' : 'prod';
      console.log(`🚀 Upserting ${key} to ${env} (${infisicalEnv})...`);
      
      try {
        // Try to get secret first
        try {
          await client.secrets().getSecret({
            environment: infisicalEnv,
            projectId,
            secretName: key,
          });
          // If found, update
          await client.secrets().updateSecret(key, {
            environment: infisicalEnv,
            projectId,
            secretValue: value,
            secretPath: '/',
            type: 'shared' as any, // Cast to any or import SecretType if strictly checked
          });
          console.log(`✅ Updated ${key} in ${env}`);
        } catch (e) {
          // If not found (assuming error means not found), create
          await client.secrets().createSecret(key, {
            environment: infisicalEnv,
            projectId,
            secretValue: value,
            secretPath: '/',
            type: 'shared' as any,
          });
          console.log(`✅ Created ${key} in ${env}`);
        }
      } catch (error) {
        console.error(`❌ Failed for ${env}:`, error instanceof Error ? error.message : error);
      }
    }
  }

  @Option({
    flags: '-e, --env [env...]',
    description: 'Environments to add the variable to (development, staging, production)',
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
