import { logger } from '@sous/logger';
import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { execSync } from 'child_process';
import { ShellInstallCommand } from './shell-install.command.js';
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
    if (passedParam.length > 0 && ['shell'].includes(passedParam[0])) {
      return;
    }

    const targetIp = passedParam[0];
    
    // Find project root by looking for pnpm-workspace.yaml
    let rootDir = process.cwd();
    while (rootDir !== '/' && !fs.existsSync(path.join(rootDir, 'pnpm-workspace.yaml'))) {
      rootDir = path.dirname(rootDir);
    }

    if (!targetIp) {
      logger.info('👨‍🍳 Detecting role as Developer Workstation...');
      
      // 1. Setup .env for @sous/config if it doesn't exist
      const configDir = path.join(rootDir, 'packages', 'config');
      const envPath = path.join(configDir, '.env');
      const envExamplePath = path.join(configDir, '.env.example');

      if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
        logger.info('📝 Creating packages/config/.env from .env.example...');
        fs.copyFileSync(envExamplePath, envPath);
      } else if (fs.existsSync(envPath)) {
        logger.info('✅ packages/config/.env already exists.');
      }

      // 2. Run the main install script
      try {
        const scriptPath = path.join(rootDir, 'scripts', 'install-dev.sh');
        logger.info(`🚀 Running ${scriptPath}...`);
        execSync(`bash ${scriptPath}`, { stdio: 'inherit' });
      } catch (error) {
        logger.error('❌ Local installation failed.');
      }
      return;
    }

    if (options?.android) {
      logger.info(`📱 Connecting to Android device at ${targetIp} via ADB...`);
      try {
        const connectionString = targetIp.includes(':') ? targetIp : `${targetIp}:5555`;
        execSync(`adb connect ${connectionString}`, { stdio: 'inherit' });
        logger.info('✅ Connected. Ensure you have accepted the "Always allow from this computer" prompt on the device.');
      } catch (error) {
        logger.error(`❌ Failed to connect to Android device at ${targetIp}. Ensure Wireless Debugging is ON.`);
      }
    } else {
      logger.info(`🚀 Dispatching remote Linux/RPi installation to ${targetIp}...`);
      try {
        const scriptPath = path.join(rootDir, 'scripts', 'install-remote.sh');
        execSync(`bash ${scriptPath} ${targetIp}`, { stdio: 'inherit' });
      } catch (error) {
        logger.error(`❌ Remote installation to ${targetIp} failed. Check network and SSH keys.`);
      }
    }
  }

  @Option({
    flags: '-a, --android',
    description: 'Install/Connect to an Android device via IP',
  })
  parseAndroid(): boolean {
    return true;
  }
}