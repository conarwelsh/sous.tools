import { Command, CommandRunner, Option } from 'nest-commander';
import { SyncCommand } from './sync.command.js';
import { InstallCommand } from './install.command.js';
import { execSync } from 'child_process';
import React from 'react';
import { render } from 'ink';
import { Dashboard } from './ui/dashboard.js';
import { ProcessManager } from './process-manager.service.js';
import { Inject } from '@nestjs/common';

interface DevOptions {
  sync?: boolean;
  android?: boolean;
  ios?: boolean;
}

@Command({
  name: 'dev',
  description: 'Manage development environment',
  subCommands: [InstallCommand, SyncCommand],
})
export class DevCommand extends CommandRunner {
  constructor(@Inject(ProcessManager) private readonly manager: ProcessManager) {
    super();
  }

  async run(passedParam: string[], options?: DevOptions): Promise<void> {
    if (options?.sync) {
      console.log('🔄 Syncing hardware before starting...');
      execSync('pnpm sous dev sync', { stdio: 'inherit' });
    }

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
      console.log('🚀 Starting Robust Dev Orchestrator (Ink TUI)...');

      const rootDir = execSync('git rev-parse --show-toplevel').toString().trim();

      // Clear logs before starting
      try {
        execSync('pnpm sous env logs wipe', { stdio: 'ignore', cwd: rootDir });
      } catch (e) {
        // Ignore errors if wipe fails
      }

      // Render the Ink TUI
      const { waitUntilExit } = render(React.createElement(Dashboard, { manager: this.manager }));

      await waitUntilExit();
      console.log('👋 Orchestrator exited.');
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