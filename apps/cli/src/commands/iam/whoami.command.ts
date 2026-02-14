import { SubCommand, CommandRunner } from 'nest-commander';
import { logger } from '@sous/logger';
import { config } from '@sous/config';
import { CliConfigService } from '../../services/cli-config.service.js';
import { getHttpClient } from '@sous/client-sdk';
import chalk from 'chalk';

@SubCommand({
  name: 'whoami',
  description: 'Display current organizational and environment context',
})
export class WhoamiCommand extends CommandRunner {
  constructor(private readonly configService: CliConfigService) {
    super();
  }

  async run(): Promise<void> {
    const cliConfig = await this.configService.getConfig();
    const env = config.env;
    const envColor =
      env === 'production'
        ? chalk.blue
        : env === 'staging'
          ? chalk.yellow
          : chalk.green;

    let userDetails = chalk.gray('Not Logged In');
    let orgDetails = chalk.gray(cliConfig.currentOrgId || 'None');

    if (cliConfig.token) {
      try {
        const client = await getHttpClient();
        client.setToken(cliConfig.token);
        const user: any = await client.get('/auth/me');
        userDetails = `${chalk.bold(user.firstName + ' ' + user.lastName)} (${user.email})`;
        orgDetails = `${chalk.cyan(user.organization?.name || user.organizationId)} (${user.role})`;
      } catch (e) {
        userDetails = chalk.red('Session Expired / Invalid Token');
      }
    }

    console.log('\n' + chalk.bold('👨‍🍳 SOUS CONTEXT'));
    console.log('='.repeat(50));
    console.log(
      `${chalk.bold('Environment:')}  ${envColor(env.toUpperCase())}`,
    );
    console.log(`${chalk.bold('API URL:')}      ${config.api.url}`);
    console.log(`${chalk.bold('Web URL:')}      ${config.web.url}`);
    console.log(`${chalk.bold('User:')}         ${userDetails}`);
    console.log(`${chalk.bold('Organization:')} ${orgDetails}`);
    console.log('='.repeat(50) + '\n');
  }
}
