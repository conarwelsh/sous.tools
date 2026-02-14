import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { logger } from '@sous/logger';
import { SecretManager } from '@sous/config';
import { parseBootstrapEnv } from '@sous/config/server-utils';
import { spawn } from 'child_process';

interface EnvExecOptions {
  env: string;
}

@SubCommand({
  name: 'exec',
  description: 'Execute a command with secrets injected from Infisical',
})
export class EnvExecCommand extends CommandRunner {
  async run(passedParam: string[], options: EnvExecOptions): Promise<void> {
    const command = passedParam.join(' ');

    if (!command) {
      logger.error('No command provided to execute');
      process.exit(1);
    }

    const envName = options.env || process.env.NODE_ENV || 'development';
    logger.info(`🚀 Preparing environment for: ${envName}`);

    try {
      // 1. Parse .env for bootstrap credentials
      const bootstrap = parseBootstrapEnv();

      // 2. Initialize SecretManager with these credentials
      const secrets = new SecretManager({
        clientId: bootstrap.INFISICAL_CLIENT_ID,
        clientSecret: bootstrap.INFISICAL_CLIENT_SECRET,
        projectId: bootstrap.INFISICAL_PROJECT_ID,
      });

      // 3. Fetch all secrets for the target environment
      logger.info(`🔐 Fetching secrets from Infisical vault...`);
      const vaultSecrets = await secrets.listSecrets(envName);

      // 4. Merge into current environment
      const [cmd, ...args] = passedParam;
      const serviceName = cmd.includes('api')
        ? '@sous/api'
        : cmd.includes('web')
          ? '@sous/web'
          : '@sous/cli';

      const mergedEnv = {
        ...process.env,
        ...vaultSecrets,
        NODE_ENV: envName,
        SERVICE_NAME: serviceName,
        OTEL_SERVICE_NAME: serviceName,
        SOUS_ENV_INJECTED: 'true',
        // Also inject the bootstrap credentials just in case
        INFISICAL_CLIENT_ID: bootstrap.INFISICAL_CLIENT_ID,
        INFISICAL_CLIENT_SECRET: bootstrap.INFISICAL_CLIENT_SECRET,
        INFISICAL_PROJECT_ID: bootstrap.INFISICAL_PROJECT_ID,
      };

      logger.info(`⚡️ Executing: ${command}`);

      // 5. Spawn the process
      const { findProjectRootSync } = await import('@sous/config/server-utils');
      const rootDir = findProjectRootSync();

      const child = spawn(cmd, args, {
        stdio: 'inherit',
        env: mergedEnv,
        shell: true,
        cwd: rootDir,
      });

      return new Promise((resolve, reject) => {
        child.on('exit', (code) => {
          if (code === 0) {
            resolve();
          } else {
            process.exit(code || 1);
          }
        });
        child.on('error', (err) => {
          logger.error(`❌ Failed to spawn process: ${err.message}`);
          reject(err);
        });
      });
    } catch (error: any) {
      logger.error(`❌ Failed to execute command: ${error.message}`);
      process.exit(1);
    }
  }

  @Option({
    flags: '-e, --env <string>',
    description: 'Target environment (development, staging, production)',
  })
  parseEnv(val: string): string {
    return val;
  }
}
