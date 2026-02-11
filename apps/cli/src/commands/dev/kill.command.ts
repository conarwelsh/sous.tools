import { SubCommand, CommandRunner } from 'nest-commander';
import { Inject } from '@nestjs/common';
import { ProcessManager } from './process-manager.service.js';
import { logger } from '@sous/logger';

@SubCommand({
  name: 'kill',
  description: 'Kill all managed background processes',
})
export class KillCommand extends CommandRunner {
  constructor(
    @Inject(ProcessManager) private readonly manager: ProcessManager,
  ) {
    super();
  }

  async run(): Promise<void> {
    logger.info('🔪 Killing all managed processes...');
    try {
      await this.manager.stopAll();
      logger.info('✅ All processes stopped.');
    } catch (e: any) {
      logger.error(`❌ Failed to kill processes: ${e.message}`);
    }
  }
}
