import { Command, CommandRunner } from 'nest-commander';
import { WhoamiCommand } from './whoami.command.js';
import { SwitchEnvCommand } from './switch-env.command.js';
import { LoginAsCommand } from './login-as.command.js';
import { LoginCommand } from './login.command.js';
import { LogoutCommand } from './logout.command.js';
import { SwitchOrgCommand } from './switch-org.command.js';
import { logger } from '@sous/logger';

@Command({
  name: 'iam',
  description: 'Identity and Access Management commands',
  subCommands: [
    WhoamiCommand,
    SwitchEnvCommand,
    LoginAsCommand,
    LoginCommand,
    LogoutCommand,
    SwitchOrgCommand,
  ],
})
export class IamCommand extends CommandRunner {
  async run(passedParam: string[]): Promise<void> {
    if (
      passedParam.length > 0 &&
      [
        'whoami',
        'switch-env',
        'login-as',
        'login',
        'logout',
        'switch-org',
      ].includes(passedParam[0])
    ) {
      return;
    }
    logger.info(
      'Please specify a subcommand: whoami, switch-env, login, logout, switch-org, login-as',
    );
  }
}
