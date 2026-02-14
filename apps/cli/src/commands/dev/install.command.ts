import { logger } from '@sous/logger';
import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { execSync } from 'child_process';
import { ShellInstallCommand } from '../ops/shell-install.command.js';
import * as path from 'path';
import * as fs from 'fs';

interface InstallOptions {
  android?: boolean;
}

@SubCommand({
  name: 'install',
  description: 'Install dependencies on a remote or local device',
  subCommands: [ShellInstallCommand],
})
export class InstallCommand extends CommandRunner {
  async run(passedParam: string[], options?: InstallOptions): Promise<void> {
    const target = passedParam[0];

    // Find project root by looking for pnpm-workspace.yaml
    let rootDir = process.cwd();
    while (
      rootDir !== '/' &&
      !fs.existsSync(path.join(rootDir, 'pnpm-workspace.yaml'))
    ) {
      rootDir = path.dirname(rootDir);
    }

    if (target === 'shell') {
      // Handled by subCommand, but just in case
      return;
    }

    if (!target) {
      logger.info('👨‍🍳 Detecting role as Developer Workstation...');

      // 1. Setup .env for @sous/config if it doesn't exist
      const configDir = path.join(rootDir, 'packages', 'config');
      const envPath = path.join(configDir, '.env');
      const envExamplePath = path.join(configDir, '.env.example');

      if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
        logger.info('📝 Creating packages/config/.env from .env.example...');
        fs.copyFileSync(envExamplePath, envPath);
      }

      // 2. Run the main install script
      try {
        const scriptPath = path.join(rootDir, 'scripts', 'install-dev.sh');
        logger.info(`🚀 Running system-level installer: ${scriptPath}...`);
        execSync(`bash ${scriptPath}`, { stdio: 'inherit' });

        this.printPostInstallInstructions();
      } catch (error) {
        logger.error('❌ Local installation failed.');
      }
      return;
    }

    if (options?.android) {
      logger.info(`📱 Connecting to Android device at ${target} via ADB...`);
      try {
        const connectionString = target.includes(':')
          ? target
          : `${target}:5555`;
        execSync(`adb connect ${connectionString}`, { stdio: 'inherit' });
        logger.info('✅ Connected.');
      } catch (error) {
        logger.error(`❌ Failed to connect to Android device at ${target}.`);
      }
    } else {
      logger.info(
        `🚀 Dispatching remote Linux/RPi installation to ${target}...`,
      );
      try {
        const scriptPath = path.join(rootDir, 'scripts', 'install-remote.sh');
        execSync(`bash ${scriptPath} ${target}`, { stdio: 'inherit' });
      } catch (error) {
        logger.error(`❌ Remote installation to ${target} failed.`);
      }
    }
  }

  private printPostInstallInstructions() {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SOUS PLATFORM INSTALLED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\nNext steps to get cooking:');
    console.log('\n1. 🔐 Configure Secrets:');
    console.log(
      '   Open packages/config/.env and add your INFISICAL_ credentials.',
    );
    console.log('\n2. 🐚 Apply Shell Changes:');
    console.log('   Run: source ~/.zshrc');
    console.log('\n3. 🚀 Launch Development Tools:');
    console.log('   Run: pnpm dev');
    console.log('\n4. 🪟 Login to render: render login');
    console.log('\n5. 🪟 Login to vercel: vercel login');
    console.log('\n' + '='.repeat(60) + '\n');
  }

  @Option({
    flags: '-a, --android',
    description: 'Install/Connect to an Android device via IP',
  })
  parseAndroid(): boolean {
    return true;
  }
}
