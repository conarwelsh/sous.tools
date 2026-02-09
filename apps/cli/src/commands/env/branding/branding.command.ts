import { SubCommand, CommandRunner } from 'nest-commander';
import { execSync } from 'child_process';
import { logger } from '@sous/logger';

@SubCommand({
  name: 'branding',
  description: 'Generate environment-aware icons and branding assets',
})
export class BrandingCommand extends CommandRunner {
  async run(): Promise<void> {
    logger.info('🎨 Generating environment-aware assets...');
    try {
      execSync('pnpm --filter @sous/ui run generate:icons', {
        stdio: 'inherit',
      });
      logger.info('✅ Assets generated successfully.');
    } catch (error) {
      logger.error('❌ Asset generation failed.');
    }
  }
}
