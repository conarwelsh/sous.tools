import { Command, CommandRunner } from 'nest-commander';
import { AppCommand } from './app.command.js';

@Command({
  name: 'generate',
  description: 'Generate new apps or packages from templates',
  subCommands: [AppCommand],
})
export class GenerateCommand extends CommandRunner {
  async run(): Promise<void> {
    // This command is a container for subcommands
  }
}
