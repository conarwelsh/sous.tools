import { Command, CommandRunner, Option } from 'nest-commander';
import { SyncCommand } from './sync.command.js';
import { InstallCommand } from './install.command.js';
import { spawn, execSync } from 'child_process';
import React from 'react';
import { render } from 'ink';
import { Dashboard } from './ui/dashboard.js';
import { ProcessManager } from './process-manager.service.js';
import { Inject } from '@nestjs/common';
import { logger } from '@sous/logger';

interface DevOptions {
  sync?: boolean;
  android?: boolean;
  ios?: boolean;
  wear?: boolean;
  kiosks?: boolean;
  headless?: boolean;
  json?: boolean;
}

@Command({
  name: 'dev',
  description: 'Manage development environment',
  subCommands: [InstallCommand, SyncCommand],
})
export class DevToolsCommand extends CommandRunner {
  constructor(
    @Inject(ProcessManager) private readonly manager: ProcessManager,
  ) {
    super();
  }

  async run(passedParam: string[], options?: DevOptions): Promise<void> {
    if (options?.sync) {
      logger.info('🔄 Syncing hardware before starting...');
      execSync('pnpm sous dev sync', { stdio: 'inherit' });
    }

    if (options?.headless) {
      if (options?.json) {
        const processes = this.manager.getProcesses().map(p => ({
          id: p.id,
          name: p.name,
          status: p.status,
          port: p.port,
        }));
        console.log(JSON.stringify(processes, null, 2));
        process.exit(0);
      }

      logger.info('🚀 Starting Sous Dev Tools in HEADLESS mode...');
      await this.manager.autoStartCore();

      if (options?.kiosks) {
        const kiosks = ['pos', 'kds', 'signage', 'tools-app', 'wearos'];
        for (const id of kiosks) {
          void this.manager.startProcess(id);
        }
      }

      logger.info('✅ Services orchestrated. Monitoring processes in PM2...');
      // Keep process alive but don't render UI
      return new Promise(() => {});
    }

    if (options?.kiosks) {
      logger.info('🚀 Launching all Kiosk Emulators & Services...');

      // Auto-start core services first (Docker, API, Web, Docs)
      await this.manager.autoStartCore();

      // Start Kiosk specific processes
      const kiosks = ['pos', 'kds', 'signage', 'tools-app', 'wearos'];
      for (const id of kiosks) {
        void this.manager.startProcess(id);
      }

      this.renderDashboard();
      return;
    }

    if (options?.wear) {
      logger.info('⌚ Starting Wear OS Development loop for @sous/wearos...');

      const winIp = execSync("ip route show default | awk '{print $3}'")
        .toString()
        .trim();
      const adbEnv = { ...process.env, ADB_SERVER_SOCKET: `tcp:${winIp}:5037` };

      const resolveSerial = () => {
        try {
          const stdout = execSync('adb devices', { env: adbEnv }).toString();
          const devices = stdout
            .split('\n')
            .filter((line) => line.includes('\tdevice'))
            .map((line) => line.split('\t')[0]);
          for (const s of devices) {
            const model = execSync(
              `adb -s ${s} shell getprop ro.product.model`,
              { env: adbEnv },
            )
              .toString()
              .trim();
            if (model.toLowerCase().includes('sdk_gwear')) return s;
          }
        } catch (e) {}
        return null;
      };

      const serial = resolveSerial() || 'emulator-5554';

      // Sanitized path for Android build tools
      const sanitizedPath = process.env.PATH?.split(':')
        .filter((p) => !p.startsWith('/mnt/c'))
        .join(':');

      const child = spawn('./gradlew', [':apps:wearos:installDebug'], {
        stdio: 'inherit',
        cwd: process.cwd(), // Root of monorepo
        shell: false,
        env: {
          ...process.env,
          PATH: sanitizedPath,
          ANDROID_HOME: `${process.env.HOME}/Android/Sdk`,
          ANDROID_SERIAL: serial,
        },
      });

      child.on('error', (err) => {
        logger.error(`❌ Failed to start Wear OS build: ${err.message}`);
      });

      child.on('exit', (code) => {
        if (code === 0) {
          logger.info(`✅ Build successful. Launching on device ${serial}...`);
          try {
            execSync(
              `adb -s ${serial} shell monkey -p com.sous.wearos -c android.intent.category.LAUNCHER 1`,
              { stdio: 'inherit', env: adbEnv },
            );
          } catch (e) {
            logger.error('❌ Failed to launch app on device.');
          }
        }
      });
      return;
    }

    if (options?.android) {
      logger.info(
        '🤖 Starting Android Development loop for @sous/web via Capacitor...',
      );

      const avdName = 'Pixel 9';
      const modelName = 'sdk_gphone64';

      // 1. Check if emulator is running
      try {
        const winIp = execSync("ip route show default | awk '{print $3}'")
          .toString()
          .trim();
        const adbEnv = {
          ...process.env,
          ADB_SERVER_SOCKET: `tcp:${winIp}:5037`,
        };

        const resolveSerial = () => {
          try {
            const stdout = execSync('adb devices', { env: adbEnv }).toString();
            const devices = stdout
              .split('\n')
              .filter((line) => line.includes('\tdevice'))
              .map((line) => line.split('\t')[0]);
            for (const s of devices) {
              const model = execSync(
                `adb -s ${s} shell getprop ro.product.model`,
                { env: adbEnv },
              )
                .toString()
                .trim();
              if (model.toLowerCase().includes(modelName.toLowerCase()))
                return s;
            }
          } catch (e) {}
          return null;
        };

        let serial = resolveSerial();

        if (!serial) {
          logger.info(
            `🚀 No emulator detected for "${modelName}". Launching "${avdName}"...`,
          );

          const emulatorExe =
            'C:\\Users\\conar\\AppData\\Local\\Android\\Sdk\\emulator\\emulator.exe';
          const cmd = 'cmd.exe';
          const args = [
            '/c',
            'start',
            '/b',
            emulatorExe,
            '-avd',
            avdName,
            '-no-snapshot-load',
          ];

          spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();

          logger.info('⏳ Waiting for emulator to boot...');
          let attempts = 0;
          while (!serial && attempts < 30) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            serial = resolveSerial();
            attempts++;
          }
        }

        if (serial) {
          logger.info(`✅ Emulator ${serial} is online.`);

          const localIp = execSync("hostname -I | awk '{print $1}'")
            .toString()
            .trim();
          const sanitizedPath = process.env.PATH?.split(':')
            .filter((p) => !p.startsWith('/mnt/c'))
            .join(':');

          logger.info(
            '👨‍🍳 Prepping the kitchen for Android build via Capacitor...',
          );

          const child = spawn(
            'pnpm',
            ['--filter', '@sous/web', 'run', 'cap:run:android'],
            {
              stdio: 'inherit',
              shell: false,
              env: {
                ...process.env,
                PATH: sanitizedPath,
                ANDROID_HOME: `${process.env.HOME}/Android/Sdk`,
                CAPACITOR_LIVE_RELOAD_URL: `http://${localIp}:3000`,
                ANDROID_SERIAL: serial,
              },
            },
          );

          child.on('error', (err) => {
            logger.error(`❌ Failed to start Android build: ${err.message}`);
          });

          return new Promise((resolve) => {
            child.on('exit', (code) => {
              if (code !== 0) {
                process.exit(code ?? 1);
              }
              resolve();
            });
          });
        } else {
          logger.warn('⚠️ Emulator boot timeout.');
        }
      } catch (e) {
        logger.warn('⚠️  Could not check/launch emulator automatically.', e);
      }
    }

