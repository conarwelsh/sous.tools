import { Command, CommandRunner, Option } from 'nest-commander';
import { logger } from '@sous/logger';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

@Command({
  name: 'login-as',
  description: 'Force login as a specific organization ID for local development',
})
export class LoginAsCommand extends CommandRunner {
  async run(inputs: string[], options?: Record<string, any>): Promise<void> {
    const [orgId] = inputs;

    if (!orgId) {
      logger.error('Organization ID is required');
      return;
    }

    try {
      const configPath = join(homedir(), '.sous', 'config.json');
      let config: any = {};
      try {
        const file = await import(configPath);
        config = file.default || file;
      } catch {}

      config.currentOrgId = orgId;
      
      await writeFile(configPath, JSON.stringify(config, null, 2));
      
      logger.success(`Successfully switched context to Organization: ${orgId}`);
      logger.info('Future CLI commands will use this context where applicable.');
    } catch (error) {
      logger.error('Failed to update context configuration');
    }
  }
}
