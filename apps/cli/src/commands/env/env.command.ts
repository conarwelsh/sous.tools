import { Command, CommandRunner } from 'nest-commander';
import { ConfigCommand } from './config/config.command';
import { LogsCommand } from './logs/logs.command';

@Command({
  name: 'env',
  description: 'Infrastructure and environment management',
  subCommands: [ConfigCommand, LogsCommand],
})
export class EnvCommand extends CommandRunner {
  async run(): Promise<void> {
    console.log('Please specify a subcommand: config, logs');
  }
}
