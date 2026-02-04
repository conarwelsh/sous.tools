import { logger } from '@sous/logger';
import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { spawn } from 'child_process';
import * as path from 'path';

@SubCommand({
  name: 'check',
  description: 'Run comprehensive health check (lint, typecheck, test, build)',
})
export class CheckCommand extends CommandRunner {
  async run(passedParam: string[], options: { filter?: string }): Promise<void> {
    const args = ['run', 'lint', 'typecheck', 'test', 'build'];

    if (options.filter) {
      args.push('--filter', options.filter);
    }

    logger.info(`> turbo ${args.join(' ')}`);

    // Execute from the root of the monorepo (2 levels up from apps/cli)
    // process.cwd() is apps/cli when running via "pnpm sous"
    const rootDir = path.resolve(process.cwd(), '../../');

    const child = spawn('turbo', args, { 
      stdio: 'inherit', 
      shell: true,
      cwd: rootDir
    });

    return new Promise((resolve, reject) => {
      child.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
           // Don't reject, just exit process with code to avoid stack trace spam
           process.exit(code ?? 1);
        }
      });
      
      child.on('error', (err) => {
        logger.error(err);
        reject(err);
      });
    });
  }

  @Option({
    flags: '-f, --filter <filter>',
    description: 'Filter packages to check (e.g. "@sous/api")',
  })
  parseFilter(val: string): string {
    return val;
  }
}