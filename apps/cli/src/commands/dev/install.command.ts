import { logger } from '@sous/logger';
import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { execSync } from 'child_process';
import { ShellInstallCommand } from './shell-install.command.js';

interface InstallOptions {
  android?: boolean;
}

@SubCommand({ 
  name: 'install', 
  description: 'Install dependencies on a remote or local device',
  subCommands: [ShellInstallCommand]
})
export class InstallCommand extends CommandRunner {
  async run(
    passedParam: string[],
    options?: InstallOptions,
  ): Promise<void> {
    if (passedParam.length > 0 && ['shell'].includes(passedParam[0])) {
      return;
    }

    const targetIp = passedParam[0];
    
    if (!targetIp) {
      logger.info('Detecting role as Developer Workstation...');
      try {
        execSync('bash scripts/install-dev.sh', { stdio: 'inherit' });
      } catch (error) {
        logger.error('❌ Local installation failed.');
      }
      return;
    }

    if (options?.android) {
      logger.info(`📱 Connecting to Android device at ${targetIp} via ADB...`);
      try {
        // adb connect usually requires the port (default 5555)
        const connectionString = targetIp.includes(':') ? targetIp : `${targetIp}:5555`;
        execSync(`adb connect ${connectionString}`, { stdio: 'inherit' });
        logger.info('✅ Connected. Ensure you have accepted the "Always allow from this computer" prompt on the device.');
      } catch (error) {
        logger.error(`❌ Failed to connect to Android device at ${targetIp}. Ensure Wireless Debugging is ON.`);
      }
    } else {
      logger.info(`🚀 Dispatching remote Linux/RPi installation to ${targetIp}...`);
      try {
        execSync(`bash scripts/install-remote.sh ${targetIp}`, { stdio: 'inherit' });
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