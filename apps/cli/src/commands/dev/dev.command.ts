import { Command, CommandRunner, Option } from 'nest-commander';
import { SyncCommand } from './sync.command.js';
import { InstallCommand } from './install.command.js';
import { execSync } from 'child_process';
import React from 'react';
import { render } from 'ink';
import { Dashboard } from './ui/dashboard.js';
import { ProcessManager } from './process-manager.service.js';
import { Inject } from '@nestjs/common';
import { logger } from '@sous/logger';

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
  constructor(
    @Inject(ProcessManager) private readonly manager: ProcessManager,
  ) {
    super();
  }

  async run(passedParam: string[], options?: DevOptions): Promise<void> {
    if (options?.sync) {
      logger.info('🔄 Syncing hardware before starting...');
      execSync('pnpm sous dev sync', { stdio: 'inherit' });
    }

    if (options?.android) {
      logger.info('🤖 Starting Android Development loop for @sous/native...');
      execSync('pnpm --filter @sous/native run android:dev', {
        stdio: 'inherit',
      });
      return;
    }

    if (options?.ios) {
      logger.info('🍎 Starting iOS Development loop for @sous/native...');
      execSync('pnpm --filter @sous/native run ios:dev', { stdio: 'inherit' });
      return;
    }

    if (!options?.sync && !options?.android && !options?.ios) {
      // Clear screen and enter alt buffer
      process.stdout.write('\x1b[?1049h');
      process.stdout.write('\x1b[2J\x1b[0f');

      logger.info('🚀 Starting Robust Dev Orchestrator (Ink TUI)...');

      // Auto-start core services
      this.manager.autoStartCore();

      // Render the Ink TUI
      const { waitUntilExit } = render(
        React.createElement(Dashboard, { manager: this.manager }),
      );

      try {
        await waitUntilExit();
      } finally {
        // Restore terminal buffer immediately before cleanup logs
        process.stdout.write('\x1b[?1049l');

        logger.info('👋 Shutting down managed processes...');
        await this.manager.stopAll();

        logger.info('✅ Cleanup complete. Goodbye!');
        process.exit(0); // Force exit to prevent hanging from lingering emitters/timers
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
