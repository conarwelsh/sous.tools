import { Command, CommandRunner, Option } from 'nest-commander';
import { execSync } from 'child_process';

interface InstallOptions {
  android?: boolean;
}

@Command({ 
  name: 'install', 
  description: 'Install dependencies on a remote or local device' 
})
export class InstallCommand extends CommandRunner {
  async run(
    passedParam: string[],
    options?: InstallOptions,
  ): Promise<void> {
    const targetIp = passedParam[0];
    
    if (!targetIp) {
      console.log('Detecting role as Developer Workstation...');
      try {
        execSync('bash scripts/install-dev.sh', { stdio: 'inherit' });
      } catch (error) {
        console.error('❌ Local installation failed.');
      }
      return;
    }

    if (options?.android) {
      console.log(`📱 Connecting to Android device at ${targetIp} via ADB...`);
      try {
        // adb connect usually requires the port (default 5555)
        const connectionString = targetIp.includes(':') ? targetIp : `${targetIp}:5555`;
        execSync(`adb connect ${connectionString}`, { stdio: 'inherit' });
        console.log('✅ Connected. Ensure you have accepted the "Always allow from this computer" prompt on the device.');
      } catch (error) {
        console.error(`❌ Failed to connect to Android device at ${targetIp}. Ensure Wireless Debugging is ON.`);
      }
    } else {
      console.log(`🚀 Dispatching remote Linux/RPi installation to ${targetIp}...`);
      try {
        execSync(`bash scripts/install-remote.sh ${targetIp}`, { stdio: 'inherit' });
      } catch (error) {
        console.error(`❌ Remote installation to ${targetIp} failed. Check network and SSH keys.`);
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
