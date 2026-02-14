import { Command, CommandRunner } from 'nest-commander';
import { HardwareCommand } from './hardware/hardware.command.js';
import { IntegrationsCommand } from './integrations/integrations.command.js';
import { logger } from '@sous/logger';

@Command({
  name: 'sys',
  description: 'System and integration management',
  subCommands: [HardwareCommand, IntegrationsCommand],
})
export class SysCommand extends CommandRunner {
  async run(passedParam: string[]): Promise<void> {
    if (
      passedParam.length > 0 &&
      ['hardware', 'integrations'].includes(passedParam[0])
    ) {
      return;
    }
    logger.info('Please specify a subcommand: hardware, integrations');
  }
}
