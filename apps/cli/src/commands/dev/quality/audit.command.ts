import { logger } from '@sous/logger';
import { SubCommand, CommandRunner } from 'nest-commander';
import { spawn } from 'child_process';
import * as path from 'path';

@SubCommand({
  name: 'audit',
  description: 'Run security and dependency audit across the codebase',
})
export class AuditCommand extends CommandRunner {
  async run(): Promise<void> {
    logger.info('🔍 Running security and dependency audit...');

    // Execute from the root of the monorepo
    const rootDir = path.resolve(process.cwd(), '../../');

    const child = spawn('pnpm', ['audit'], {
      stdio: 'inherit',
      shell: true,
      cwd: rootDir,
    });

    return new Promise((resolve, reject) => {
      child.on('exit', (code) => {
        if (code === 0) {
          logger.info('✅ Audit complete. No vulnerabilities found.');
          resolve();
        } else {
          logger.warn('⚠️  Audit found potential vulnerabilities.');
          process.exit(code ?? 1);
        }
      });

      child.on('error', (err) => {
        logger.error(err);
        reject(err);
      });
    });
  }
}
