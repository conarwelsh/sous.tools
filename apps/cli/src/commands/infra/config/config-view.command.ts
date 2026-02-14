import { logger } from '@sous/logger';
import { SubCommand, CommandRunner, Option } from 'nest-commander';

interface ConfigViewOptions {
  env?: string;
  json?: boolean;
}

@SubCommand({
  name: 'view',
  description: 'View the resolved platform configuration (merged with secrets)',
})
export class ConfigViewCommand extends CommandRunner {
  async run(passedParam: string[], options?: ConfigViewOptions): Promise<void> {
    const env = options?.env || process.env.NODE_ENV || 'development';

    try {
      // We need to import config AFTER potentially fetching secrets if we want to see the merged view
      // But if the user runs this command, they probably want to see the CURRENTLY resolved config.
      // If they want to see it for a specific env, they should run:
      // sous env exec -e production -- sous env config view

      const { config } = await import('@sous/config');

      if (options?.json) {
        console.log(JSON.stringify(config, null, 2));
      } else {
        logger.info(`📝 Resolved Configuration (env: ${config.env}):`);
        console.dir(config, { depth: null, colors: true });
      }
    } catch (error: any) {
      logger.error(`❌ Failed to view configuration: ${error.message}`);
    }
  }

  @Option({
    flags: '-e, --env <env>',
    description: 'Environment to simulate (development, staging, production)',
  })
  parseEnv(val: string): string {
    return val;
  }

  @Option({
    flags: '-j, --json',
    description: 'Output as raw JSON',
    defaultValue: false,
  })
  parseJson(val: boolean): boolean {
    return val;
  }
}
