import { Command, CommandRunner } from 'nest-commander';
import { ConfigCommand } from './config/config.command.js';
import { LogsCommand } from './logs/logs.command.js';
import { BrandingCommand } from './branding.command.js';
import { EnvExportCommand } from './env-export.command.js';
import { EnvExecCommand } from './env-exec.command.js';
import { DashboardCommand } from './dashboard.command.js';
import { logger } from '@sous/logger';

@Command({
  name: 'infra',
  description: 'Infrastructure and environment management',
  subCommands: [
    ConfigCommand,
    LogsCommand,
    BrandingCommand,
    EnvExportCommand,
    EnvExecCommand,
    DashboardCommand,
  ],
})
export class InfraCommand extends CommandRunner {
  async run(passedParam: string[]): Promise<void> {
    if (
      passedParam.length > 0 &&
      ['config', 'logs', 'branding', 'export', 'exec', 'dashboard'].includes(
        passedParam[0],
      )
    ) {
      return;
    }
    logger.info(
      'Please specify a subcommand: config, logs, branding, export, exec, dashboard',
    );
  }
}
