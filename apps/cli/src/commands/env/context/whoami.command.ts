import { SubCommand, CommandRunner } from 'nest-commander';
import { logger } from '@sous/logger';
import { config } from '@sous/config';
import chalk from 'chalk';

@SubCommand({
  name: 'whoami',
  description: 'Display current organizational and environment context',
})
export class WhoamiCommand extends CommandRunner {
  async run(): Promise<void> {
    const env = config.env;
    const envColor =
      env === 'production'
        ? chalk.blue
        : env === 'staging'
          ? chalk.yellow
          : chalk.green;

    console.log('\n' + chalk.bold('👨‍🍳 SOUS CONTEXT'));
    console.log('='.repeat(30));
    console.log(
      `${chalk.bold('Environment:')}  ${envColor(env.toUpperCase())}`,
    );
    console.log(`${chalk.bold('API URL:')}      ${config.api.url}`);
    console.log(`${chalk.bold('Web URL:')}      ${config.web.url}`);
    console.log(
      `${chalk.bold('User:')}         ${chalk.gray('Local Developer')}`,
    );
    console.log('='.repeat(30) + '\n');
  }
}
