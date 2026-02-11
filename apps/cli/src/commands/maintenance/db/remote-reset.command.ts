import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { execSync } from 'child_process';
import { logger } from '@sous/logger';
import * as readline from 'readline';

interface RemoteResetOptions {
  env?: string;
  force?: boolean;
}

@SubCommand({
  name: 'remote-reset',
  description: 'Wipe and reset a REMOTE database (Staging/Production)',
})
export class RemoteResetCommand extends CommandRunner {
  async run(inputs: string[], options?: RemoteResetOptions): Promise<void> {
    const env = options?.env;

    if (!env || (env !== 'staging' && env !== 'production')) {
      logger.error('❌ You must specify an environment: --env=staging or --env=production');
      return;
    }

    if (!options?.force) {
      logger.warn(`⚠️  DANGER: You are about to COMPLETELY WIPE the [${env.toUpperCase()}] database.`);
      logger.warn('This will DROP the public schema and delete ALL DATA.');
      logger.warn('This action cannot be undone.');

      const confirmed = await this.confirm(`Type "${env}" to confirm: `);

      if (confirmed !== env) {
        logger.error('❌ Confirmation failed. Aborting.');
        return;
      }
    }

    logger.info(`🔥 Starting reset sequence for [${env}]...`);

    const projectId = process.env.INFISICAL_PROJECT_ID;
    if (!projectId) {
      logger.warn('⚠️ INFISICAL_PROJECT_ID not found in environment. Infisical might fail if not initialized.');
    }

    // Map 'production' to 'prod' for Infisical CLI
    const infisicalEnv = env === 'production' ? 'prod' : env;

    const runCommand = (cmd: string) => {
      logger.info(`  └─ Running: ${cmd}`);
      try {
        const projectFlag = projectId ? `--projectId=${projectId}` : '';
        execSync(`infisical run ${projectFlag} --env=${infisicalEnv} -- ${cmd}`, { stdio: 'inherit' });
      } catch (e: any) {
        logger.error(`❌ Command failed: ${cmd}`);
        throw e;
      }
    };

    try {
      logger.info('  1. Wiping database (Dropping public schema)...');
      // Running from apps/cli, so scripts are two levels up
      runCommand('tsx ../../scripts/remote-wipe.ts');

      logger.info('  2. Pushing schema (Drizzle)...');
      runCommand('pnpm --filter @sous/api run db:push');

      logger.info('  3. Seeding database...');
      runCommand('pnpm --filter @sous/api run db:seed');

      logger.info(`✅ [${env}] Database reset and seeded successfully.`);
    } catch (error: any) {
      logger.error(`❌ Remote reset failed.`);
      process.exit(1);
    }
  }

  private confirm(question: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  @Option({
    flags: '-e, --env <env>',
    description: 'Target environment (staging or production)',
  })
  parseEnv(env: string): string {
    return env;
  }

  @Option({
    flags: '-f, --force',
    description: 'Skip confirmation',
  })
  parseForce(): boolean {
    return true;
  }
}
