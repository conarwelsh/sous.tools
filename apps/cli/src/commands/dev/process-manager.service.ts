import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { spawn, ChildProcess, execSync } from 'child_process';
import treeKill from 'tree-kill';
import { localConfig } from '@sous/config';
import { logger } from '@sous/logger';
import { EventEmitter } from 'events';

export type ProcessStatus = 'running' | 'starting' | 'stopped' | 'error';

export interface ManagedLog {
  id: string;
  name: string;
  message: string;
  timestamp: Date;
  level: 'info' | 'error' | 'warn';
}

export interface ManagedProcess {
  id: string;
  name: string;
  type: 'app' | 'docker';
  framework: 'tauri' | 'nextjs' | 'nestjs' | 'native' | 'vite';
  status: ProcessStatus;
  port?: number;
  logs: ManagedLog[];
  child?: ChildProcess;
  autoStart?: boolean;
  timeout?: NodeJS.Timeout;
  target?: 'web' | 'android' | 'ios' | 'linux';
  emulatorName?: string;
}

@Injectable()
export class ProcessManager extends EventEmitter implements OnModuleDestroy {
  private processes: Map<string, ManagedProcess> = new Map();
  private combinedLogs: ManagedLog[] = [];
  private pnpmPath: string = 'pnpm';

  constructor() {
    super();
    this.resolvePnpm();
    this.initProcesses();
  }

  private resolvePnpm() {
    try {
      this.pnpmPath = execSync('which pnpm').toString().trim();
    } catch (e) {
      this.pnpmPath = 'pnpm';
    }
  }

  async onModuleDestroy() {
    await this.stopAll();
  }

  private initProcesses() {
    const apps: Partial<ManagedProcess>[] = [
      {
        id: 'api',
        name: 'API',
        type: 'app',
        framework: 'nestjs',
        port: localConfig.api.port,
        autoStart: true,
      },
      {
        id: 'web',
        name: 'Web',
        type: 'app',
        framework: 'nextjs',
        port: localConfig.web.port,
        autoStart: true,
      },
      {
        id: 'docs',
        name: 'Docs',
        type: 'app',
        framework: 'nextjs',
        port: localConfig.docs.port,
        autoStart: true,
      },
      {
        id: 'native',
        name: 'Native',
        type: 'app',
        framework: 'tauri',
        port: localConfig.native.port,
        target: 'android',
        emulatorName: 'sdk_gphone64_x86_64',
      },
      {
        id: 'headless',
        name: 'Signage',
        type: 'app',
        framework: 'tauri',
        port: localConfig.headless.port,
        target: 'linux',
      },
      {
        id: 'kds',
        name: 'KDS',
        type: 'app',
        framework: 'tauri',
        port: localConfig.kds.port,
        target: 'android',
        emulatorName: 'sdk_gphone64_x86_64',
      },
      {
        id: 'pos',
        name: 'POS',
        type: 'app',
        framework: 'tauri',
        port: localConfig.pos.port,
        target: 'android',
        emulatorName: 'sdk_gphone64_x86_64',
      },
      {
        id: 'wearos',
        name: 'WearOS',
        type: 'app',
        framework: 'native',
        target: 'android',
        emulatorName: 'wear_os_emulator', // Typical name, will be detected if running
      },
      {
        id: 'db',
        name: 'Postgres',
        type: 'docker',
        framework: 'vite', // Placeholder for docker
        status: 'running',
      },
      {
        id: 'redis',
        name: 'Redis',
        type: 'docker',
        framework: 'vite', // Placeholder for docker
        status: 'running',
      },
    ];

    for (const app of apps) {
      this.processes.set(app.id!, {
        ...app,
        status: app.status || 'stopped',
        logs: [],
      } as ManagedProcess);
    }
  }

  getProcesses() {
    return Array.from(this.processes.values());
  }

  getCombinedLogs() {
    return this.combinedLogs;
  }

