import { Command, CommandRunner, Option } from 'nest-commander';
import { logger } from '@sous/logger';
import { getHttpClient } from '@sous/client-sdk';
import { CliConfigService } from '../../services/cli-config.service.js';
import chalk from 'chalk';
import * as readline from 'readline';
import os from 'os';

@Command({
  name: 'feedback',
  description: 'Submit feedback or report a bug directly to the Sous team',
})
export class FeedbackCommand extends CommandRunner {
  constructor(private readonly configService: CliConfigService) {
    super();
  }

  async run(inputs: string[], options: any): Promise<void> {
    const cliConfig = await this.configService.getConfig();

    if (!cliConfig.token) {
      logger.error(
        'You must be logged in to submit feedback. Run "sous context login" first.',
      );
      return;
    }

    const type = options.type || 'BUG';
    const subject = await this.ask('Subject: ');
    const description = await this.ask('Description: ');

    logger.info('🚀 Submitting feedback...');

    try {
      const client = await getHttpClient();
      client.setToken(cliConfig.token);

      const response = await client.post<any>('/support/report', {
        type,
        subject,
        description,
        priority: options.priority || 'MEDIUM',
        metadata: {
          appVersion: '0.1.0',
          userAgent: `Sous-CLI (${os.platform()}; ${os.arch()})`,
          url: 'CLI',
        },
      });

      logger.info(`✅ Feedback submitted successfully!`);
      if (response.githubIssueUrl) {
        logger.info(`🔗 GitHub Issue: ${chalk.cyan(response.githubIssueUrl)}`);
      }
    } catch (error: any) {
      logger.error(`Failed to submit feedback: ${error.message}`);
    }
  }

  private ask(question: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(chalk.bold(question), (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  @Option({
    flags: '-t, --type <string>',
    description: 'Type of feedback (BUG, FEATURE, QUESTION)',
  })
  parseType(val: string): string {
    return val.toUpperCase();
  }

  @Option({
    flags: '-p, --priority <string>',
    description: 'Priority (LOW, MEDIUM, HIGH)',
  })
  parsePriority(val: string): string {
    return val.toUpperCase();
  }
}
