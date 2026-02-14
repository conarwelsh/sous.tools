import { SubCommand, CommandRunner } from 'nest-commander';
import { logger } from '@sous/logger';
import { mkdir, writeFile } from 'fs/promises';
import { join, parse } from 'path';
import * as fs from 'fs';
import chalk from 'chalk';

@SubCommand({
  name: 'tactical',
  description: 'Scaffold a new tactical feature within a strategic domain',
})
export class TacticalGenerateCommand extends CommandRunner {
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
    const [domain, name] = inputs;
    if (!domain || !name) {
      logger.error('Usage: sous generate tactical <domain> <name>');
      return;
    }

    const domainName = domain.toLowerCase();
    const tacticalName = name.toLowerCase();
    const className =
      tacticalName.charAt(0).toUpperCase() + tacticalName.slice(1);
    const root = this.findRootDir();

    const tacticalPath = join(
      root,
      'apps/api/src/domains',
      domainName,
      tacticalName,
    );

    logger.info(
      `🏗️  Generating Tactical Feature: ${chalk.bold(className)} in ${chalk.cyan(domainName)}...`,
    );

    try {
      await mkdir(tacticalPath, { recursive: true });

      await writeFile(
        join(tacticalPath, `${tacticalName}.module.ts`),
        `import { Module } from '@nestjs/common';
import { ${className}Service } from './${tacticalName}.service.js';
import { ${className}Controller } from './${tacticalName}.controller.js';

@Module({
  providers: [${className}Service],
  controllers: [${className}Controller],
  exports: [${className}Service],
})
export class ${className}Module {}
`,
      );

      await writeFile(
        join(tacticalPath, `${tacticalName}.service.ts`),
        `import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';

@Injectable()
export class ${className}Service {
  constructor(@Inject(DatabaseService) private readonly dbService: DatabaseService) {}
}
`,
      );

      await writeFile(
        join(tacticalPath, `${tacticalName}.controller.ts`),
        `import { Controller } from '@nestjs/common';
import { ${className}Service } from './${tacticalName}.service.js';

@Controller('${domainName}/${tacticalName}')
export class ${className}Controller {
  constructor(private readonly ${tacticalName}Service: ${className}Service) {}
}
`,
      );

      await writeFile(
        join(tacticalPath, `${tacticalName}.schema.ts`),
        `import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from '../../iam/organizations/organizations.schema';

export const ${tacticalName}s = pgTable('${tacticalName}s', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
`,
      );

      logger.info(
        `✅ Tactical feature ${chalk.bold(className)} scaffolded at ${tacticalPath}`,
      );
      logger.info(
        `Remember to import ${chalk.cyan(className + 'Module')} into ${chalk.bold(domainName + '.module.ts')}`,
      );
    } catch (e: any) {
      logger.error(`Failed to generate tactical feature: ${e.message}`);
    }
  }
}
