import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { spawn } from 'child_process';
import * as path from 'path';

@SubCommand({
  name: 'test',
  description: 'Run tests across the monorepo',
})
export class TestCommand extends CommandRunner {
  async run(passedParam: string[], options: { filter?: string }): Promise<void> {
    const args = ['run', 'test'];
    
    if (options.filter) {
      args.push('--filter', options.filter);
    }
    
    console.log(`> turbo ${args.join(' ')}`);

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
        console.error(err);
        reject(err);
      });
    });
  }

  @Option({
    flags: '-f, --filter <filter>',
    description: 'Filter packages to test (e.g. "@sous/api")',
  })
  parseFilter(val: string): string {
    return val;
  }
}