import { Command, CommandRunner, Option } from 'nest-commander';
import { SyncCommand } from '../sync/sync.command';
import { InstallCommand } from '../install/install.command';
import { execSync, spawn } from 'child_process';
import * as path from 'path';

interface DevOptions {
  sync?: boolean;
  android?: boolean;
  ios?: boolean;
}

@Command({
  name: 'dev',
  description: 'Manage development environment',
  subCommands: [InstallCommand, SyncCommand]
})
export class DevCommand extends CommandRunner {
  async run(
    passedParam: string[],
    options?: DevOptions,
  ): Promise<void> {
    if (options?.sync) {
      console.log('🔄 Syncing hardware before starting...');
      execSync('pnpm sous dev sync', { stdio: 'inherit' });
    }

    console.log(`
   _____  ____  _    _  _____ 
  / ____|/ __ \| |  | |/ ____|
 | (___ | |  | | |  | | (___  
  \___ \| |  | | |  | |\___ \ 
  ____) | |__| | |__| |____) |
 |_____/ \____/ \____/|_____/ 
                               
    sous.tools orchestrator
    `);

    if (options?.android) {
      console.log('🤖 Starting Android Development loop for @sous/native...');
      execSync('pnpm --filter @sous/native run android:dev', { stdio: 'inherit' });
      return;
    }

    if (options?.ios) {
      console.log('🍎 Starting iOS Development loop for @sous/native...');
      execSync('pnpm --filter @sous/native run ios:dev', { stdio: 'inherit' });
      return;
    }

    if (!options?.sync && !options?.android && !options?.ios) {
      console.log('🚀 Starting Development Environment via Zellij...');
      
      const rootDir = execSync('git rev-parse --show-toplevel').toString().trim();
      
      // Clear logs before starting
      try {
        execSync('pnpm sous logs wipe', { stdio: 'ignore', cwd: rootDir });
      } catch (e) {
        // Ignore errors if wipe fails
      }

      const kdlPath = path.join(rootDir, 'dev.kdl');
      
      // Use zellij if available
      try {
        execSync('which zellij', { stdio: 'ignore' });
        console.log('Detected Zellij, launching layout...');
        const child = spawn('zellij', ['--layout', kdlPath], { 
          stdio: 'inherit', 
          shell: true,
          cwd: rootDir
        });

        await new Promise((resolve, reject) => {
          child.on('exit', (code) => {
            if (code === 0) resolve(void 0);
            else process.exit(code ?? 1);
          });
          child.on('error', reject);
        });
        return;
      } catch (e) {
        console.log('Zellij not found, falling back to Turbo...');
        const args = ['run', 'dev', '--filter=@sous/api', '--filter=@sous/web', '--filter=@sous/docs'];
        
        const child = spawn('turbo', args, { 
          stdio: 'inherit', 
          shell: true,
          cwd: rootDir
        });

        // Keep the process alive
        await new Promise((resolve, reject) => {
          child.on('exit', (code) => {
            if (code === 0) resolve(void 0);
            else process.exit(code ?? 1);
          });
          child.on('error', reject);
        });
      }
    }
  }

  @Option({
    flags: '-s, --sync',
    description: 'Sync environment before starting',
  })
  parseSync(): boolean {
    return true;
  }

  @Option({
    flags: '-a, --android',
    description: 'Start native Android development',
  })
  parseAndroid(): boolean {
    return true;
  }

  @Option({
    flags: '-i, --ios',
    description: 'Start native iOS development',
  })
  parseIos(): boolean {
    return true;
  }
}