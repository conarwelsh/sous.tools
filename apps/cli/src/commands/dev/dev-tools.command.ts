import { Command, CommandRunner, Option } from 'nest-commander';
import { SyncCommand } from './sync.command.js';
import { InstallCommand } from './install.command.js';
import { KillCommand } from './kill.command.js';
import { execSync } from 'child_process';
import React from 'react';
import { render } from 'ink';
import { Dashboard } from './ui/dashboard.js';
import { ProcessManager } from './process-manager.service.js';
import { Inject } from '@nestjs/common';
import { logger } from '@sous/logger';

interface DevOptions {
  sync?: boolean;
  headless?: boolean;
  json?: boolean;
}

@Command({
  name: 'dev',
  description: 'Manage development environment',
  subCommands: [InstallCommand, SyncCommand, KillCommand],
})
export class DevToolsCommand extends CommandRunner {
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

    if (options?.headless) {
      if (options?.json) {
        const processes = this.manager.getProcesses().map((p) => ({
          id: p.id,
          name: p.name,
          status: p.status,
        }));
        console.log(JSON.stringify(processes, null, 2));
        process.exit(0);
      }

      logger.info('🚀 Starting Sous Dev Tools in HEADLESS mode...');
      await this.manager.autoStartCore();
      
      logger.info('✅ Core services orchestrated via PM2.');
      return new Promise(() => {});
    }

    // Default: Launch TUI
    process.stdout.write('\x1b[?1049h'); // Enter alt buffer
    process.stdout.write('\x1b[2J\x1b[0f'); // Clear

    logger.info('🚀 Launching Sous Dev 2.0...');

    try {
      // Auto-start core services (idempotent via PM2)
      await this.manager.autoStartCore();
      await this.renderDashboard();
    } catch (e: any) {
      process.stdout.write('\x1b[?1049l');
      logger.error('❌ FATAL ERROR:');
      logger.error(e.message);
      process.exit(1);
    }
  }

  private async renderDashboard() {
    // Render the Ink TUI
    const { waitUntilExit } = render(
      React.createElement(Dashboard, { manager: this.manager }),
    );

    try {
      await waitUntilExit();
    } catch (e: any) {
      logger.error(`❌ Dashboard exited with error: ${e.message}`);
      throw e;
    } finally {
      process.stdout.write('\x1b[?1049l'); // Exit alt buffer
      logger.info('👋 Dev Tools UI closed.');
      logger.info('✅ Services remain running in PM2. Use "pm2 list" to monitor.');
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
    flags: '--headless',
    description: 'Run in headless mode without TUI',
  })
  parseHeadless(): boolean {
    return true;
  }

  @Option({
    flags: '--json',
    description: 'Output machine-readable JSON',
  })
  parseJson(): boolean {
    return true;
  }
}