  async autoStartCore() {
    // 1. Start Docker infra first
    try {
      this.addLog('db', '🐳 Starting Docker infrastructure...', 'info');
      execSync('pnpm run db:up', { stdio: 'ignore' });
      this.processes.get('db')!.status = 'running';
      this.processes.get('redis')!.status = 'running';
      this.emit('update');
    } catch (e) {
      this.addLog('db', '❌ Failed to start Docker infrastructure', 'error');
    }

    // 2. Start core apps
    const coreApps = this.getProcesses().filter((p) => p.autoStart);
    for (const app of coreApps) {
      this.startProcess(app.id);
    }
  }

  async startProcess(id: string) {
    const proc = this.processes.get(id);
    if (
      !proc ||
      proc.status === 'running' ||
      proc.status === 'starting' ||
      proc.type === 'docker'
    )
      return;

    proc.status = 'starting';
    this.emit('update');

    // Map internal ID to actual monorepo package names if they differ
    const packageMap: Record<string, string> = {
      api: '@sous/api',
      web: '@sous/web',
      docs: '@sous/docs',
      native: '@sous/native',
      headless: '@sous/signage',
      kds: '@sous/native-kds',
      pos: '@sous/native-pos',
      wearos: '@sous/wearos',
    };

    const filter = packageMap[id] || `@sous/${id}`;

    // Handle Android-specific requirements (Emulator + Path Sanitization)
    if (proc.target === 'android') {
      await this.setupAndroidEnvironment(id, proc);
    }

    const env = { ...process.env };
    if (proc.target === 'android') {
      env.PATH = (process.env.PATH || '')
        .split(':')
        .filter((p) => !p.startsWith('/mnt/c'))
        .join(':');
      env.ANDROID_HOME = `${process.env.HOME}/Android/Sdk`;
      env.NDK_HOME = `${env.ANDROID_HOME}/ndk/29.0.13846066`;
    }

    let args: string[] = [];
    
    if (proc.framework === 'tauri' && proc.target === 'android') {
      args = ['--filter', filter, 'run', 'tauri', 'android', 'dev', '--no-dev-server-wait'];
      if (proc.emulatorName) args.push(proc.emulatorName);
    } else if (proc.framework === 'tauri' && proc.target === 'linux') {
      args = ['--filter', filter, 'run', 'tauri', 'dev'];
    } else {
      args = ['--filter', filter, 'run', 'dev'];
    }

    const child = spawn(this.pnpmPath, args, {
      shell: true,
      env: {
        ...env,
        PORT: proc.port?.toString(),
        SOUS_JSON_LOGS: 'true',
        FORCE_COLOR: '1',
        WEBKIT_DISABLE_COMPOSITING_MODE: '1',
        LIBGL_ALWAYS_SOFTWARE: '1',
        WEBKIT_FORCE_SANDBOX: '0',
        GDK_SCALE: '1',
        GDK_DPI_SCALE: '1',
      },
    });

    proc.child = child;

    child.stdout?.on('data', (data) => {
      this.addLog(id, data.toString(), 'info');
    });

    child.stderr?.on('data', (data) => {
      this.addLog(id, data.toString(), 'error');
    });

    child.on('exit', (code) => {
      if (proc.timeout) clearTimeout(proc.timeout);
      proc.status = code === 0 ? 'stopped' : 'error';
      proc.child = undefined;
      this.emit('update');
    });

    proc.timeout = setTimeout(() => {
      if (proc.status === 'starting') {
        proc.status = 'running';
        this.emit('update');
      }
    }, 3000);
  }

