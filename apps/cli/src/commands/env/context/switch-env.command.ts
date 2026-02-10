import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { logger } from '@sous/logger';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import chalk from 'chalk';

interface SwitchOptions {
  env: string;
}

@SubCommand({
  name: 'switch-env',
  description: 'Switch the active environment context (dev, staging, production)',
})
export class SwitchEnvCommand extends CommandRunner {
  async run(passedParam: string[], options?: SwitchOptions): Promise<void> {
    const env = passedParam[0] || options?.env;
    
    if (!env || !['dev', 'staging', 'production', 'development'].includes(env)) {
      logger.error('❌ Please specify a valid environment: dev, staging, or production');
      return;
    }

    const normalizedEnv = env === 'dev' ? 'development' : env;
    const homeDir = os.homedir();
    const sousDir = path.join(homeDir, '.sous');
    const contextPath = path.join(sousDir, 'context.json');

    if (!fs.existsSync(sousDir)) {
      fs.mkdirSync(sousDir, { recursive: true });
    }

    const context = fs.existsSync(contextPath) 
      ? JSON.parse(fs.readFileSync(contextPath, 'utf-8'))
      : {};

    context.env = normalizedEnv;
    fs.writeFileSync(contextPath, JSON.stringify(context, null, 2));

    logger.info(`✅ Environment context switched to: ${chalk.bold(normalizedEnv.toUpperCase())}`);
    logger.info('👉 Note: You may need to restart long-running processes for changes to take effect.');
  }

  @Option({
    flags: '-e, --env [env]',
    description: 'Target environment',
  })
  parseEnv(val: string): string {
    return val;
  }
}
