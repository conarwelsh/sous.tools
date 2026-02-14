import { SubCommand, CommandRunner } from 'nest-commander';
import { logger } from '@sous/logger';
import { mkdir, writeFile } from 'fs/promises';
import { join, parse } from 'path';
import * as fs from 'fs';
import chalk from 'chalk';

@SubCommand({
  name: 'domain',
  description: 'Scaffold a new strategic umbrella domain in the API and Features',
})
export class DomainGenerateCommand extends CommandRunner {
  private findRootDir(): string {
    let curr = process.cwd();
    while (curr !== parse(curr).root) {
      if (fs.existsSync(join(curr, 'pnpm-workspace.yaml'))) {
        return curr;
      }
      curr = join(curr, '..');
    }
    return process.cwd();
  }

  async run(inputs: string[]): Promise<void> {
    const [name] = inputs;
    if (!name) {
      logger.error('Domain name is required.');
      return;
    }

    const domainName = name.toLowerCase();
    const className = domainName.charAt(0).toUpperCase() + domainName.slice(1);
    const root = this.findRootDir();

    logger.info(`🏗️  Generating Domain: ${chalk.bold(className)}...`);

    try {
      // --- API Scaffolding ---
      const apiPath = join(root, 'apps/api/src/domains', domainName);
      await mkdir(apiPath, { recursive: true });
      await mkdir(join(apiPath, 'controllers'), { recursive: true });
      await mkdir(join(apiPath, 'services'), { recursive: true });
      await mkdir(join(apiPath, 'resolvers'), { recursive: true });

      await writeFile(
        join(apiPath, `${domainName}.module.ts`),
        `import { Module } from '@nestjs/common';
import { ${className}Service } from './services/${domainName}.service.js';
import { ${className}Controller } from './controllers/${domainName}.controller.js';
import { CoreModule } from '../core/core.module.js';

@Module({
  imports: [CoreModule],
  providers: [${className}Service],
  controllers: [${className}Controller],
  exports: [${className}Service],
})
export class ${className}Module {}
`,
      );

      await writeFile(
        join(apiPath, `${domainName}.schema.ts`),
        `import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from '../iam/organizations/organizations.schema';

export const ${domainName}s = pgTable('${domainName}s', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
`,
      );

      await writeFile(
        join(apiPath, 'services', `${domainName}.service.ts`),
        `import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';

@Injectable()
export class ${className}Service {
  constructor(@Inject(DatabaseService) private readonly dbService: DatabaseService) {}
}
`,
      );

      await writeFile(
        join(apiPath, 'controllers', `${domainName}.controller.ts`),
        `import { Controller } from '@nestjs/common';
import { ${className}Service } from '../services/${domainName}.service.js';

@Controller('${domainName}')
export class ${className}Controller {
  constructor(private readonly ${domainName}Service: ${className}Service) {}
}
`,
      );

      // --- Features Scaffolding ---
      const featuresPath = join(root, 'packages/features/src/domains', domainName);
      await mkdir(featuresPath, { recursive: true });
      await mkdir(join(featuresPath, 'components'), { recursive: true });
      await mkdir(join(featuresPath, 'hooks'), { recursive: true });

      await writeFile(
        join(featuresPath, 'index.ts'),
        `export * from './components';
export * from './hooks';
`,
      );
      await mkdir(join(featuresPath, 'components'), { recursive: true });
      await writeFile(join(featuresPath, 'components', 'index.ts'), '');
      await writeFile(join(featuresPath, 'hooks', 'index.ts'), '');

      logger.info(
        `✅ Domain ${chalk.bold(className)} scaffolded in API and Features.`,
      );
      logger.info('Next Steps:');
      logger.info(
        `1. Register ${chalk.cyan(className + 'Module')} in apps/api/src/app.module.ts`,
      );
      logger.info(
        `2. Export your new feature domain in packages/features/src/index.ts`,
      );
    } catch (e: any) {
      logger.error(`Failed to generate domain: ${e.message}`);
    }
  }
}