    if (options?.ios) {
      logger.info(
        '🍎 Starting iOS Development loop for @sous/web via Capacitor...',
      );
      execSync('pnpm --filter @sous/web run cap:run:ios', { stdio: 'inherit' });
      return;
    }

    if (
      !options?.sync &&
      !options?.android &&
      !options?.ios &&
      !options?.kiosks
    ) {
      // Clear screen and enter alt buffer
      process.stdout.write('\x1b[?1049h');
      process.stdout.write('\x1b[2J\x1b[0f');

      logger.info('🚀 Starting Sous Dev Tools (Ink TUI)...');

      // Auto-start core services
      this.manager.autoStartCore();

      this.renderDashboard();
    }
  }

  private async renderDashboard() {
    // Render the Ink TUI
    const { waitUntilExit } = render(
      React.createElement(Dashboard, { manager: this.manager }),
    );

    try {
      await waitUntilExit();
    } finally {
      // Restore terminal buffer immediately before cleanup logs
      process.stdout.write('\x1b[?1049l');

      logger.info('👋 Shutting down managed processes...');
      await this.manager.stopAll();

      logger.info('✅ Cleanup complete. Goodbye!');
      process.exit(0); // Force exit to prevent hanging from lingering emitters/timers
    }
  }

  @Option({
    flags: '-k, --kiosks',
    description: 'Start all kiosk emulators and signage services',
  })
  parseKiosks(): boolean {
    return true;
  }

  @Option({
    flags: '-s, --sync',
    description: 'Sync environment before starting',
  })
  parseSync(): boolean {
    return true;
  }

  @Option({
    flags: '-a, --android',
    description: 'Start native Android development',
  })
  parseAndroid(): boolean {
    return true;
  }

  @Option({
    flags: '-i, --ios',
    description: 'Start native iOS development',
  })
  parseIos(): boolean {
    return true;
  }

  @Option({
    flags: '-w, --wear',
    description: 'Start Wear OS development',
  })
  parseWear(): boolean {
    return true;
  }

  @Option({
    flags: '--headless',
    description: 'Run in headless mode without TUI',
  })
  parseHeadless(): boolean {
    return true;
  }

  @Option({
    flags: '--json',
    description: 'Output machine-readable JSON',
  })
  parseJson(): boolean {
    return true;
  }
}
