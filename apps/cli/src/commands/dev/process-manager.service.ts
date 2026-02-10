import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { spawn, ChildProcess, exec } from 'child_process';
import treeKill from 'tree-kill';
import { resolveConfig, config } from '@sous/config';
import { logger } from '@sous/logger';
import { EventEmitter } from 'events';
import { promisify } from 'util';
import pm2 from 'pm2';
import path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

export type ProcessStatus =
  | 'running'
  | 'starting'
  | 'stopped'
  | 'error'
  | 'building';

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
  type: 'app' | 'docker' | 'pm2';
  framework: 'nextjs' | 'nestjs' | 'native' | 'vite';
  status: ProcessStatus;
  port?: number;
  logs: ManagedLog[];
  child?: ChildProcess;
  autoStart?: boolean;
  timeout?: NodeJS.Timeout;
  target?: 'web' | 'android' | 'ios' | 'linux';
  emulatorName?: string;
  emulatorPort?: number;
  isService?: boolean;
}

@Injectable()
export class ProcessManager
  extends EventEmitter
  implements OnModuleDestroy, OnModuleInit
{
  private processes: Map<string, ManagedProcess> = new Map();
  private combinedLogs: ManagedLog[] = [];
  private pnpmPath: string = 'pnpm';
  private lastBridgeCheck: { time: number; result: boolean } | null = null;
  private lastAgentLogCheck: number = 0;
  private remoteEnv: Record<string, string> = {};
  private pollIntervals: NodeJS.Timeout[] = [];

  constructor() {
    super();
  }

  async onModuleInit() {
    const config = await resolveConfig();
    this.initProcesses(config);
    await this.resolvePnpm();
    await this.connectPm2();
  }

  startPolling() {
    // Start polling status and agent logs
    this.pollIntervals.push(
      setInterval(() => {
        void this.updatePm2Statuses();
      }, 5000),
    );
    this.pollIntervals.push(
      setInterval(() => {
        void this.pollAgentLogs();
      }, 3000),
    );
  }

  stopPolling() {
    this.pollIntervals.forEach(clearInterval);
    this.pollIntervals = [];
  }

  private async connectPm2(): Promise<void> {
    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) {
          logger.error(`❌ Failed to connect to PM2: ${err.message}`);
          reject(err);
        } else {
          logger.info('✅ Connected to PM2');

          // Launch Log Bus
          pm2.launchBus((err, bus) => {
            if (err) return;
            bus.on('log:out', (data: any) => {
              const id = data.process.name.replace('sous-', '');
              if (this.processes.has(id)) {
                this.addLog(id, data.data, 'info');
              }
            });
            bus.on('log:err', (data: any) => {
              const id = data.process.name.replace('sous-', '');
              if (this.processes.has(id)) {
                this.addLog(id, data.data, 'error');
              }
            });
          });
          resolve();
        }
      });
    });
  }

  private async pollAgentLogs() {
    try {
      const winIp = await this.getWindowsIp();
      if (!winIp) return;
      const resp = await fetch(`http://${winIp}:4040/logs`);
      if (!resp.ok) return;
      const data = await resp.json();
      if (data.logs && data.logs.length > 0) {
        for (const log of data.logs) {
          // Check if log is new to avoid duplication if agent sends full history
          // Simple heuristic: agents usually send since last fetch
          this.addLog('agent', `[AGENT] ${log.message}`, log.level || 'info');
        }
      }
    } catch (e) {
      // Agent likely not running, ignore
    }
  }

  private async updatePm2Statuses() {
    // 1. Check Windows Agent
    try {
      const winIp = await this.getWindowsIp();
      const agentProc = this.processes.get('agent');
      if (winIp && agentProc) {
        const resp = await fetch(`http://${winIp}:4040`).catch(() => null);
        agentProc.status = resp?.ok ? 'running' : 'stopped';
      } else if (agentProc) {
        agentProc.status = 'stopped';
      }
    } catch (e) {
      const agentProc = this.processes.get('agent');
      if (agentProc) agentProc.status = 'stopped';
    }

    // 2. Check PM2 processes
    pm2.list((err, list) => {
      if (err) return;
      let updated = false;
      for (const p of list) {
        const id = p.name?.replace('sous-', '');
        const proc = id ? this.processes.get(id) : null;
        if (proc && proc.type === 'pm2') {
          const pm2Status = p.pm2_env?.status;
          if (pm2Status !== 'online') {
            proc.status = 'stopped';
            updated = true;
          } else if (proc.status === 'stopped') {
            proc.status = 'running';
            updated = true;
          }
        }
      }
      if (updated) this.emit('update');
    });
  }

  private async resolvePnpm() {
    try {
      const { stdout } = await execAsync('which pnpm');
      this.pnpmPath = stdout.trim();
    } catch (e) {
      this.pnpmPath = 'pnpm';
    }
  }

  async onModuleDestroy() {
    await this.stopAll();
    pm2.disconnect();
  }

  private initProcesses(config: any) {
    const apps: Partial<ManagedProcess>[] = [
      {
        id: 'api',
        name: 'API',
        type: 'pm2',
        framework: 'nestjs',
        port: config.api.port,
        autoStart: true,
        isService: true,
      },
      {
        id: 'web',
        name: 'Web',
        type: 'pm2',
        framework: 'nextjs',
        port: config.web.port,
        autoStart: true,
        isService: true,
      },
      {
        id: 'docs',
        name: 'Docs',
        type: 'pm2',
        framework: 'nextjs',
        port: config.docs.port,
        autoStart: true,
        isService: true,
      },
      {
        id: 'wearos',
        name: 'WearOS',
        type: 'pm2',
        framework: 'native',
        target: 'android',
        emulatorName: 'Wear_OS_Large_Round',
        emulatorPort: 5562,
        autoStart: false,
        isService: true,
      },
      {
        id: 'pos',
        name: 'POS',
        type: 'pm2',
        framework: 'nextjs',
        target: 'android',
        emulatorName: 'Pixel_Tablet',
        emulatorPort: 5556,
        autoStart: false,
        isService: true,
      },
      {
        id: 'kds',
        name: 'KDS',
        type: 'pm2',
        framework: 'nextjs',
        target: 'android',
        emulatorName: 'Medium_Desktop',
        emulatorPort: 5560,
        autoStart: false,
        isService: true,
      },
      {
        id: 'signage',
        name: 'Signage (TV)',
        type: 'pm2',
        framework: 'nextjs',
        target: 'android',
        emulatorName: 'Television_1080p',
        emulatorPort: 5554,
        autoStart: false,
        isService: true,
      },
      {
        id: 'tools-app',
        name: 'Tools (Mobile)',
        type: 'pm2',
        framework: 'nextjs',
        target: 'android',
        emulatorName: 'Pixel_9',
        emulatorPort: 5558,
        autoStart: false,
        isService: true,
      },
      {
        id: 'db',
        name: 'Postgres',
        type: 'docker',
        framework: 'vite',
        status: 'running',
      },
      {
        id: 'redis',
        name: 'Redis',
        type: 'docker',
        framework: 'vite',
        status: 'running',
      },
      {
        id: 'agent',
        name: 'Windows Agent',
        type: 'docker',
        framework: 'vite',
        status: 'stopped',
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
    try {
      this.addLog(
        'db',
        '🐳 Ensuring Docker infrastructure is running...',
        'info',
      );

      // Check if docker daemon is running
      try {
        await execAsync('docker info');
      } catch (e) {
        this.addLog(
          'db',
          '❌ Docker daemon is not running. Please start Docker.',
          'error',
        );
        return;
      }

      await execAsync('docker compose up -d');

      const dbProc = this.processes.get('db');
      const redisProc = this.processes.get('redis');
      if (dbProc) dbProc.status = 'running';
      if (redisProc) redisProc.status = 'running';

      this.streamDockerLogs('db', 'sous-postgres');
      this.streamDockerLogs('redis', 'sous-redis');

      // Start PM2 core services
      const coreApps = this.getProcesses().filter(
        (p) => p.type === 'pm2' && p.autoStart,
      );
      for (const app of coreApps) {
        await this.startProcess(app.id);
      }

      this.emit('update');
    } catch (e: any) {
      this.addLog('db', `❌ Auto-start failed: ${e.message}`, 'error');
    }
  }

  private streamDockerLogs(id: string, containerName: string) {
    const proc = this.processes.get(id);
    if (!proc) return;
    if (proc.child) return; // Already streaming

    const child = spawn('docker', ['logs', '-f', '--tail=50', containerName]);
    proc.child = child;
    child.stdout?.on('data', (data) =>
      this.addLog(id, data.toString(), 'info'),
    );
    child.stderr?.on('data', (data) =>
      this.addLog(id, data.toString(), 'error'),
    );
  }

  async startProcess(id: string) {
    const proc = this.processes.get(id);
    if (!proc || proc.status === 'running' || proc.status === 'starting')
      return;

    proc.status = 'starting';
    this.emit('update');

    if (proc.type === 'pm2') {
      const packageMap: Record<string, string> = {
        api: 'apps/api',
        web: 'apps/web',
        docs: 'apps/docs',
        wearos: 'apps/wearos',
        kds: 'apps/web',
        pos: 'apps/web',
        signage: 'apps/web',
        'tools-app': 'apps/web',
      };

      let script = 'pnpm run dev';
      // Find project root by looking for pnpm-workspace.yaml
      let rootDir = process.cwd();
      while (
        rootDir !== '/' &&
        !fs.existsSync(path.join(rootDir, 'pnpm-workspace.yaml'))
      ) {
        rootDir = path.dirname(rootDir);
      }
      const absoluteCwd = path.resolve(rootDir, packageMap[id]);

      // Inject BOTH local env and remote secrets
      const env: any = {
        ...process.env,
        ...this.remoteEnv,
        NODE_ENV: 'development',
        PORT: proc.port?.toString(),
        // Ensure specific ports are set if they were missing in remoteEnv
        PORT_API: config.api.port.toString(),
        PORT_WEB: config.web.port.toString(),
        PORT_DOCS: config.docs.port.toString(),
      };

      if (proc.target === 'android') {
        await this.setupAndroidEnvironment(id, proc);
        const winIp = await this.getWindowsIp();
        const localIp = await this.getLocalIp();
        const flavor = id === 'tools-app' ? 'tools' : id;
        const capitalizedFlavor =
          flavor.charAt(0).toUpperCase() + flavor.slice(1);
        const route =
          id === 'signage'
            ? '/signage/default'
            : id === 'tools-app'
              ? '/login'
              : `/${id}`;
        const reloadUrl = `http://${localIp}:3000${route}`;
        const adbPrefix = winIp
          ? `ADBHOST=${winIp} ADB_SERVER_SOCKET=tcp:${winIp}:5037 `
          : '';
        const appId = id === 'tools-app' ? 'com.sous.tools' : `com.sous.${id}`;
        const apkName = `app-${flavor}-debug.apk`;
        const winApkPath = `C:\\\\tools\\\\sous-agent\\\\apks\\\\${apkName}`;
        const wslApkPath = `/mnt/c/tools/sous-agent/apks/${apkName}`;
        const agentUrl = `http://${winIp}:4040`;

        if (id === 'wearos') {
          script = `bash -c "ANDROID_SERIAL=emulator-5562 ./gradlew installDebug && ${adbPrefix}adb -s emulator-5562 shell monkey -p com.sous.wearos -c android.intent.category.LAUNCHER 1"`;
        } else {
          script = `bash -c "CAPACITOR_LIVE_RELOAD_URL='${reloadUrl}' npx cap sync android && cd android && ./gradlew assemble${capitalizedFlavor}Debug --no-daemon --console=plain && mkdir -p /mnt/c/tools/sous-agent/apks && cp app/build/outputs/apk/${flavor}/debug/${apkName} ${wslApkPath} && curl -s -X POST -H 'Content-Type: application/json' -d '{\\"command\\":\\"adb\\", \\"args\\":\\"-s emulator-${proc.emulatorPort} install -r ${winApkPath}\\"}' ${agentUrl} && curl -s -X POST -H 'Content-Type: application/json' -d '{\\"command\\":\\"adb\\", \\"args\\":\\"-s emulator-${proc.emulatorPort} shell am start -n ${appId}/com.sous.tools.MainActivity\\"}' ${agentUrl}"`;
        }
      }

      return new Promise<void>((resolve) => {
        pm2.start(
          {
            name: `sous-${id}`,
            script,
            cwd: absoluteCwd,
            env,
            autorestart: id !== 'wearos' && !proc.target, // Don't autorestart mobile builds as they are install scripts
          },
          (err) => {
            if (err) {
              this.addLog(id, `❌ PM2 Start Error: ${err.message}`, 'error');
              proc.status = 'error';
            } else {
              this.addLog(id, `🚀 Started via PM2`, 'info');
              proc.status = 'running';
            }
            this.emit('update');
            resolve();
          },
        );
      });
    }
  }

  async stopProcess(id: string) {
    const proc = this.processes.get(id);
    if (!proc) return;

    if (proc.type === 'pm2') {
      return new Promise<void>((resolve) => {
        pm2.stop(`sous-${id}`, () => {
          proc.status = 'stopped';
          this.emit('update');
          resolve();
        });
      });
    }

    if (proc.child?.pid) {
      return new Promise<void>((resolve) => {
        treeKill(proc.child!.pid!, 'SIGKILL', () => {
          proc.status = 'stopped';
          proc.child = undefined;
          this.emit('update');
          resolve();
        });
      });
    }
    proc.status = 'stopped';
    this.emit('update');
  }

  async restartProcess(id: string) {
    const proc = this.processes.get(id);
    if (proc?.type === 'pm2') {
      return new Promise<void>((resolve) => {
        pm2.restart(`sous-${id}`, () => {
          this.addLog(id, '♻️ Restarted via PM2', 'info');
          resolve();
        });
      });
    }
    await this.stopProcess(id);
    await this.startProcess(id);
  }

  private async getWindowsIp() {
    try {
      const { stdout } = await execAsync(
        "ip route show default | awk '{print $3}'",
      );
      return stdout.trim();
    } catch (e) {
      return null;
    }
  }

  private async getLocalIp() {
    const { stdout } = await execAsync("hostname -I | awk '{print $1}'");
    return stdout.trim();
  }

  private async getSerialByModel(
    modelName: string,
    adbEnv: any,
    targetPort?: number,
  ): Promise<string | null> {
    try {
      const { stdout } = await execAsync('adb devices', {
        env: adbEnv,
        timeout: 5000,
      });
      const devices = stdout
        .split('\n')
        .filter((l) => l.includes('\tdevice'))
        .map((l) => l.split('\t')[0]);
      if (targetPort && devices.includes(`emulator-${targetPort}`))
        return `emulator-${targetPort}`;
      if (targetPort && devices.includes(`127.0.0.1:${targetPort}`))
        return `127.0.0.1:${targetPort}`;
      for (const serial of devices) {
        try {
          const { stdout: model } = await execAsync(
            `adb -s ${serial} shell getprop ro.product.model`,
            { env: adbEnv, timeout: 2000 },
          );
          if (
            modelName &&
            model.trim().toLowerCase().includes(modelName.toLowerCase())
          )
            return serial;
        } catch (e) {}
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  private async setupAndroidEnvironment(id: string, proc: ManagedProcess) {
    try {
      this.addLog(id, '🔍 Checking Android environment...', 'info');
      const winIp = await this.getWindowsIp();
      const adbEnv = { ...process.env };
      if (winIp) {
        adbEnv.ADBHOST = winIp;
        adbEnv.ADB_SERVER_SOCKET = `tcp:${winIp}:5037`;
      }
      const modelMap: any = {
        signage: 'Television_1080p',
        pos: 'Pixel_Tablet',
        kds: 'Medium_Desktop',
        'tools-app': 'Pixel_9',
        wearos: 'Wear_OS_Large_Round',
      };
      let serial = await this.getSerialByModel(
        modelMap[id] || '',
        adbEnv,
        proc.emulatorPort,
      );
      if (!serial && proc.emulatorName) {
        this.addLog(
          id,
          `🚀 Requesting Agent to launch: "${proc.emulatorName}"...`,
          'info',
        );
        await fetch(`http://${winIp}:4040`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            command: 'launch-emulator',
            avd: proc.emulatorName,
            port: proc.emulatorPort,
          }),
        });
        let attempts = 0;
        while (!serial && attempts < 15) {
          await new Promise((r) => setTimeout(r, 2000));
          serial = await this.getSerialByModel(
            modelMap[id] || '',
            adbEnv,
            proc.emulatorPort,
          );
          attempts++;
        }
      }
      if (serial) {
        this.addLog(id, `✅ Emulator ${serial} ready.`, 'info');
        // Ensure ADB is connected for this serial
        await execAsync(`adb connect ${winIp}:${proc.emulatorPort}`, {
          env: adbEnv,
        }).catch(() => {});
      }
    } catch (e) {
      this.addLog(id, '⚠️ Environment check failed.', 'warn');
    }
  }

  async stopAll() {
    const procs = this.getProcesses().filter(
      (p) => p.type === 'pm2' || p.type === 'app',
    );
    await Promise.all(procs.map((p) => this.stopProcess(p.id)));
  }

  clearLogs(id?: string) {
    if (id === 'combined' || !id) this.combinedLogs = [];
    else {
      const proc = this.processes.get(id);
      if (proc) proc.logs = [];
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
    const lines = rawMessage.toString().split('\n');
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

      // State Detection
      const lower = message.toLowerCase();
      if (
        lower.includes('compiling') ||
        lower.includes('building') ||
        lower.includes('starting')
      ) {
        proc.status = 'building';
      } else if (
        lower.includes('ready') ||
        lower.includes('started') ||
        lower.includes('listening') ||
        lower.includes('build successful') ||
        lower.includes('compiled successfully')
      ) {
        proc.status = 'running';
      } else if (lower.includes('error') || lower.includes('failed')) {
        // Only set error if it's not a service that's already running (some logs have "error" in them)
        if (proc.status === 'starting' || proc.status === 'building') {
          proc.status = 'error';
        }
      }

      const logEntry: ManagedLog = { id, name, message, timestamp, level };
      proc.logs.push(logEntry);
      if (proc.logs.length > 1000) proc.logs.shift();
      this.combinedLogs.push(logEntry);
      if (this.combinedLogs.length > 2000) this.combinedLogs.shift();
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
    return undefined;
  }
}
