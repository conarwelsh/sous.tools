import { SubCommand, CommandRunner } from 'nest-commander';
import { logger } from '@sous/logger';
import { writeFile, readFile } from 'fs/promises';
import { join, parse } from 'path';
import * as fs from 'fs';
import chalk from 'chalk';

@SubCommand({
  name: 'ui',
  description: 'Scaffold a new UI component in @sous/ui',
})
export class UiGenerateCommand extends CommandRunner {
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
      logger.error('Usage: sous generate ui <name>');
      return;
    }

    const componentName = name.charAt(0).toUpperCase() + name.slice(1);
    const fileName = name.toLowerCase();
    const root = this.findRootDir();
    const uiPath = join(root, 'packages/ui/src/components/ui');

    logger.info(`🏗️  Generating UI Component: ${chalk.bold(componentName)}...`);

    try {
      const content = `"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface ${componentName}Props extends React.HTMLAttributes<HTMLDivElement> {}

const ${componentName} = React.forwardRef<HTMLDivElement, ${componentName}Props>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("text-foreground", className)}
        {...props}
      />
    )
  }
)
${componentName}.displayName = "${componentName}"

export { ${componentName} }
`;

      await writeFile(join(uiPath, `${fileName}.tsx`), content);

      // Add to index.ts
      const indexPath = join(root, 'packages/ui/src/index.ts');
      let indexContent = '';
      try {
        indexContent = await readFile(indexPath, 'utf8');
      } catch {}

      if (!indexContent.includes(`./components/ui/${fileName}`)) {
        // Find last export from components/ui and insert after
        const lines = indexContent.split('\n');
        let lastUiExportIndex = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('export * from "./components/ui/')) {
            lastUiExportIndex = i;
          }
        }

        if (lastUiExportIndex !== -1) {
          lines.splice(
            lastUiExportIndex + 1,
            0,
            `export * from "./components/ui/${fileName}";`,
          );
          await writeFile(indexPath, lines.join('\n'));
        } else {
          await writeFile(
            indexPath,
            indexContent + `export * from "./components/ui/${fileName}";\n`,
          );
        }
      }

      logger.info(
        `✅ UI component ${chalk.bold(componentName)} scaffolded and exported.`,
      );
    } catch (e: any) {
      logger.error(`Failed to generate UI component: ${e.message}`);
    }
  }
}