  private async setupAndroidEnvironment(id: string, proc: ManagedProcess) {
    try {
      this.addLog(id, '🔍 Checking Android environment...', 'info');

      // Try to ensure Windows ADB server is running with -a (all interfaces)
      spawn(
        'powershell.exe',
        [
          '-Command',
          "Start-Process adb -ArgumentList '-a nodaemon server start' -NoNewWindow -ErrorAction SilentlyContinue",
        ],
        { stdio: 'ignore' },
      );

      // Check for emulator online
      const { exec } = await import('child_process');
      const checkDevices = () =>
        new Promise<string>((resolve) => {
          exec('adb devices', (_err, stdout) => resolve(stdout));
        });

      let devices = await checkDevices();

      if (!devices.includes('\tdevice') && proc.emulatorName) {
        this.addLog(id, `🚀 Launching emulator: ${proc.emulatorName}...`, 'info');
        const emulatorPath =
          '/mnt/c/Users/conar/AppData/Local/Android/Sdk/emulator/emulator.exe';
        spawn(emulatorPath, ['-avd', proc.emulatorName, '-no-snapshot-load'], {
          detached: true,
          stdio: 'ignore',
        }).unref();

        this.addLog(id, '⏳ Waiting for emulator to boot...', 'info');
        let attempts = 0;
        while (!devices.includes('\tdevice') && attempts < 30) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          devices = await checkDevices();
          attempts++;
        }

        if (devices.includes('\tdevice')) {
          this.addLog(id, '✅ Emulator is online.', 'info');
        } else {
          this.addLog(id, '⚠️ Emulator boot timeout.', 'warn');
        }
      }
    } catch (e) {
      this.addLog(
        id,
        '⚠️ Failed to check/launch emulator automatically.',
        'warn',
      );
    }
  }

  async stopProcess(id: string) {
    const proc = this.processes.get(id);
    if (!proc || proc.type === 'docker') return;

    if (proc.timeout) clearTimeout(proc.timeout);

    if (!proc.child || !proc.child.pid) {
      proc.status = 'stopped';
      this.emit('update');
      return;
    }

    return new Promise<void>((resolve) => {
      treeKill(proc.child!.pid!, 'SIGKILL', () => {
        proc.status = 'stopped';
        proc.child = undefined;
        this.emit('update');
        resolve();
      });
    });
  }

  async stopAll() {
    const procs = this.getProcesses().filter((p) => p.type === 'app');
    await Promise.all(procs.map((p) => this.stopProcess(p.id)));
  }

  async restartProcess(id: string) {
    await this.stopProcess(id);
    await this.startProcess(id);
  }

  clearLogs(id?: string) {
    if (id === 'combined' || !id) {
      this.combinedLogs = [];
    } else {
      const proc = this.processes.get(id);
      if (proc) {
        proc.logs = [];
      }
    }
    this.emit('update');
  }

  private addLog(
    id: string,
    rawMessage: string,
    defaultLevel: 'info' | 'error' | 'warn',
  ) {
    const proc = this.processes.get(id);
    if (!proc) return;

    const lines = rawMessage.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let message = trimmed;
      let level = defaultLevel;
      let timestamp = new Date();
      let name = proc.name;

      try {
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          const json = JSON.parse(trimmed);
          message = json.msg || json.message || trimmed;
          level = this.mapPinoLevel(json.level) || defaultLevel;
          if (json.time) timestamp = new Date(json.time);
          if (json.name) name = json.name.replace('@sous/', '').toUpperCase();
        } else {
          message = trimmed.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
        }
      } catch (e) {
        message = trimmed.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
      }

      const logEntry: ManagedLog = { id, name, message, timestamp, level };

      proc.logs.push(logEntry);
      if (proc.logs.length > 1000) proc.logs.shift();

      this.combinedLogs.push(logEntry);
      if (this.combinedLogs.length > 2000) this.combinedLogs.shift();

      // Also pipe to the central God View file via @sous/logger
      // We skip this if the message was already parsed as JSON (since the app itself likely logged it to the file)
      if (!trimmed.startsWith('{')) {
        const logFn = (logger as any)[level] || logger.info;
        logFn.call(logger, { name: `@sous/${id}` }, message);
      }
    }

    this.emit('update');
  }

  private mapPinoLevel(
    level: number | string,
  ): 'info' | 'error' | 'warn' | undefined {
    if (typeof level === 'number') {
      if (level >= 50) return 'error';
      if (level >= 40) return 'warn';
      if (level >= 30) return 'info';
    }
    if (typeof level === 'string') {
      const l = level.toLowerCase();
      if (l.includes('err')) return 'error';
      if (l.includes('warn')) return 'warn';
      if (l.includes('info')) return 'info';
    }
    return undefined;
  }
}
