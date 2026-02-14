import { Command, CommandRunner, Option } from 'nest-commander';
import { logger } from '@sous/logger';
import * as fs from 'fs';
import * as path from 'path';

interface VersionOptions {
  type?: 'major' | 'minor' | 'patch';
}

@Command({
  name: 'version',
  description: 'Bump the semantic version of the project',
})
export class VersionCommand extends CommandRunner {
  async run(_inputs: string[], options: VersionOptions): Promise<void> {
    const type = options.type || 'patch';
    const rootDir = process.cwd();
    const changelogPath = path.join(rootDir, 'CHANGELOG.md');
    const packageJsonPath = path.join(rootDir, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      logger.error('❌ package.json not found');
      return;
    }

    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const oldVersion = pkg.version;
    const [major, minor, patch] = oldVersion.split('.').map(Number);

    let newVersion = '';
    if (type === 'major') newVersion = `${major + 1}.0.0`;
    else if (type === 'minor') newVersion = `${major}.${minor + 1}.0`;
    else newVersion = `${major}.${minor}.${patch + 1}`;

    logger.info(`🚀 Bumping version: ${oldVersion} -> ${newVersion} (${type})`);

    // 1. Update root package.json
    pkg.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');

    // 2. Update CHANGELOG.md
    if (fs.existsSync(changelogPath)) {
      let content = fs.readFileSync(changelogPath, 'utf-8');
      const date = new Date().toISOString().split('T')[0];
      const header = `## [${newVersion}] - ${date}`;
      
      if (content.includes('## [Unreleased]')) {
        content = content.replace('## [Unreleased]', `## [Unreleased]\n\n${header}`);
      } else {
        // Fallback if no Unreleased section
        const insertionPoint = content.indexOf('## [');
        if (insertionPoint !== -1) {
          content = content.slice(0, insertionPoint) + header + '\n\n' + content.slice(insertionPoint);
        } else {
          content += `\n\n${header}\n`;
        }
      }
      fs.writeFileSync(changelogPath, content);
      logger.info('📝 Updated CHANGELOG.md');
    }

    // 3. Git Commit & Tag (Optional, but good practice)
    try {
        logger.info(`✅ Version bumped to ${newVersion}. Run 'git commit -am "chore: bump version to ${newVersion}"' to save.`);
    } catch (e) {
        // Ignore
    }
  }

  @Option({
    flags: '-t, --type [type]',
    description: 'Type of bump: major, minor, patch (default: patch)',
  })
  parseType(val: string): string {
    return val;
  }
}
