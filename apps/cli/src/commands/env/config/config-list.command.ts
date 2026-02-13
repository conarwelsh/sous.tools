import { SubCommand, CommandRunner } from 'nest-commander';
import { logger } from '@sous/logger';
import { config } from '@sous/config';
import chalk from 'chalk';

@SubCommand({
  name: 'list',
  description: 'Display currently resolved configuration (secrets masked)',
})
export class ConfigListCommand extends CommandRunner {
  async run(): Promise<void> {
    console.log('\n' + chalk.bold('⚙️  RESOLVED CONFIGURATION'));
    console.log('='.repeat(50));

    const mask = (val: any) => (val ? '********' : chalk.red('MISSING'));

    console.log(chalk.bold('\n[Infrastructure]'));
    console.log(`API URL: ${config.api.url}`);
    console.log(`Web URL: ${config.web.url}`);

    console.log(chalk.bold('\n[Secrets]'));
    console.log(`JWT Secret:      ${mask(config.iam.jwtSecret)}`);
    console.log(`Supabase Key:    ${mask(config.storage.supabase?.anonKey)}`);
    console.log(`Redis URL:       ${mask(config.redis.url)}`);
    console.log(`Square Token:    ${mask(config.square.accessToken)}`);
    console.log(`Gemini API Key:  ${mask(config.ai.googleGenerativeAiApiKey)}`);

    console.log(chalk.bold('\n[Context]'));
    console.log(`Environment:     ${config.env.toUpperCase()}`);
    console.log('='.repeat(50) + '\n');
  }
}
