import { SubCommand, CommandRunner } from 'nest-commander';
import { logger } from '@sous/logger';
import { CliConfigService } from '../../services/cli-config.service.js';
import { getHttpClient } from '@sous/client-sdk';
import chalk from 'chalk';
import * as readline from 'readline';

@SubCommand({
  name: 'login',
  description: 'Authenticate with the Sous API',
})
export class LoginCommand extends CommandRunner {
  constructor(private readonly configService: CliConfigService) {
    super();
  }

  async run(): Promise<void> {
    const email = await this.ask('Email: ');
    const password = await this.ask('Password: ', true);

    logger.info('🔐 Authenticating...');

    try {
      const client = await getHttpClient();
      const response = await client.post<{ access_token: string }>('/auth/login', {
        username: email, // Passport local strategy usually expects 'username'
        password,
      });

      if (response.access_token) {
        // Get user profile to store org context
        client.setToken(response.access_token);
        const user: any = await client.get('/auth/me');

        await this.configService.setConfig({
          token: response.access_token,
          email: user.email,
          currentOrgId: user.organizationId,
        });

        logger.info(
          `Logged in as ${chalk.bold(user.firstName + ' ' + user.lastName)} (${user.email})`,
        );
        logger.info(
          `Context set to Organization: ${chalk.cyan(user.organization?.name || user.organizationId)}`,
        );
      }
    } catch (error: any) {
      logger.error(`Login failed: ${error.message}`);
    }
  }

  private ask(question: string, hidden = false): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      if (hidden) {
        const stdin: any = process.stdin;
        // Simple password masking
        process.stdout.write(question);
        stdin.resume();
        stdin.setRawMode(true);
        let password = '';
        const onData = (char: string) => {
          char = char + '';
          if (char === '\n' || char === '\r' || char === '\u0004') {
            stdin.setRawMode(false);
            stdin.pause();
            process.stdout.write('\n');
            stdin.removeListener('data', onData);
            resolve(password);
          } else if (char === '\u0003') {
            process.exit();
          } else {
            password += char;
            process.stdout.write('*');
          }
        };
        stdin.on('data', onData);
      } else {
        rl.question(question, (answer) => {
          rl.close();
          resolve(answer.trim());
        });
      }
    });
  }
}
