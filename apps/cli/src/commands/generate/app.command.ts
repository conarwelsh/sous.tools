import { logger } from '@sous/logger';
import { SubCommand, CommandRunner, Option } from 'nest-commander';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface AppOptions {
  template?: string;
}

@SubCommand({
  name: 'app',
  arguments: '<name>',
  description: 'Generate a new application from a template',
})
export class AppCommand extends CommandRunner {
  async run(passedParam: string[], options?: AppOptions): Promise<void> {
    const appName = passedParam[0];
    if (!appName) {
      logger.error('❌ Please provide an app name (e.g., pos, kds)');
      return;
    }

    const templateName = options?.template || 'native-app';
    const rootDir = path.resolve(process.cwd(), '../../');
    const templateDir = path.join(
      rootDir,
      'packages',
      'templates',
      templateName,
    );
    const appsDir = path.join(rootDir, 'apps');
    const targetDir = path.join(appsDir, appName);

    if (!fs.existsSync(templateDir)) {
      logger.error(`❌ Template '${templateName}' not found at ${templateDir}`);
      return;
    }

    if (fs.existsSync(targetDir)) {
      logger.error(
        `❌ Application '${appName}' already exists at ${targetDir}`,
      );
      return;
    }

    logger.info(
      `🚀 Generating app '@sous/${appName}' from template '${templateName}'...`,
    );

    // 1. Copy template
    this.copyDir(templateDir, targetDir);

    // 2. Replace placeholders
    const appSlug = appName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(); // sanitize for cargo
    const appPackageName = `@sous/${appName}`;

    this.replaceInFile(path.join(targetDir, 'package.json'), {
      '{{APP_NAME}}': appPackageName,
    });

    this.replaceInFile(path.join(targetDir, 'src-tauri', 'tauri.conf.json'), {
      '{{APP_SLUG}}': appSlug,
    });

    this.replaceInFile(path.join(targetDir, 'src-tauri', 'Cargo.toml'), {
      '{{APP_SLUG}}': appSlug,
    });

    // 3. Update pnpm-workspace if needed (optional, usually handled by glob)

    logger.info(`✅ App generated at apps/${appName}`);
    logger.info(`📦 Installing dependencies...`);

    try {
      execSync('pnpm install', { stdio: 'inherit', cwd: rootDir });
    } catch (e) {
      logger.warn(
        '⚠️  pnpm install encountered an issue, but the app was created.',
      );
    }
  }

  private copyDir(src: string, dest: string) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        if (
          entry.name === 'node_modules' ||
          entry.name === 'target' ||
          entry.name === 'dist'
        )
          continue;
        this.copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  private replaceInFile(
    filePath: string,
    replacements: Record<string, string>,
  ) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');
    for (const [key, value] of Object.entries(replacements)) {
      content = content.replace(new RegExp(key, 'g'), value);
    }
    fs.writeFileSync(filePath, content);
  }

  @Option({
    flags: '-t, --template [template]',
    description: 'Template to use (default: native-app)',
  })
  parseTemplate(val: string): string {
    return val;
  }
}
