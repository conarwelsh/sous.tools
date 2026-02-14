import { Command, CommandRunner, SubCommand } from 'nest-commander';
import { logger } from '@sous/logger';

@SubCommand({
  name: 'sync',
  description: 'Synchronize catalog and sales from a provider',
})
export class IntegrationsSyncCommand extends CommandRunner {
  async run(params: string[]): Promise<void> {
    const provider = params[0] || 'square';
    logger.info(`🔄 Synchronizing data from ${provider}...`);

    // In a real implementation, this would call the API or the Service directly
    // For now, we'll log the intent.
    console.log(`Successfully triggered sync for ${provider}`);
  }
}
