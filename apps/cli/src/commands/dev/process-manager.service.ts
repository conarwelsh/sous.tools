import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { spawn, ChildProcess, execSync } from 'child_process';
import treeKill from 'tree-kill';
import { localConfig } from '@sous/config';
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
  status: ProcessStatus;
  port?: number;
  logs: ManagedLog[];
  child?: ChildProcess;
  autoStart?: boolean;
  timeout?: NodeJS.Timeout;
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
      { id: 'api', name: 'API', type: 'app', port: localConfig.api.port as number, autoStart: true },
      { id: 'web', name: 'Web', type: 'app', port: localConfig.web.port as number, autoStart: true },
      { id: 'docs', name: 'Docs', type: 'app', port: localConfig.docs.port as number, autoStart: true },
      { id: 'native', name: 'Native', type: 'app', port: localConfig.native.port as number },
      { id: 'headless', name: 'Signage', type: 'app', port: localConfig.headless.port as number },
      { id: 'kds', name: 'KDS', type: 'app', port: localConfig.kds.port as number },
      { id: 'pos', name: 'POS', type: 'app', port: localConfig.pos.port as number },
      { id: 'wearos', name: 'WearOS', type: 'app' },
      { id: 'db', name: 'Postgres', type: 'docker', status: 'running' },
      { id: 'redis', name: 'Redis', type: 'docker', status: 'running' },
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
    const coreApps = this.getProcesses().filter(p => p.autoStart);
    for (const app of coreApps) {
      this.startProcess(app.id);
    }
  }

  async startProcess(id: string) {
    const proc = this.processes.get(id);
    if (!proc || proc.status === 'running' || proc.status === 'starting' || proc.type === 'docker') return;

    proc.status = 'starting';
    this.emit('update');

    const child = spawn(this.pnpmPath, ['--filter', `@sous/${id}`, 'run', 'dev'], {
      shell: true,
      env: { 
        ...process.env, 
        PORT: proc.port?.toString(),
        SOUS_JSON_LOGS: 'true',
        FORCE_COLOR: '1'
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
    const procs = this.getProcesses().filter(p => p.type === 'app');
    await Promise.all(procs.map(p => this.stopProcess(p.id)));
  }

  async restartProcess(id: string) {
    await this.stopProcess(id);
    await this.startProcess(id);
  }

  private addLog(id: string, rawMessage: string, defaultLevel: 'info' | 'error' | 'warn') {
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
    }

    this.emit('update');
  }

  private mapPinoLevel(level: number | string): 'info' | 'error' | 'warn' | undefined {
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
