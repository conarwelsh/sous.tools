import { logger } from '@sous/logger';
import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';

@SubCommand({
  name: 'housekeep',
  description: 'Clean up the monorepo (delete node_modules, .next, dist, etc.)',
})
export class HousekeepCommand extends CommandRunner {
  async run(passedParam: string[], options: { yes?: boolean }): Promise<void> {
    if (!options.yes) {
      const confirmed = await this.confirmAction();
      if (!confirmed) {
        logger.info('❌ Operation cancelled.');
        return;
      }
    }

    const rootDir = path.resolve(process.cwd(), '../../');
    logger.info(`🧹 Cleaning up artifacts in ${rootDir}...`);

    // Using 'find' is efficient for deep cleaning.
    // We'll target common build and dependency directories.
    const targets = ['node_modules', '.next', 'dist', '.turbo', 'build', 'coverage'];
    
    // Constructing a find command: find . -name "target" -type d -prune -exec rm -rf '{}' +
    // We process each target separately for clarity and safety (or combined).
    // A robust way in linux is: find . -type d \( -name "node_modules" -o -name ".next" ... \) -prune -exec rm -rf {} +
    
    const findExpression = targets.map(t => `-name "${t}"`).join(' -o ');
    const command = `find . -type d \( ${findExpression} \) -prune -exec rm -rf {} +`;

    logger.info(`> ${command}`);

    const child = spawn(command, { 
      stdio: 'inherit', 
      shell: true, 
      cwd: rootDir 
    });

    return new Promise((resolve, reject) => {
      child.on('exit', (code) => {
        if (code === 0) {
          logger.info('✨ Housekeeping complete! Run "pnpm install" to rehydrate.');
          resolve();
        } else {
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
    flags: '-y, --yes',
    description: 'Skip confirmation prompt',
  })
  parseYes(val: boolean): boolean {
    return true;
  }

  private async confirmAction(): Promise<boolean> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question('⚠️  This will delete all node_modules and build artifacts. Are you sure? (y/N) ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }
}
